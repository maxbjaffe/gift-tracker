import { format } from 'date-fns';
import type { Consequence, Commitment, Child, CommitmentStats } from '@/types/accountability';

/**
 * SMS message templates for partner notifications
 * Keep messages concise for SMS (160 chars ideally, 300 max)
 */

/**
 * Notify partner when consequence is created
 */
export function consequenceNotificationTemplate(
  consequence: Consequence,
  setterName: string
): string {
  const expiresText = consequence.expires_at
    ? format(new Date(consequence.expires_at), 'MMM d h:mm a')
    : 'manual lift only';

  return `${setterName} set ${consequence.restriction_item} restriction (${consequence.duration_days || '?'} days) for ${consequence.child?.name} - ${consequence.reason}

Expires: ${expiresText}

Reply CONFIRM, MODIFY, or DISCUSS`;
}

/**
 * Notify both parents when consequence is confirmed
 */
export function consequenceConfirmedTemplate(
  consequence: Consequence,
  confirmedBy: string
): string {
  const expiresText = consequence.expires_at
    ? format(new Date(consequence.expires_at), 'MMM d h:mm a')
    : 'indefinite';

  return `✓ Both parents aligned. ${consequence.child?.name}: ${consequence.restriction_item} restricted until ${expiresText}

Confirmed by ${confirmedBy}`;
}

/**
 * Notify when commitment is created
 */
export function commitmentCreatedTemplate(
  commitment: Commitment,
  createdBy: 'parent' | 'child',
  verifyingParent?: string
): string {
  const dueText = format(new Date(commitment.due_date), 'MMM d h:mm a');
  const creatorText = createdBy === 'child'
    ? `${commitment.child?.name} committed`
    : 'Parent set';

  return `📝 ${creatorText}: ${commitment.child?.name} - ${commitment.commitment_text}

Due: ${dueText}
${verifyingParent ? `${verifyingParent} will verify` : 'Both parents notified'}`;
}

/**
 * Reminder before commitment deadline
 */
export function commitmentReminderTemplate(
  commitment: Commitment,
  minutesRemaining: number
): string {
  return `⏰ Reminder: ${commitment.child?.name} - ${commitment.commitment_text}

Due in ${minutesRemaining} minutes (${format(new Date(commitment.due_date), 'h:mm a')})

Reply DONE if finished early`;
}

/**
 * Request verification when commitment is due
 */
export function commitmentVerificationTemplate(
  commitment: Commitment
): string {
  return `⏰ ${commitment.child?.name}'s commitment is now due:
"${commitment.commitment_text}"

Reply DONE, LATE, or MISSED to verify`;
}

/**
 * Notify when commitment is missed
 */
export function commitmentMissedTemplate(
  commitment: Commitment,
  stats: CommitmentStats
): string {
  const missCount = stats.missed;
  const reliability = stats.reliability_score || 0;

  return `⚠️ ${commitment.child?.name} missed commitment: ${commitment.commitment_text}

${missCount > 1 ? `${missCount} misses this month. ` : ''}Reliability: ${Math.round(reliability)}%

Reply with consequence or DISCUSS`;
}

/**
 * Notify when commitment completed on time
 */
export function commitmentCompletedTemplate(
  commitment: Commitment,
  onTime: boolean,
  stats: CommitmentStats
): string {
  const emoji = onTime ? '✓' : '⏰';
  const statusText = onTime ? 'on time' : 'late';
  const reliability = stats.reliability_score || 0;

  return `${emoji} ${commitment.child?.name} completed "${commitment.commitment_text}" ${statusText}!

Reliability: ${stats.completed_on_time}/${stats.total_commitments} (${Math.round(reliability)}%) this month`;
}

/**
 * Extension request from child
 */
export function extensionRequestTemplate(
  commitment: Commitment,
  requestedUntil: Date,
  reason?: string
): string {
  const originalDue = format(new Date(commitment.due_date), 'MMM d h:mm a');
  const newDue = format(requestedUntil, 'MMM d h:mm a');

  return `${commitment.child?.name} requests extension:
"${commitment.commitment_text}"

Original: ${originalDue}
Requested: ${newDue}
${reason ? `Reason: ${reason}` : ''}

Reply APPROVE or DENY`;
}

