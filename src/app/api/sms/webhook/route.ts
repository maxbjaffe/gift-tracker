import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { formatTwiMLResponse, validateWebhookSignature, formatPhoneNumber } from '@/lib/sms/twilio-client';
import { detectMessageIntent, routeMessage } from '@/lib/sms/message-router';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Look up user by phone number
 * Searches the profiles table for a matching phone_number field
 * Handles multiple phone formats: +14015551234, 4015551234, (401) 555-1234, etc.
 */
async function getUserByPhoneNumber(phoneNumber: string): Promise<string | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalize phone number to E.164 format for comparison
    const normalizedPhone = formatPhoneNumber(phoneNumber);

    // Also extract just the digits for flexible matching
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    const last10Digits = digitsOnly.slice(-10); // Last 10 digits (US number without country code)

    console.log('[SMS Webhook] Phone lookup:', {
      original: phoneNumber,
      normalized: normalizedPhone,
      digitsOnly,
      last10Digits,
    });

    // Try exact match first
    const { data, error } = await supabase
      .from('profiles')
      .select('id, phone_number')
      .eq('phone_number', normalizedPhone)
      .single();

    if (data) {
      console.log('[SMS Webhook] Exact match found:', data.id);
      return data.id;
    }

    // Try multiple formats
    const formatsToTry = [
      normalizedPhone,                    // +14015551234
      digitsOnly,                         // 14015551234
      last10Digits,                       // 4015551234
      `+1${last10Digits}`,               // +14015551234 (rebuilt)
      `1${last10Digits}`,                // 14015551234
    ];

    console.log('[SMS Webhook] Trying formats:', formatsToTry);

    // Query for any matching format using LIKE with digits
    const { data: flexData, error: flexError } = await supabase
      .from('profiles')
      .select('id, phone_number')
      .or(formatsToTry.map(f => `phone_number.eq.${f}`).join(','))
      .limit(1)
      .single();

    if (flexData) {
      console.log('[SMS Webhook] Flexible match found:', flexData.id, 'stored as:', flexData.phone_number);
      return flexData.id;
    }

    // Last resort: search for profiles where phone contains the last 10 digits
    // This handles cases like "(401) 555-1234" stored in DB
    const { data: likeData } = await supabase
      .from('profiles')
      .select('id, phone_number')
      .not('phone_number', 'is', null);

    if (likeData && likeData.length > 0) {
      // Manually check each profile's phone for a match
      for (const profile of likeData) {
        if (profile.phone_number) {
          const profileDigits = profile.phone_number.replace(/\D/g, '').slice(-10);
          if (profileDigits === last10Digits) {
            console.log('[SMS Webhook] Digits match found:', profile.id, 'stored as:', profile.phone_number);
            return profile.id;
          }
        }
      }
    }

    if (error && error.code !== 'PGRST116') {
      console.error('[SMS Webhook] Error looking up user by phone:', error);
    }

    console.log('[SMS Webhook] No user found for phone:', phoneNumber);
    return null;
  } catch (error) {
    console.error('[SMS Webhook] Error in getUserByPhoneNumber:', error);
    return null;
  }
}

