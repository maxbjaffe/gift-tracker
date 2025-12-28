import { detectShortcut, handleShortcut } from './shortcuts';
import { getSMSContext, saveSMSContext } from './context-manager';

export type MessageIntent = 'gift' | 'shortcut' | 'unknown';

export interface RouterResult {
  intent: MessageIntent;
  confidence: 'high' | 'medium' | 'low';
  message: string;
}

/**
 * Detect message intent for gift tracking
 */
export function detectMessageIntent(message: string): RouterResult {
  const normalized = message.toLowerCase().trim();

  // 1. Check for shortcuts first (HELP, etc.)
  const shortcut = detectShortcut(message);
  if (shortcut) {
    return {
      intent: 'shortcut',
      confidence: 'high',
      message: normalized,
    };
  }

  // 2. Everything else is treated as a gift idea
  // Examples: "AirPods for Sarah", "Gift for Mom - $50", "Lego set"
  return {
    intent: 'gift',
    confidence: 'high',
    message: normalized,
  };
}

/**
 * Route message to appropriate handler based on intent
 */
export async function routeMessage(
  intent: MessageIntent,
  message: string,
  fromNumber: string,
  userId?: string
): Promise<string> {
  switch (intent) {
    case 'shortcut':
      if (!userId) {
        return 'Please register your phone number in GiftStash settings to use SMS features.';
      }
      const shortcutCommand = detectShortcut(message);
      if (shortcutCommand) {
        const response = await handleShortcut(shortcutCommand, userId, fromNumber);
        await saveSMSContext(fromNumber, userId, message, 'shortcut', {}, null);
        return response;
      }
      return 'Command not recognized. Reply HELP for examples.';

    case 'gift':
      if (!userId) {
        return 'Please register your phone number in GiftStash settings to use SMS features.';
      }
      const { handleGiftMessage } = await import('./gift-handler');
      const giftResponse = await handleGiftMessage(message, fromNumber, userId);
      await saveSMSContext(fromNumber, userId, message, 'gift', {}, null);
      return giftResponse;

    case 'unknown':
    default:
      return "I'll save this as a gift idea! To specify a recipient, use format: 'Gift name for Person'\n\nReply HELP for more commands.";
  }
}
