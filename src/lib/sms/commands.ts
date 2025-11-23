import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Handle onboarding for new SMS users
 * Returns true if this is a new user (should send onboarding)
 */
export async function checkAndSendOnboarding(phoneNumber: string, userId: string): Promise<boolean> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if user has received onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('sms_onboarded, created_at')
      .eq('id', userId)
      .single();

    if (!profile) return false;

    // If already onboarded, skip
    if (profile.sms_onboarded) return false;

    // Check if this is their first SMS message
    const { data: messages } = await supabase
      .from('sms_messages')
      .select('id')
      .eq('user_id', userId)
      .limit(2);

    // If this is their first or second message, send onboarding
    if (!messages || messages.length <= 1) {
      // Mark as onboarded
      await supabase
        .from('profiles')
        .update({ sms_onboarded: true })
        .eq('id', userId);

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Get onboarding message for new users
 */
export function getOnboardingMessage(): string {
  return `🎁 Welcome to GiftStash!

I'm your AI gift tracking assistant. Here's how I work:

📝 SAVE GIFTS:
Just text me gift ideas naturally:
• "LEGO set for Mom"
• "AirPods Pro - $249 for Sarah"
• Send a product photo

📱 COMMANDS:
• EXPORT - Get your shopping list
• HELP - Show commands

🌐 MANAGE ONLINE:
Visit ${process.env.NEXT_PUBLIC_APP_URL} to:
• View all gifts
• Add recipients
• Get AI suggestions

Try it now! Text a gift idea or send a product photo.`;
}

/**
 * Handle EXPORT command - sends a formatted shopping list of unpurchased gifts
 */
export async function handleExportCommand(phoneNumber: string): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get user from phone number
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', phoneNumber)
      .single();

    if (userError || !userData) {
      return "I couldn't find your account. Please register your phone number in the app settings first.";
    }

    const userId = userData.id;

    // Get all unpurchased gifts (idea, considering status)
    const { data: gifts, error: giftsError } = await supabase
      .from('gifts')
      .select(`
        id,
        name,
        current_price,
        category,
        url,
        status,
        gift_recipients (
          recipients (
            name
          )
        )
      `)
      .eq('user_id', userId)
      .in('status', ['idea', 'considering'])
      .order('created_at', { ascending: false });

    if (giftsError) {
      console.error('Error fetching gifts:', giftsError);
      return 'Sorry, there was an error fetching your gift list.';
    }

    if (!gifts || gifts.length === 0) {
      return '🎁 Your shopping list is empty! Text gift ideas to add them.';
    }

    // Format the shopping list
    let message = `🛍️ SHOPPING LIST (${gifts.length} items)\n\n`;

    // Group by recipient
    const giftsByRecipient: Record<string, any[]> = {};
    const unassignedGifts: any[] = [];

    gifts.forEach((gift) => {
      const recipients = gift.gift_recipients || [];
      if (recipients.length === 0) {
        unassignedGifts.push(gift);
      } else {
        recipients.forEach((gr: any) => {
          const recipientName = gr.recipients?.name || 'Unknown';
          if (!giftsByRecipient[recipientName]) {
            giftsByRecipient[recipientName] = [];
          }
          giftsByRecipient[recipientName].push(gift);
        });
      }
    });

    // Format gifts by recipient
    Object.entries(giftsByRecipient).forEach(([recipient, recipientGifts]) => {
      message += `FOR ${recipient.toUpperCase()}:\n`;
      recipientGifts.forEach((gift) => {
        const price = gift.current_price ? ` - $${gift.current_price.toFixed(2)}` : '';
        const category = gift.category ? ` [${gift.category}]` : '';
        message += `• ${gift.name}${price}${category}\n`;
      });
      message += '\n';
    });

    // Add unassigned gifts
    if (unassignedGifts.length > 0) {
      message += 'UNASSIGNED:\n';
      unassignedGifts.forEach((gift) => {
        const price = gift.current_price ? ` - $${gift.current_price.toFixed(2)}` : '';
        const category = gift.category ? ` [${gift.category}]` : '';
        message += `• ${gift.name}${price}${category}\n`;
      });
      message += '\n';
    }

    // Add total budget
    const totalBudget = gifts.reduce((sum, gift) => sum + (gift.current_price || 0), 0);
    if (totalBudget > 0) {
      message += `💰 Total: $${totalBudget.toFixed(2)}\n\n`;
    }

    message += `View full details at ${process.env.NEXT_PUBLIC_APP_URL}/gifts`;

    // SMS has character limits (1600 for Twilio), truncate if needed
    if (message.length > 1500) {
      message = message.substring(0, 1450) + `...\n\nView complete list at ${process.env.NEXT_PUBLIC_APP_URL}/gifts`;
    }

    return message;
  } catch (error) {
    console.error('Error in handleExportCommand:', error);
    return 'Sorry, there was an error processing your request. Please try again later.';
  }
}

/**
 * Handle HELP command - sends usage instructions
 */
export async function handleHelpCommand(): Promise<string> {
  return `📱 GIFTSTASH HELP

SAVE GIFTS:
Text gift ideas like:
• "LEGO set for Mom"
• "AirPods Pro for Sarah - $249"
• Send a product photo

COMMANDS:
• EXPORT - Get your shopping list
• HELP - Show this message

Visit ${process.env.NEXT_PUBLIC_APP_URL} to manage your gifts!`;
}
