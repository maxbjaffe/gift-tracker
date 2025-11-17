import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface BulkOperationResult {
  success: boolean;
  affected: number;
  children: string[];
  message: string;
}

/**
 * Detect if message targets multiple children
 */
export function detectBulkOperation(message: string): {
  isBulk: boolean;
  targets: 'all' | 'multiple' | 'single';
  childNames?: string[];
} {
  const lower = message.toLowerCase();

  // Check for "all" keywords
  if (
    lower.includes('all kids') ||
    lower.includes('everyone') ||
    lower.includes('both') ||
    lower.includes('all children') ||
    lower.includes('everybody')
  ) {
    return { isBulk: true, targets: 'all' };
  }

  // Check for "and" indicating multiple children
  if (lower.includes(' and ')) {
    // Try to extract child names
    // This is a simple heuristic - could be improved with AI
    const parts = message.split(/ and |,/i);
    const possibleNames = parts
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && p.length < 20);

    if (possibleNames.length > 1) {
      return {
        isBulk: true,
        targets: 'multiple',
        childNames: possibleNames,
      };
    }
  }

  return { isBulk: false, targets: 'single' };
}

/**
 * Apply consequence to all children
 */
export async function applyConsequenceToAll(
  userId: string,
  restrictionType: string,
  restrictionItem: string,
  reason: string,
  durationDays: number | null,
  severity: string = 'medium'
): Promise<BulkOperationResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get all children for this user
  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select('id, name')
    .eq('user_id', userId);

  if (childrenError || !children || children.length === 0) {
    return {
      success: false,
      affected: 0,
      children: [],
      message: 'No children found',
    };
  }

  // Create consequences for all children
  const consequences = children.map((child) => {
    const expiresAt = durationDays
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    return {
      child_id: child.id,
      restriction_type: restrictionType,
      restriction_item: restrictionItem,
      reason,
      duration_days: durationDays,
      expires_at: expiresAt,
      status: 'active',
      created_by: userId,
      severity,
    };
  });

  const { error: insertError } = await supabase.from('consequences').insert(consequences);

  if (insertError) {
    return {
      success: false,
      affected: 0,
      children: [],
      message: 'Error creating consequences',
    };
  }

  return {
    success: true,
    affected: children.length,
    children: children.map((c) => c.name),
    message: `Applied ${restrictionItem} restriction to all ${children.length} children`,
  };
}

/**
 * Apply commitment to all children
 */
export async function applyCommitmentToAll(
  userId: string,
  commitmentText: string,
  dueDate: Date,
  category: string = 'other'
): Promise<BulkOperationResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select('id, name')
    .eq('user_id', userId);

  if (childrenError || !children || children.length === 0) {
    return {
      success: false,
      affected: 0,
      children: [],
      message: 'No children found',
    };
  }

  const commitments = children.map((child) => ({
    child_id: child.id,
    commitment_text: commitmentText,
    due_date: dueDate.toISOString(),
    status: 'active',
    category,
    committed_by: userId,
  }));

  const { error: insertError } = await supabase.from('commitments').insert(commitments);

  if (insertError) {
    return {
      success: false,
      affected: 0,
      children: [],
      message: 'Error creating commitments',
    };
  }

  return {
    success: true,
    affected: children.length,
    children: children.map((c) => c.name),
    message: `Created commitment for all ${children.length} children`,
  };
}

/**
 * Lift all consequences for all children
 */
export async function liftAllConsequences(userId: string): Promise<BulkOperationResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: consequences } = await supabase
    .from('consequences')
    .select(`
      id,
      restriction_item,
      child:children!inner(id, name, user_id)
    `)
    .eq('child.user_id', userId)
    .eq('status', 'active');

  if (!consequences || consequences.length === 0) {
    return {
      success: true,
      affected: 0,
      children: [],
      message: 'No active restrictions to lift',
    };
  }

  const ids = consequences.map((c) => c.id);
  const uniqueChildren = Array.from(new Set(consequences.map((c) => c.child.name)));

  await supabase
    .from('consequences')
    .update({
      status: 'lifted',
      lifted_at: new Date().toISOString(),
      lifted_by: userId,
    })
    .in('id', ids);

  return {
    success: true,
    affected: consequences.length,
    children: uniqueChildren,
    message: `Lifted ${consequences.length} restrictions for ${uniqueChildren.join(', ')}`,
  };
}

/**
 * Mark all pending commitments as complete
 */
export async function completeAllCommitments(userId: string): Promise<BulkOperationResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: commitments } = await supabase
    .from('commitments')
    .select(`
      id,
      commitment_text,
      due_date,
      child:children!inner(id, name, user_id)
    `)
    .eq('child.user_id', userId)
    .eq('status', 'active');

  if (!commitments || commitments.length === 0) {
    return {
      success: true,
      affected: 0,
      children: [],
      message: 'No pending commitments',
    };
  }

  const now = new Date();
  const ids = commitments.map((c) => c.id);
  const uniqueChildren = Array.from(new Set(commitments.map((c) => c.child.name)));

  // Mark as completed (check if on time)
  for (const commitment of commitments) {
    const wasOnTime = now <= new Date(commitment.due_date);
    await supabase
      .from('commitments')
      .update({
        status: 'completed',
        completed_on_time: wasOnTime,
        completed_at: now.toISOString(),
      })
      .eq('id', commitment.id);
  }

  return {
    success: true,
    affected: commitments.length,
    children: uniqueChildren,
    message: `Marked ${commitments.length} commitments complete for ${uniqueChildren.join(', ')}`,
  };
}

/**
 * Apply consequence to specific children
 */
export async function applyConsequenceToMultiple(
  userId: string,
  childNames: string[],
  restrictionType: string,
  restrictionItem: string,
  reason: string,
  durationDays: number | null,
  severity: string = 'medium'
): Promise<BulkOperationResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Find children by names (fuzzy match)
  const { data: allChildren } = await supabase
    .from('children')
    .select('id, name')
    .eq('user_id', userId);

  if (!allChildren || allChildren.length === 0) {
    return {
      success: false,
      affected: 0,
      children: [],
      message: 'No children found',
    };
  }

  // Match child names (case insensitive, partial match)
  const matchedChildren = allChildren.filter((child) =>
    childNames.some((name) => child.name.toLowerCase().includes(name.toLowerCase()))
  );

  if (matchedChildren.length === 0) {
    return {
      success: false,
      affected: 0,
      children: [],
      message: `No children found matching: ${childNames.join(', ')}`,
    };
  }

  // Create consequences for matched children
  const consequences = matchedChildren.map((child) => {
    const expiresAt = durationDays
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    return {
      child_id: child.id,
      restriction_type: restrictionType,
      restriction_item: restrictionItem,
      reason,
      duration_days: durationDays,
      expires_at: expiresAt,
      status: 'active',
      created_by: userId,
      severity,
    };
  });

  const { error: insertError } = await supabase.from('consequences').insert(consequences);

  if (insertError) {
    return {
      success: false,
      affected: 0,
      children: [],
      message: 'Error creating consequences',
    };
  }

  return {
    success: true,
    affected: matchedChildren.length,
    children: matchedChildren.map((c) => c.name),
    message: `Applied ${restrictionItem} restriction to ${matchedChildren.map((c) => c.name).join(' and ')}`,
  };
}
