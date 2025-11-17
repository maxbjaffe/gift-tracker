import { sendSMS, sendBulkSMS } from '../sms/twilio-client';
import type { Consequence, Commitment, PartnerNotification } from '@/types/accountability';
import * as templates from './notification-templates';
import { createClient } from '@/lib/supabase/server';

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
}

/**
 * Get partner phone number from settings
 */
async function getPartnerPhone(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('partner_settings')
    .select('partner_phone')
    .eq('user_id', userId)
    .single();

  if (error || !data?.partner_phone) {
    console.error('No partner phone configured:', error);
    return null;
  }

  return data.partner_phone;
}

/**
 * Get both parent phone numbers
 */
async function getBothParentPhones(userId: string): Promise<string[]> {
  // Get partner phone
  const partnerPhone = await getPartnerPhone(userId);

  // Get current user's phone
  // TODO: Implement user phone lookup from profile/settings
  const userPhone = null; // Placeholder

  const phones: string[] = [];
  if (partnerPhone) phones.push(partnerPhone);
  if (userPhone) phones.push(userPhone);

  return phones;
}

/**
 * Notify partner when consequence is created
 */
export async function notifyPartnerConsequence(
  consequence: Consequence,
  setterUserId: string,
  setterName: string
): Promise<NotificationResult> {
  const partnerPhone = await getPartnerPhone(setterUserId);

  if (!partnerPhone) {
    console.warn('No partner phone configured - skipping notification');
    return { success: false, error: 'No partner phone configured' };
  }

  const message = templates.consequenceNotificationTemplate(consequence, setterName);

  const result = await sendSMS({
    to: partnerPhone,
    body: message,
  });

  if (result.success) {
    // Log notification in database
    const notificationId = await logNotification({
      type: 'consequence_notification',
      userId: setterUserId,
      partnerPhone,
      message,
      referenceId: consequence.id,
      referenceType: 'consequence',
    });

    return { success: true, notificationId };
  }

  return { success: false, error: result.error };
}

/**
 * Notify both parents when consequence is confirmed
 */
export async function notifyConsequenceConfirmed(
  consequence: Consequence,
  confirmedBy: string,
  userId: string
): Promise<NotificationResult> {
  const phones = await getBothParentPhones(userId);

  if (phones.length === 0) {
    return { success: false, error: 'No phones configured' };
  }

  const message = templates.consequenceConfirmedTemplate(consequence, confirmedBy);

  const results = await sendBulkSMS(phones, message);

  const allSuccess = results.every(r => r.success);

  return {
    success: allSuccess,
    error: allSuccess ? undefined : 'Some notifications failed',
  };
}

/**
 * Notify when commitment is created
 */
export async function notifyPartnerCommitment(
  commitment: Commitment,
  createdBy: 'parent' | 'child',
  userId: string,
  verifyingParent?: string
): Promise<NotificationResult> {
  const phones = await getBothParentPhones(userId);

  if (phones.length === 0) {
    return { success: false, error: 'No phones configured' };
  }

  const message = templates.commitmentCreatedTemplate(commitment, createdBy, verifyingParent);

  const results = await sendBulkSMS(phones, message);

  const allSuccess = results.every(r => r.success);

  if (allSuccess) {
    const notificationId = await logNotification({
      type: 'commitment_notification',
      userId,
      partnerPhone: phones[0],
      message,
      referenceId: commitment.id,
      referenceType: 'commitment',
    });

    return { success: true, notificationId };
  }

  return {
    success: false,
    error: 'Some notifications failed',
  };
}

/**
 * Send reminder before commitment deadline
 */
export async function sendCommitmentReminder(
  commitment: Commitment,
  userId: string,
  recipientType: 'child' | 'parent'
): Promise<NotificationResult> {
  // Calculate minutes remaining
  const now = new Date();
  const dueDate = new Date(commitment.due_date);
  const minutesRemaining = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60));

  const message = templates.commitmentReminderTemplate(commitment, minutesRemaining);

  let recipientPhone: string | null = null;

  if (recipientType === 'child') {
    // TODO: Get child's phone number from children table
    recipientPhone = null;
  } else {
    // Send to both parents
    const phones = await getBothParentPhones(userId);
    if (phones.length > 0) {
      const results = await sendBulkSMS(phones, message);
      const allSuccess = results.every(r => r.success);
      return { success: allSuccess };
    }
  }

  if (!recipientPhone) {
    return { success: false, error: 'No recipient phone configured' };
  }

  const result = await sendSMS({
    to: recipientPhone,
    body: message,
  });

  return { success: result.success, error: result.error };
}

