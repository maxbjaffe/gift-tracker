import { updateConsequenceStatus, updateCommitmentStatus } from '../services/accountability';

export async function handleResponseMessage(
  message: string,
  fromNumber: string
): Promise<string> {
  const normalized = message.toLowerCase().trim();

  // Handle confirmation responses
  if (isConfirmation(normalized)) {
    return '✓ Confirmed. (Full partner coordination coming in Session 4)';
  }

  // Handle denial responses
  if (isDenial(normalized)) {
    return '✓ Noted. (Full partner coordination coming in Session 4)';
  }

  // Handle commitment verification responses
  if (isDone(normalized)) {
    return '✓ Marked as done. (Full verification coming in Session 4)';
  }

  if (isMissed(normalized)) {
    return '✓ Marked as missed. (Full verification coming in Session 4)';
  }

  if (isLate(normalized)) {
    return '✓ Marked as late. (Full verification coming in Session 4)';
  }

  // Handle consequence management
  if (isLift(normalized)) {
    return '✓ Will lift restriction. (Full management coming in Session 4)';
  }

  if (isExtend(normalized)) {
    return '✓ Will extend restriction. (Full management coming in Session 4)';
  }

  return 'Response keyword detected, but action not yet implemented. Full partner coordination coming in Session 4.';
}

/**
 * Check if message is a confirmation
 */
function isConfirmation(message: string): boolean {
  const confirmKeywords = ['confirm', 'confirmed', 'approve', 'approved', 'yes', 'ok', 'okay', '👍'];
  return confirmKeywords.some(keyword => message === keyword || message.includes(keyword));
}

/**
 * Check if message is a denial
 */
function isDenial(message: string): boolean {
  const denyKeywords = ['deny', 'denied', 'reject', 'rejected', 'no', 'nope'];
  return denyKeywords.some(keyword => message === keyword);
}

/**
 * Check if message indicates "done"
 */
function isDone(message: string): boolean {
  return message === 'done' || message.includes('done') || message === 'complete' || message === 'finished';
}

/**
 * Check if message indicates "missed"
 */
function isMissed(message: string): boolean {
  return message === 'missed' || message === 'miss' || message.includes('didn\'t do');
}

/**
 * Check if message indicates "late"
 */
function isLate(message: string): boolean {
  return message === 'late' || message.includes('late');
}

/**
 * Check if message is to lift a restriction
 */
function isLift(message: string): boolean {
  return message === 'lift' || message.includes('lift') || message.includes('end early') || message.includes('remove');
}

/**
 * Check if message is to extend a restriction/commitment
 */
function isExtend(message: string): boolean {
  return message === 'extend' || message.includes('extend') || message.includes('more time');
}
