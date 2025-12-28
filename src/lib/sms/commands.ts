import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Handle EXPORT command - export all gifts as a summary
 */
export async function handleExportCommand(phoneNumber: string): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Find user by phone number
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone_number', phoneNumber)
    .single();

  if (userError || !userData) {
    return 'Could not find your account. Please register your phone number in the app settings.';
  }

  // Get all gifts for the user
  const { data: gifts, error: giftsError } = await supabase
    .from('gifts')
    .select(`
      name,
      current_price,
      status,
      recipient:recipients(name)
    `)
    .eq('user_id', userData.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (giftsError || !gifts || gifts.length === 0) {
    return 'No gift ideas saved yet. Text any gift idea to save it!';
  }

  let response = '🎁 Your Gift Ideas:\n\n';

  for (const gift of gifts) {
    const recipientName = (gift.recipient as any)?.name || 'Unassigned';
    const priceStr = gift.current_price ? ` - $${gift.current_price}` : '';
    const statusEmoji = gift.status === 'purchased' ? '✅' : gift.status === 'given' ? '🎁' : '💡';
    response += `${statusEmoji} ${gift.name}${priceStr} (${recipientName})\n`;
  }

  response += `\nView all at ${process.env.NEXT_PUBLIC_APP_URL || 'giftstash.app'}/gifts`;

  return response;
}

/**
 * Handle HELP command
 */
export async function handleHelpCommand(): Promise<string> {
  return `🎁 GiftStash SMS Commands:

SAVE A GIFT IDEA:
• "AirPods for Sarah"
• "Lego set for Emma - $50"
• "Gift idea: Cookbook for Mom"
• Send a product screenshot!

SHORTCUTS:
• HELP - Show this message
• LIST - Show recent gift ideas
• EXPORT - Export all your gifts

Just text any gift idea and we'll save it!`;
}

/**
 * Check if user needs onboarding message
 */
export async function checkAndSendOnboarding(phoneNumber: string, userId: string): Promise<boolean> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check if user has received onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('sms_onboarded')
    .eq('id', userId)
    .single();

  if (profile?.sms_onboarded) {
    return false; // Already onboarded
  }

  // Mark as onboarded
  await supabase
    .from('profiles')
    .update({ sms_onboarded: true })
    .eq('id', userId);

  return true; // Needs onboarding
}

/**
 * Get onboarding welcome message
 */
export function getOnboardingMessage(): string {
  return `Welcome to GiftStash! 🎁

Tips:
• Text any gift idea to save it
• Include a name: "AirPods for Sarah"
• Add a price: "Lego set - $50"
• Send product screenshots!

Reply HELP for all commands.`;
}
