import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export type ShortcutCommand =
  | 'status'
  | 'clear'
  | 'clear_all'
  | 'help'
  | 'stats'
  | 'summary'
  | 'active'
  | 'undo'
  | 'cancel';

/**
 * Detect if message is a shortcut command
 */
export function detectShortcut(message: string): ShortcutCommand | null {
  const lower = message.toLowerCase().trim();

  // Status shortcuts
  if (
    lower === 'status' ||
    lower === 'check' ||
    lower === 'what' ||
    lower === 'show' ||
    lower === 'list'
  ) {
    return 'status';
  }

  // Clear/lift all shortcuts
  if (
    lower === 'clear all' ||
    lower === 'lift all' ||
    lower === 'remove all' ||
    lower === 'clearall'
  ) {
    return 'clear_all';
  }

  // Clear/lift specific
  if (lower === 'clear' || lower === 'lift' || lower === 'remove') {
    return 'clear';
  }

  // Help shortcuts
  if (
    lower === 'help' ||
    lower === '?' ||
    lower === 'commands' ||
    lower === 'how' ||
    lower === 'what can i do'
  ) {
    return 'help';
  }

  // Stats shortcuts
  if (lower === 'stats' || lower === 'statistics' || lower === 'report') {
    return 'stats';
  }

  // Summary shortcuts
  if (lower === 'summary' || lower === 'overview') {
    return 'summary';
  }

  // Active items only
  if (lower === 'active' || lower === 'current') {
    return 'active';
  }

  // Undo last action
  if (lower === 'undo' || lower === 'oops' || lower === 'nevermind') {
    return 'undo';
  }

  // Cancel operation
  if (lower === 'cancel' || lower === 'stop' || lower === 'abort') {
    return 'cancel';
  }

  return null;
}

/**
 * Handle shortcut commands
 */
export async function handleShortcut(
  command: ShortcutCommand,
  userId: string,
  phoneNumber: string
): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  switch (command) {
    case 'status':
      return await handleStatusShortcut(supabase, userId);

    case 'clear_all':
      return await handleClearAllShortcut(supabase, userId);

    case 'clear':
      return 'Which restriction would you like to lift? Reply with the child name or restriction type (e.g., "iPad" or "Emma").';

    case 'help':
      return handleHelpShortcut();

    case 'stats':
      return await handleStatsShortcut(supabase, userId);

    case 'summary':
      return await handleSummaryShortcut(supabase, userId);

    case 'active':
      return await handleActiveShortcut(supabase, userId);

    case 'undo':
      return 'Undo is not yet implemented. Coming soon!';

    case 'cancel':
      return 'Operation cancelled. What would you like to do?';

    default:
      return 'Unknown command. Reply HELP for available commands.';
  }
}

/**
 * Status shortcut - show all active consequences and commitments
 */
async function handleStatusShortcut(supabase: any, userId: string): Promise<string> {
  // Get all children
  const { data: children } = await supabase
    .from('children')
    .select('id, name')
    .eq('user_id', userId);

  if (!children || children.length === 0) {
    return 'No children found. Add children in the app first.';
  }

  let response = '📊 Current Status:\n\n';

  for (const child of children) {
    // Get active consequences
    const { data: consequences } = await supabase
      .from('consequences')
      .select('restriction_item, expires_at')
      .eq('child_id', child.id)
      .eq('status', 'active');

    // Get active commitments
    const { data: commitments } = await supabase
      .from('commitments')
      .select('commitment_text, due_date')
      .eq('child_id', child.id)
      .eq('status', 'active');

    response += `👤 ${child.name}:\n`;

    if (consequences && consequences.length > 0) {
      response += `  Restrictions: ${consequences.map((c) => c.restriction_item).join(', ')}\n`;
    } else {
      response += '  No restrictions ✓\n';
    }

    if (commitments && commitments.length > 0) {
      response += `  Commitments: ${commitments.length} pending\n`;
    } else {
      response += '  No pending commitments ✓\n';
    }

    response += '\n';
  }

  return response.trim();
}

