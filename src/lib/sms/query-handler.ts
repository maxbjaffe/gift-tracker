import { fetchConsequences, fetchCommitments, fetchChildren } from '../services/accountability';
import { extractChildName } from './message-router';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export async function handleQueryMessage(
  message: string,
  fromNumber: string
): Promise<string> {
  try {
    const normalized = message.toLowerCase();

    // Get user ID
    const userId = await getUserIdFromPhone(fromNumber);
    if (!userId) {
      return 'Your phone number is not registered. Please sign up first.';
    }

    // Handle "status" query
    if (normalized.includes('status')) {
      return await handleStatusQuery(userId, message);
    }

    // Handle "restrictions" or "consequences" query
    if (normalized.includes('restrict') || normalized.includes('consequence') || normalized.includes('grounded')) {
      return await handleConsequencesQuery(userId, message);
    }

    // Handle "commitments" query
    if (normalized.includes('commit') || normalized.includes('promise') || normalized.includes('due')) {
      return await handleCommitmentsQuery(userId, message);
    }

    // Handle "help" query
    if (normalized.includes('help')) {
      return handleHelpQuery();
    }

    // Default: show overall status
    return await handleStatusQuery(userId, message);
  } catch (error) {
    console.error('Error handling query message:', error);
    return 'Error processing query. Please try again.';
  }
}

/**
 * Handle "status" query - show overview
 */
async function handleStatusQuery(userId: string, message: string): Promise<string> {
  const childName = extractChildName(message);

  // Get all children
  const children = await fetchChildren(userId);

  if (children.length === 0) {
    return 'No children added yet. Add a child first to start tracking.';
  }

  if (childName) {
    // Show status for specific child
    const child = children.find(c => c.name.toLowerCase() === childName.toLowerCase());
    if (!child) {
      return `Child "${childName}" not found.`;
    }

    return await getChildStatus(child.id, child.name);
  }

  // Show status for all children
  let response = '📊 Family Status:\n\n';

  for (const child of children) {
    const status = await getChildStatus(child.id, child.name);
    response += status + '\n\n';
  }

  response += 'Reply with child name for details.';

  return response.trim();
}

/**
 * Get status for a specific child
 */
async function getChildStatus(childId: string, childName: string): Promise<string> {
  // Get active consequences
  const consequences = await fetchConsequences({
    childId,
    status: 'active',
  });

  // Get active commitments
  const commitments = await fetchCommitments({
    childId,
    status: 'active',
  });

  let status = `${childName}:\n`;

  if (consequences.length === 0 && commitments.length === 0) {
    status += '  No active items';
    return status;
  }

  if (consequences.length > 0) {
    status += `  🚫 ${consequences.length} restriction${consequences.length > 1 ? 's' : ''}\n`;
    consequences.forEach(c => {
      const expiresText = c.expires_at
        ? `until ${format(new Date(c.expires_at), 'MMM d')}`
        : 'indefinite';
      status += `     • ${c.restriction_item} (${expiresText})\n`;
    });
  }

  if (commitments.length > 0) {
    status += `  📝 ${commitments.length} commitment${commitments.length > 1 ? 's' : ''}\n`;
    commitments.forEach(c => {
      const dueText = format(new Date(c.due_date), 'MMM d h:mm a');
      status += `     • ${c.commitment_text} (due ${dueText})\n`;
    });
  }

  return status.trim();
}

/**
 * Handle consequences/restrictions query
 */
async function handleConsequencesQuery(userId: string, message: string): Promise<string> {
  const childName = extractChildName(message);

  const filter: any = { status: 'active' };

  if (childName) {
    const children = await fetchChildren(userId);
    const child = children.find(c => c.name.toLowerCase() === childName.toLowerCase());

    if (!child) {
      return `Child "${childName}" not found.`;
    }

    filter.childId = child.id;
  }

  const consequences = await fetchConsequences(filter);

  if (consequences.length === 0) {
    return childName
      ? `${childName} has no active restrictions.`
      : 'No active restrictions.';
  }

  let response = childName
    ? `${childName}'s Restrictions:\n\n`
    : 'Active Restrictions:\n\n';

  consequences.forEach(c => {
    const expiresText = c.expires_at
      ? `until ${format(new Date(c.expires_at), 'MMM d h:mm a')}`
      : 'manual lift only';

    response += `🚫 ${c.child?.name}: ${c.restriction_item}\n`;
    response += `   ${expiresText}\n`;
    response += `   Reason: ${c.reason}\n\n`;
  });

  return response.trim();
}

/**
 * Handle commitments query
 */
async function handleCommitmentsQuery(userId: string, message: string): Promise<string> {
  const childName = extractChildName(message);

  const filter: any = { status: 'active' };

  if (childName) {
    const children = await fetchChildren(userId);
    const child = children.find(c => c.name.toLowerCase() === childName.toLowerCase());

    if (!child) {
      return `Child "${childName}" not found.`;
    }

    filter.childId = child.id;
  }

  const commitments = await fetchCommitments(filter);

  if (commitments.length === 0) {
    return childName
      ? `${childName} has no active commitments.`
      : 'No active commitments.';
  }

  let response = childName
    ? `${childName}'s Commitments:\n\n`
    : 'Active Commitments:\n\n';

  commitments.forEach(c => {
    const dueDate = new Date(c.due_date);
    const now = new Date();
    const isPastDue = dueDate < now;
    const dueText = format(dueDate, 'MMM d h:mm a');

    response += `📝 ${c.child?.name}: ${c.commitment_text}\n`;
    response += isPastDue
      ? `   ⚠️ OVERDUE (was due ${dueText})\n`
      : `   Due: ${dueText}\n`;
    response += `   Category: ${c.category}\n\n`;
  });

  return response.trim();
}

/**
 * Handle help query
 */
function handleHelpQuery(): string {
  return `SMS Commands:\n\n` +
    `CONSEQUENCES:\n` +
    `• "No iPad 3 days Kid A"\n` +
    `• "Restrict TV Kid B until Friday"\n\n` +
    `COMMITMENTS:\n` +
    `• "Kid A will finish homework by 7pm"\n` +
    `• "I'll clean my room tonight - Kid B"\n\n` +
    `QUERIES:\n` +
    `• "Status" - overall status\n` +
    `• "What's Kid A restricted from?"\n` +
    `• "Show Kid B's commitments"\n\n` +
    `RESPONSES:\n` +
    `• CONFIRM, DONE, MISSED, LATE\n` +
    `• LIFT, EXTEND\n\n` +
    `Reply EXAMPLES for more samples.`;
}

/**
 * Get user ID from phone number
 * TODO: Implement proper phone number lookup
 */
async function getUserIdFromPhone(phoneNumber: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}