/**
 * Request verification when commitment is due
 */
export async function sendVerificationRequest(
  commitment: Commitment,
  userId: string,
  verifyingParentPhone?: string
): Promise<NotificationResult> {
  const phone = verifyingParentPhone || await getPartnerPhone(userId);

  if (!phone) {
    return { success: false, error: 'No verifying parent phone configured' };
  }

  const message = templates.commitmentVerificationTemplate(commitment);

  const result = await sendSMS({
    to: phone,
    body: message,
  });

  if (result.success) {
    await logNotification({
      type: 'verification_request',
      userId,
      partnerPhone: phone,
      message,
      referenceId: commitment.id,
      referenceType: 'commitment',
    });
  }

  return { success: result.success, error: result.error };
}

/**
 * Notify when commitment is missed
 */
export async function notifyCommitmentMissed(
  commitment: Commitment,
  stats: any,
  userId: string
): Promise<NotificationResult> {
  const phones = await getBothParentPhones(userId);

  if (phones.length === 0) {
    return { success: false, error: 'No phones configured' };
  }

  const message = templates.commitmentMissedTemplate(commitment, stats);

  const results = await sendBulkSMS(phones, message);

  const allSuccess = results.every(r => r.success);

  return { success: allSuccess };
}

/**
 * Notify when commitment is completed
 */
export async function notifyCommitmentCompleted(
  commitment: Commitment,
  onTime: boolean,
  stats: any,
  userId: string
): Promise<NotificationResult> {
  const phones = await getBothParentPhones(userId);

  if (phones.length === 0) {
    return { success: false, error: 'No phones configured' };
  }

  const message = templates.commitmentCompletedTemplate(commitment, onTime, stats);

  const results = await sendBulkSMS(phones, message);

  const allSuccess = results.every(r => r.success);

  return { success: allSuccess };
}

/**
 * Send extension request notification
 */
export async function notifyExtensionRequest(
  commitment: Commitment,
  requestedUntil: Date,
  reason: string | undefined,
  userId: string
): Promise<NotificationResult> {
  const phones = await getBothParentPhones(userId);

  if (phones.length === 0) {
    return { success: false, error: 'No phones configured' };
  }

  const message = templates.extensionRequestTemplate(commitment, requestedUntil, reason);

  const results = await sendBulkSMS(phones, message);

  const allSuccess = results.every(r => r.success);

  return { success: allSuccess };
}

/**
 * Notify consequence expiring soon
 */
export async function notifyConsequenceExpiring(
  consequence: Consequence,
  userId: string
): Promise<NotificationResult> {
  const phones = await getBothParentPhones(userId);

  if (phones.length === 0) {
    return { success: false, error: 'No phones configured' };
  }

  const now = new Date();
  const expiresAt = new Date(consequence.expires_at!);
  const hoursRemaining = Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));

  const message = templates.consequenceExpiringTemplate(consequence, hoursRemaining);

  const results = await sendBulkSMS(phones, message);

  const allSuccess = results.every(r => r.success);

  return { success: allSuccess };
}

/**
 * Notify consequence expired
 */
export async function notifyConsequenceExpired(
  consequence: Consequence,
  userId: string
): Promise<NotificationResult> {
  const phones = await getBothParentPhones(userId);

  if (phones.length === 0) {
    return { success: false, error: 'No phones configured' };
  }

  const message = templates.consequenceExpiredTemplate(consequence);

  const results = await sendBulkSMS(phones, message);

  const allSuccess = results.every(r => r.success);

  return { success: allSuccess };
}

/**
 * Log notification in database
 */
async function logNotification(data: {
  type: string;
  userId: string;
  partnerPhone: string;
  message: string;
  referenceId: string;
  referenceType: 'consequence' | 'commitment';
}): Promise<string | null> {
  try {
    const supabase = await createClient();

    const { data: notification, error } = await supabase
      .from('partner_notifications')
      .insert({
        notification_type: data.type,
        user_id: data.userId,
        partner_phone: data.partnerPhone,
        message_body: data.message,
        reference_id: data.referenceId,
        reference_type: data.referenceType,
        status: 'sent',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error logging notification:', error);
      return null;
    }

    return notification.id;
  } catch (error) {
    console.error('Error logging notification:', error);
    return null;
  }
}