/**
 * Clear all shortcut - lift all active consequences
 */
async function handleClearAllShortcut(supabase: any, userId: string): Promise<string> {
  const { data: consequences } = await supabase
    .from('consequences')
    .select(`
      id,
      restriction_item,
      child:children!inner(name, user_id)
    `)
    .eq('child.user_id', userId)
    .eq('status', 'active');

  if (!consequences || consequences.length === 0) {
    return 'No active restrictions to clear.';
  }

  // Lift all consequences
  const ids = consequences.map((c) => c.id);
  await supabase
    .from('consequences')
    .update({
      status: 'lifted',
      lifted_at: new Date().toISOString(),
      lifted_by: userId,
    })
    .in('id', ids);

  return `✓ Lifted ${consequences.length} restrictions:\n${consequences
    .map((c) => `  • ${c.child.name}: ${c.restriction_item}`)
    .join('\n')}`;
}

/**
 * Help shortcut - show available commands
 */
function handleHelpShortcut(): string {
  return `📱 SMS Commands:

SHORTCUTS:
• STATUS - Show all restrictions & commitments
• CLEAR ALL - Lift all restrictions
• STATS - See reliability stats
• SUMMARY - Quick overview
• HELP - Show this message

CONSEQUENCES:
• "No iPad 3 days Emma - homework"
• "Ground Jake until Friday"

COMMITMENTS:
• "Emma will finish homework by 7pm"
• "Jake clean room tonight"

RESPONSES:
• CONFIRM - Agree with restriction
• DONE - Mark commitment complete
• LIFT [item] - End restriction early

Reply with any command to try it!`;
}

/**
 * Stats shortcut - show reliability statistics
 */
async function handleStatsShortcut(supabase: any, userId: string): Promise<string> {
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

  const { data: children } = await supabase
    .from('children')
    .select(`
      name,
      commitment_stats!inner(
        reliability_score,
        total_commitments,
        completed_on_time
      )
    `)
    .eq('user_id', userId)
    .eq('commitment_stats.month', currentMonth);

  if (!children || children.length === 0) {
    return 'No stats available yet. Track commitments to see reliability scores!';
  }

  let response = '📈 This Month Stats:\n\n';

  for (const child of children) {
    const stats = child.commitment_stats[0];
    if (stats) {
      const emoji = stats.reliability_score >= 80 ? '🏆' : stats.reliability_score >= 60 ? '👍' : '⚠️';
      response += `${emoji} ${child.name}: ${Math.round(stats.reliability_score)}% (${stats.completed_on_time}/${stats.total_commitments})\n`;
    }
  }

  return response.trim();
}

/**
 * Summary shortcut - quick overview of family status
 */
async function handleSummaryShortcut(supabase: any, userId: string): Promise<string> {
  const { data: children } = await supabase.from('children').select('id').eq('user_id', userId);

  if (!children || children.length === 0) {
    return 'No data available.';
  }

  const { data: activeConsequences } = await supabase
    .from('consequences')
    .select('id, child:children!inner(user_id)')
    .eq('child.user_id', userId)
    .eq('status', 'active');

  const { data: activeCommitments } = await supabase
    .from('commitments')
    .select('id, child:children!inner(user_id)')
    .eq('child.user_id', userId)
    .eq('status', 'active');

  return `📋 Family Summary:

👥 Children: ${children.length}
🚫 Active Restrictions: ${activeConsequences?.length || 0}
📝 Pending Commitments: ${activeCommitments?.length || 0}

Reply STATUS for details or HELP for commands.`;
}

/**
 * Active shortcut - show only active items
 */
async function handleActiveShortcut(supabase: any, userId: string): Promise<string> {
  return handleStatusShortcut(supabase, userId); // Same as status for now
}
