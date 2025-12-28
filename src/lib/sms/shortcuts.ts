import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export type ShortcutCommand = 'help' | 'list' | 'recent';

/**
 * Detect if message is a shortcut command
 */
export function detectShortcut(message: string): ShortcutCommand | null {
  const lower = message.toLowerCase().trim();

  // Help shortcuts
  if (
    lower === 'help' ||
    lower === '?' ||
    lower === 'commands' ||
    lower === 'how'
  ) {
    return 'help';
  }

  // List shortcuts
  if (
    lower === 'list' ||
    lower === 'show' ||
    lower === 'all' ||
    lower === 'gifts'
  ) {
    return 'list';
  }

  // Recent shortcuts
  if (lower === 'recent' || lower === 'latest') {
    return 'recent';
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
    case 'help':
      return handleHelpShortcut();

    case 'list':
      return await handleListShortcut(supabase, userId);

    case 'recent':
      return await handleRecentShortcut(supabase, userId);

    default:
      return 'Unknown command. Reply HELP for available commands.';
  }
}

/**
 * Help shortcut - show available commands
 */
function handleHelpShortcut(): string {
  return `🎁 GiftStash SMS Commands:

SAVE A GIFT IDEA:
• "AirPods for Sarah"
• "Lego set for Emma - $50"
• "Gift idea: Cookbook for Mom"

SHORTCUTS:
• HELP - Show this message
• LIST - Show recent gift ideas
• RECENT - Show last 5 saved gifts

Just text any gift idea and we'll save it for you!`;
}

/**
 * List shortcut - show recent gift ideas
 */
async function handleListShortcut(supabase: any, userId: string): Promise<string> {
  const { data: gifts, error } = await supabase
    .from('gifts')
    .select(`
      name,
      price,
      recipient:recipients(name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !gifts || gifts.length === 0) {
    return 'No gift ideas saved yet. Text any gift idea to save it!';
  }

  let response = '🎁 Recent Gift Ideas:\n\n';

  for (const gift of gifts) {
    const recipientName = gift.recipient?.name || 'Unassigned';
    const priceStr = gift.price ? ` - $${gift.price}` : '';
    response += `• ${gift.name}${priceStr} (${recipientName})\n`;
  }

  response += '\nView all at giftstash.app/gifts';

  return response;
}

/**
 * Recent shortcut - show last 5 saved gifts
 */
async function handleRecentShortcut(supabase: any, userId: string): Promise<string> {
  const { data: gifts, error } = await supabase
    .from('gifts')
    .select(`
      name,
      price,
      recipient:recipients(name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !gifts || gifts.length === 0) {
    return 'No gift ideas saved yet. Text any gift idea to save it!';
  }

  let response = '🎁 Last 5 Saved:\n\n';

  for (const gift of gifts) {
    const recipientName = gift.recipient?.name || 'Unassigned';
    const priceStr = gift.price ? ` - $${gift.price}` : '';
    response += `• ${gift.name}${priceStr} (${recipientName})\n`;
  }

  return response;
}
