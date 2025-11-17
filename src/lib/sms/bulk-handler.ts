import { createClient } from '@supabase/supabase-js';
import {
  applyConsequenceToAll,
  applyConsequenceToMultiple,
  applyCommitmentToAll,
  liftAllConsequences,
} from './bulk-operations';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Simple parser for bulk messages
 */
function parseBulkMessage(message: string) {
  const lowerMsg = message.toLowerCase();

  // Extract duration (e.g., "3 days", "2 hours")
  const durationMatch = message.match(/(\d+)\s*(day|hour|week)/i);
  const durationDays = durationMatch
    ? parseInt(durationMatch[1]) * (durationMatch[2].toLowerCase() === 'week' ? 7 : 1)
    : 1;

  // Check if it's a commitment
  const isCommitment = lowerMsg.includes('will') || lowerMsg.includes('by ');

  // Extract restriction item (first capitalized word or word after "no")
  const noMatch = message.match(/no\s+([a-z]+)/i);
  const restrictionItem = noMatch ? noMatch[1] : 'privileges';

  // Extract reason (after "because", "for", or last part of message)
  const reasonMatch = message.match(/(?:because|for|due to)\s+(.+)/i);
  const reason = reasonMatch ? reasonMatch[1].trim() : 'behavior';

  return {
    isCommitment,
    durationDays,
    restrictionItem,
    restrictionType: 'privilege' as const,
    reason,
    severity: 'medium' as const,
  };
}

/**
 * Handle bulk operations (messages targeting multiple children)
 */
export async function handleBulkMessage(
  message: string,
  phoneNumber: string,
  userId: string,
  targets: 'all' | 'multiple' | 'single',
  childNames?: string[]
): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Parse the message
  const parsed = parseBulkMessage(message);

  if (targets === 'all') {
    // Apply consequence to all children
    const result = await applyConsequenceToAll(
      userId,
      parsed.restrictionType,
      parsed.restrictionItem,
      parsed.reason,
      parsed.durationDays,
      parsed.severity
    );

    if (result.success) {
      return `✓ ${result.message}\n${result.children.map((c) => `  • ${c}`).join('\n')}\n\nDuration: ${parsed.durationDays} day(s)`;
    } else {
      return result.message;
    }
  } else if (targets === 'multiple' && childNames && childNames.length > 0) {
    // Apply to specific children
    const result = await applyConsequenceToMultiple(
      userId,
      childNames,
      parsed.restrictionType,
      parsed.restrictionItem,
      parsed.reason,
      parsed.durationDays,
      parsed.severity
    );

    if (result.success) {
      return `✓ ${result.message}\n\nDuration: ${parsed.durationDays} day(s)`;
    } else {
      return result.message;
    }
  }

  return 'Could not process bulk operation. Please try again.';
}
