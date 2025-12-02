import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { formatTwiMLResponse, validateWebhookSignature, formatPhoneNumber } from '@/lib/sms/twilio-client';
import { detectMessageIntent, routeMessage } from '@/lib/sms/message-router';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Look up user by phone number
 * Searches the profiles table for a matching phone_number field
 */
async function getUserByPhoneNumber(phoneNumber: string): Promise<string | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalize phone number to E.164 format for comparison
    const normalizedPhone = formatPhoneNumber(phoneNumber);

    // Try exact match first
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', normalizedPhone)
      .single();

    if (data) {
      return data.id;
    }

    // If no exact match, try without +1 prefix (in case stored differently)
    if (normalizedPhone.startsWith('+1')) {
      const withoutCountryCode = normalizedPhone.slice(2);
      const { data: data2 } = await supabase
        .from('profiles')
        .select('id')
        .or(`phone_number.eq.${withoutCountryCode},phone_number.eq.${normalizedPhone}`)
        .single();

      if (data2) {
        return data2.id;
      }
    }

    if (error && error.code !== 'PGRST116') {
      console.error('[SMS Webhook] Error looking up user by phone:', error);
    }

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

    // Validate Twilio signature for security
    const signature = request.headers.get('X-Twilio-Signature');
    if (signature) {
      // Construct the full URL that Twilio used to sign the request
      // In production, use the actual webhook URL, not request.url which may differ
      const webhookUrl = process.env.TWILIO_WEBHOOK_URL || request.url;
      const params = Object.fromEntries(formData.entries()) as Record<string, string>;

      if (!validateWebhookSignature(signature, webhookUrl, params)) {
        console.error('[SMS Webhook] Invalid Twilio signature');
        return new NextResponse(
          formatTwiMLResponse('Unauthorized'),
          {
            status: 401,
            headers: { 'Content-Type': 'text/xml' },
          }
        );
      }
    } else if (process.env.NODE_ENV === 'production') {
      // In production, require signature validation
      console.error('[SMS Webhook] Missing Twilio signature in production');
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