/**
 * Extension approved
 */
export function extensionApprovedTemplate(
  commitment: Commitment,
  approvedBy: string
): string {
  const newDue = format(new Date(commitment.due_date), 'MMM d h:mm a');

  return `✓ Extension approved by ${approvedBy}

${commitment.child?.name} - ${commitment.commitment_text}
New deadline: ${newDue}`;
}

/**
 * Consequence expiring soon
 */
export function consequenceExpiringTemplate(
  consequence: Consequence,
  hoursRemaining: number
): string {
  const expiresText = format(new Date(consequence.expires_at!), 'MMM d h:mm a');

  return `⏰ ${consequence.child?.name}'s ${consequence.restriction_item} restriction ends in ${hoursRemaining}h (${expiresText})

Reason: ${consequence.reason}

Reply LIFT to end now, or EXTEND to continue`;
}

/**
 * Consequence auto-expired
 */
export function consequenceExpiredTemplate(
  consequence: Consequence
): string {
  const durationText = consequence.duration_days
    ? `${consequence.duration_days} days completed`
    : 'restriction period ended';

  return `✓ ${consequence.restriction_item} restriction ended for ${consequence.child?.name}

${durationText}. ${consequence.child?.name} can now use ${consequence.restriction_item}.`;
}

/**
 * Consequence lifted early
 */
export function consequenceLiftedTemplate(
  consequence: Consequence,
  liftedBy: string,
  reason?: string
): string {
  return `✓ ${consequence.restriction_item} restriction lifted for ${consequence.child?.name}

Lifted by: ${liftedBy}
${reason ? `Reason: ${reason}` : 'Ended early'}`;
}

/**
 * Weekly reliability report
 */
export function weeklyReliabilityReport(
  children: Array<{ child: Child; stats: CommitmentStats }>
): string {
  let report = '📊 Weekly Family Report:\n\n';

  children.forEach(({ child, stats }) => {
    const reliability = Math.round(stats.reliability_score || 0);
    const emoji = reliability >= 80 ? '🏆' : reliability >= 60 ? '👍' : '⚠️';

    report += `${emoji} ${child.name}: ${reliability}% (${stats.completed_on_time}/${stats.total_commitments})\n`;
  });

  report += '\nKeep up the great work!';

  return report;
}

/**
 * Escalate unverified commitment (30min+ past deadline)
 */
export function unverifiedCommitmentTemplate(
  commitment: Commitment
): string {
  const dueText = format(new Date(commitment.due_date), 'h:mm a');

  return `⚠️ ${commitment.child?.name}'s commitment deadline passed (${dueText}) - still unverified:
"${commitment.commitment_text}"

Reply DONE, LATE, or MISSED`;
}

/**
 * Both parents disagree
 */
export function parentsDisagreeTemplate(
  item: Consequence | Commitment,
  parent1Response: string,
  parent2Response: string
): string {
  const itemText = 'restriction_item' in item
    ? `${item.restriction_item} restriction`
    : `commitment: ${item.commitment_text}`;

  return `⚠️ Parents disagree on ${item.child?.name}'s ${itemText}

Parent 1: ${parent1Response}
Parent 2: ${parent2Response}

Please discuss and resolve.`;
}

/**
 * Help message
 */
export function helpTemplate(): string {
  return `SMS Commands:

CONSEQUENCES:
• "No iPad 3 days Kid A"
• Reply: CONFIRM, MODIFY, LIFT, EXTEND

COMMITMENTS:
• "Kid A will finish homework by 7pm"
• Reply: DONE, LATE, MISSED

QUERIES:
• "status" - overall status
• "What's Kid A restricted from?"

RESPONSES:
• CONFIRM - agree with consequence
• DONE - commitment completed
• LIFT - end restriction early
• EXTEND - extend restriction/commitment

Reply EXAMPLES for more samples.`;
}
