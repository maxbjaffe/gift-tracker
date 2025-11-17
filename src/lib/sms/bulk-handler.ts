import { createClient } from '@supabase/supabase-js';
import { parseConsequenceMessage } from './ai-parser';
import {
  applyConsequenceToAll,
  applyConsequenceToMultiple,
  applyCommitmentToAll,
  liftAllConsequences,
} from './bulk-operations';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

  // Parse the message to determine what action to take
  const parsed = await parseConsequenceMessage(message);

  if (!parsed.success) {
    return `I couldn't understand that bulk action. Try:\n\n• "No iPad for all kids 2 days"\n• "Emma and Jake grounded 1 day"\n• "Everyone will clean room by 7pm"`;
  }

  // Determine if this is a consequence or commitment
  const isCommitment = message.toLowerCase().includes('will') || parsed.dueDate;

  if (targets === 'all') {
    // Apply to all children
    if (isCommitment && parsed.dueDate) {
      const result = await applyCommitmentToAll(
        userId,
        parsed.commitmentText || message,
        new Date(parsed.dueDate),
        parsed.category || 'other'
      );

      if (result.success) {
        return `✓ Commitment set for all ${result.affected} children:\n${result.children.map((c) => `  • ${c}`).join('\n')}\n\nDue: ${new Date(parsed.dueDate).toLocaleString()}`;
      } else {
        return result.message;
      }
    } else {
      // Apply consequence to all
      const result = await applyConsequenceToAll(
        userId,
        parsed.restrictionType || 'device',
        parsed.restrictionItem || 'privileges',
        parsed.reason || 'parent decision',
        parsed.durationDays,
        parsed.severity || 'medium'
      );

      if (result.success) {
        return `✓ ${result.message}\n${result.children.map((c) => `  • ${c}`).join('\n')}\n\nDuration: ${parsed.durationDays} days`;
      } else {
        return result.message;
      }
    }
  } else if (targets === 'multiple' && childNames && childNames.length > 0) {
    // Apply to specific children
    const result = await applyConsequenceToMultiple(
      userId,
      childNames,
      parsed.restrictionType || 'device',
      parsed.restrictionItem || 'privileges',
      parsed.reason || 'parent decision',
      parsed.durationDays,
      parsed.severity || 'medium'
    );

    if (result.success) {
      return `✓ ${result.message}\n\nDuration: ${parsed.durationDays || 'indefinite'} days`;
    } else {
      return result.message;
    }
  }

  return 'Could not process bulk operation. Please try again.';
}
