import { createConsequence } from '../services/accountability';
import type { CreateConsequenceData, RestrictionType, Severity } from '@/types/accountability';
import { extractChildName } from './message-router';
import { createClient } from '@/lib/supabase/server';

export async function handleConsequenceMessage(
  message: string,
  fromNumber: string
): Promise<string> {
  try {
    // Parse the consequence from the message
    const parsed = await parseConsequence(message);

    if (!parsed) {
      return 'Could not parse consequence. Please include:\n' +
        '• Child name (Kid A, Kid B, etc.)\n' +
        '• What to restrict (iPad, TV, etc.)\n' +
        '• Duration (3 days, until Friday, etc.)\n\n' +
        'Example: "No iPad 3 days Kid A homework"';
    }

    // Get user from phone number (you'll need to implement this lookup)
    const userId = await getUserIdFromPhone(fromNumber);

    if (!userId) {
      return 'Your phone number is not registered. Please sign up first.';
    }

    // Get child ID
    const childId = await getChildIdByName(userId, parsed.childName);

    if (!childId) {
      return `Child "${parsed.childName}" not found. Please add this child first or check the spelling.`;
    }

    // Calculate expiration date
    let expires_at: string | null = null;
    if (parsed.durationDays) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + parsed.durationDays);
      expires_at = expirationDate.toISOString();
    }

    // Create the consequence
    const consequenceData: CreateConsequenceData = {
      child_id: childId,
      restriction_type: parsed.restrictionType,
      restriction_item: parsed.restrictionItem,
      reason: parsed.reason || 'No reason provided',
      duration_days: parsed.durationDays,
      expires_at,
      severity: parsed.severity || 'medium',
      status: 'pending_confirmation', // Start as pending for partner confirmation
    };

    const consequence = await createConsequence(consequenceData);

    // Format success response
    const durationText = parsed.durationDays
      ? `${parsed.durationDays} days`
      : 'indefinite';
    const expiresText = expires_at
      ? `until ${new Date(expires_at).toLocaleDateString()}`
      : 'manual lift only';

    // TODO: Notify partner (will implement in Session 4)
    const response =
      `✓ ${parsed.restrictionItem} restricted for ${parsed.childName}\n` +
      `Duration: ${durationText} (${expiresText})\n` +
      `Reason: ${parsed.reason || 'Not specified'}\n\n` +
      `Partner will be notified for confirmation.`;

    return response;
  } catch (error) {
    console.error('Error handling consequence message:', error);
    return 'Error creating consequence. Please try again.';
  }
}

/**
 * Simple consequence parser (will be replaced with AI parsing in Session 3)
 * Extracts: child name, restriction item, duration, reason
 */
async function parseConsequence(message: string): Promise<{
  childName: string;
  restrictionType: RestrictionType;
  restrictionItem: string;
  durationDays: number | null;
  reason: string | null;
  severity: Severity;
} | null> {
  const normalized = message.toLowerCase();

  // Extract child name
  const childName = extractChildName(message);
  if (!childName) {
    return null;
  }

  // Extract restriction item (what's being restricted)
  let restrictionItem = '';
  let restrictionType: RestrictionType = 'other';

  // Common devices
  if (normalized.includes('ipad')) {
    restrictionItem = 'iPad';
    restrictionType = 'device';
  } else if (normalized.includes('tv') || normalized.includes('television')) {
    restrictionItem = 'TV';
    restrictionType = 'device';
  } else if (normalized.includes('phone')) {
    restrictionItem = 'Phone';
    restrictionType = 'device';
  } else if (normalized.includes('xbox') || normalized.includes('playstation') || normalized.includes('games')) {
    restrictionItem = normalized.includes('xbox') ? 'Xbox' : normalized.includes('playstation') ? 'PlayStation' : 'Games';
    restrictionType = 'activity';
  } else if (normalized.includes('screens') || normalized.includes('screen time')) {
    restrictionItem = 'All screens';
    restrictionType = 'device';
  } else if (normalized.includes('friend') || normalized.includes('playdates')) {
    restrictionItem = 'Friends/playdates';
    restrictionType = 'privilege';
  } else {
    // Try to extract the item after "no" or "restrict"
    const noMatch = normalized.match(/no\s+(\w+)/);
    const restrictMatch = normalized.match(/restrict\s+(\w+)/);

    if (noMatch) {
      restrictionItem = noMatch[1].charAt(0).toUpperCase() + noMatch[1].slice(1);
    } else if (restrictMatch) {
      restrictionItem = restrictMatch[1].charAt(0).toUpperCase() + restrictMatch[1].slice(1);
    } else {
      return null; // Can't determine what to restrict
    }
  }

  // Extract duration in days
  let durationDays: number | null = null;
  const daysMatch = message.match(/(\d+)\s*days?/i);
  if (daysMatch) {
    durationDays = parseInt(daysMatch[1]);
  } else if (normalized.includes('week')) {
    const weeksMatch = message.match(/(\d+)\s*weeks?/i);
    durationDays = weeksMatch ? parseInt(weeksMatch[1]) * 7 : 7;
  } else if (normalized.includes('month')) {
    durationDays = 30;
  }

  // Extract reason (everything after the child name or after the duration)
  let reason: string | null = null;
  const reasonPatterns = [
    /(?:reason:|because|for)\s*(.+)$/i,
    /(?:\d+\s*days?)\s+(.+)$/i,
    new RegExp(`${childName}\\s+(.+)$`, 'i'),
  ];

  for (const pattern of reasonPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      reason = match[1].trim();
      break;
    }
  }

  // Determine severity based on duration
  let severity: Severity = 'medium';
  if (durationDays) {
    if (durationDays >= 7) {
      severity = 'major';
    } else if (durationDays <= 2) {
      severity = 'minor';
    }
  }

  return {
    childName,
    restrictionType,
    restrictionItem,
    durationDays,
    reason,
    severity,
  };
}

/**
 * Get user ID from phone number
 * TODO: Implement proper phone number lookup from partner_settings table
 */
async function getUserIdFromPhone(phoneNumber: string): Promise<string | null> {
  // For now, return a placeholder
  // In production, you'd query partner_settings or a user_phones table
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Get child ID by name
 */
async function getChildIdByName(userId: string, childName: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('children')
    .select('id')
    .eq('user_id', userId)
    .ilike('name', childName)
    .single();

  if (error || !data) {
    console.error('Error finding child:', error);
    return null;
  }

  return data.id;
}
