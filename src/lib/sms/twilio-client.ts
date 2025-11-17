import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn('Twilio credentials not configured. SMS functionality will be disabled.');
}

const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

export interface SendSMSParams {
  to: string;
  body: string;
}

export interface SendSMSResult {
  success: boolean;
  messageSid?: string;
  error?: string;
}

/**
 * Send an SMS message using Twilio
 */
export async function sendSMS({ to, body }: SendSMSParams): Promise<SendSMSResult> {
  if (!twilioClient || !twilioPhoneNumber) {
    console.error('Twilio client not initialized');
    return {
      success: false,
      error: 'SMS service not configured',
    };
  }

  try {
    const message = await twilioClient.messages.create({
      from: twilioPhoneNumber,
      to,
      body,
    });

    console.log(`SMS sent successfully: ${message.sid} to ${to}`);

    return {
      success: true,
      messageSid: message.sid,
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send SMS to multiple recipients
 */
export async function sendBulkSMS(recipients: string[], body: string): Promise<SendSMSResult[]> {
  const promises = recipients.map((to) => sendSMS({ to, body }));
  return Promise.all(promises);
}

/**
 * Format a TwiML response for Twilio webhook
 */
export function formatTwiMLResponse(message: string): string {
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(message);
  return twiml.toString();
}

/**
 * Validate Twilio webhook signature for security
 * This ensures the request actually came from Twilio
 */
export function validateWebhookSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  if (!authToken) {
    console.warn('Cannot validate signature: Twilio auth token not configured');
    return false;
  }

  try {
    return twilio.validateRequest(authToken, signature, url, params);
  } catch (error) {
    console.error('Error validating Twilio signature:', error);
    return false;
  }
}

/**
 * Format phone number to E.164 format
 * Example: (401) 592-5209 → +14015925209
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Add +1 for US numbers if not present
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // Already in E.164 format
  if (phone.startsWith('+')) {
    return phone;
  }

  return `+${digits}`;
}

/**
 * Check if phone number is valid E.164 format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

/**
 * Send a test SMS to verify Twilio configuration
 */
export async function sendTestSMS(to: string): Promise<SendSMSResult> {
  return sendSMS({
    to,
    body: '✓ Gift Tracker SMS is configured correctly! You can now receive notifications.',
  });
}
