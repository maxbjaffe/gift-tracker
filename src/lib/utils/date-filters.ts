import type { Consequence, Commitment } from '@/types/accountability';

/**
 * Filter out consequences that have passed their expiration date
 * This provides real-time filtering even before the cron job runs
 */
export function filterActiveConsequences(consequences: Consequence[]): Consequence[] {
  const now = new Date();

  return consequences.filter((consequence) => {
    // Keep if no expiration date
    if (!consequence.expires_at) return true;

    // Keep if not yet expired
    const expiresAt = new Date(consequence.expires_at);
    return expiresAt > now;
  });
}

/**
 * Filter out commitments that have passed their due date and are still active
 */
export function filterActiveCommitments(commitments: Commitment[]): Commitment[] {
  const now = new Date();

  return commitments.filter((commitment) => {
    // Only filter active commitments
    if (commitment.status !== 'active') return true;

    // Keep if no due date
    if (!commitment.due_date) return true;

    // Keep if not yet due
    const dueDate = new Date(commitment.due_date);
    return dueDate > now;
  });
}

/**
 * Check if a consequence has expired (passed its expiration date)
 */
export function isConsequenceExpired(consequence: Consequence): boolean {
  if (!consequence.expires_at) return false;

  const now = new Date();
  const expiresAt = new Date(consequence.expires_at);
  return expiresAt <= now;
}

/**
 * Check if a commitment is overdue
 */
export function isCommitmentOverdue(commitment: Commitment): boolean {
  if (commitment.status !== 'active') return false;
  if (!commitment.due_date) return false;

  const now = new Date();
  const dueDate = new Date(commitment.due_date);
  return dueDate <= now;
}