/**
 * POST /api/sms/webhook
 *
 * Twilio webhook endpoint for incoming SMS messages
 *
 * Twilio sends POST requests with these parameters:
 * - From: Sender's phone number
 * - To: Your Twilio phone number
 * - Body: SMS message text
 * - MessageSid: Unique message ID
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await request.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    console.log(`[SMS Webhook] Received from ${from}: "${body}"`);

    // Validate required fields
    if (!from || !body) {
      console.error('[SMS Webhook] Missing required fields');
      return new NextResponse(
        formatTwiMLResponse('Error: Invalid message format'),
        {
          status: 400,
          headers: { 'Content-Type': 'text/xml' },
        }
      );
    }

    // Validate Twilio signature for security (if enabled)
    // Set TWILIO_REQUIRE_SIGNATURE=true in production once Twilio registration is approved
    const requireSignature = process.env.TWILIO_REQUIRE_SIGNATURE === 'true';
    const signature = request.headers.get('X-Twilio-Signature');

    console.log('[SMS Webhook] Signature validation:', {
      hasSignature: !!signature,
      requireSignature,
      webhookUrl: process.env.TWILIO_WEBHOOK_URL || 'not set',
    });

    if (signature && process.env.TWILIO_WEBHOOK_URL) {
      // Construct the full URL that Twilio used to sign the request
      const webhookUrl = process.env.TWILIO_WEBHOOK_URL;
      const params = Object.fromEntries(formData.entries()) as Record<string, string>;

      if (!validateWebhookSignature(signature, webhookUrl, params)) {
        console.error('[SMS Webhook] Invalid Twilio signature - URL mismatch or auth token issue');
        // Only block if signature validation is required
        if (requireSignature) {
          return new NextResponse(
            formatTwiMLResponse('Unauthorized'),
            {
              status: 401,
              headers: { 'Content-Type': 'text/xml' },
            }
          );
        } else {
          console.warn('[SMS Webhook] Signature invalid but validation not required, proceeding...');
        }
      } else {
        console.log('[SMS Webhook] Signature validated successfully');
      }
    } else if (requireSignature) {
      // Signature required but not provided
      console.error('[SMS Webhook] Missing Twilio signature but validation required');
      return new NextResponse(
        formatTwiMLResponse('Unauthorized'),
        {
          status: 401,
          headers: { 'Content-Type': 'text/xml' },
        }
      );
    }

    // Look up user by phone number
    const userId = await getUserByPhoneNumber(from);

    if (!userId) {
      console.log(`[SMS Webhook] No user found for phone number: ${from}`);
      return new NextResponse(
        formatTwiMLResponse(
          "Welcome to GiftStash! To save gift ideas via text, please add your phone number in the app settings first.\n\nVisit giftstash.app/settings to get started."
        ),
        {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        }
      );
    }

    console.log(`[SMS Webhook] Found user: ${userId}`);

    // Detect message intent
    const { intent, confidence } = detectMessageIntent(body);

    console.log(`[SMS Webhook] Detected intent: ${intent} (confidence: ${confidence})`);

    // Route message to appropriate handler with userId
    const responseMessage = await routeMessage(intent, body, from, userId);

    console.log(`[SMS Webhook] Response: "${responseMessage}"`);

    // Log the interaction (optional - for debugging and analytics)
    await logSMSInteraction({
      from,
      body,
      intent,
      response: responseMessage,
      messageSid,
    });

    // Return TwiML response
    return new NextResponse(
      formatTwiMLResponse(responseMessage),
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  } catch (error) {
    console.error('[SMS Webhook] Error:', error);

    // Return error message to user
    return new NextResponse(
      formatTwiMLResponse('Sorry, an error occurred processing your message. Please try again.'),
      {
        status: 500,
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  }
}

/**
 * GET /api/sms/webhook
 *
 * Healthcheck endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'SMS webhook is configured correctly',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log SMS interaction for debugging and analytics
 * Stores in sms_context table
 */
async function logSMSInteraction(data: {
  from: string;
  body: string;
  intent: string;
  response: string;
  messageSid: string;
}): Promise<void> {
  try {
    // TODO: Store in database for analytics and debugging
    // For now, just console log
    console.log('[SMS Log]', {
      timestamp: new Date().toISOString(),
      ...data,
    });

    // In Session 4, we'll implement proper database logging:
    /*
    const supabase = createServerSupabaseClient();
    await supabase.from('sms_context').insert({
      phone_number: data.from,
      message_body: data.body,
      detected_intent: data.intent,
      response_body: data.response,
      twilio_message_sid: data.messageSid,
      direction: 'inbound',
    });
    */
  } catch (error) {
    console.error('[SMS Log] Error logging interaction:', error);
    // Don't throw - logging failure shouldn't break the webhook
  }
}
