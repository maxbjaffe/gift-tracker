import { NextRequest, NextResponse } from 'next/server';
import { formatTwiMLResponse, validateWebhookSignature } from '@/lib/sms/twilio-client';
import { detectMessageIntent, routeMessage } from '@/lib/sms/message-router';

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

    // Optional: Validate Twilio signature for security
    // Uncomment when deploying to production
    /*
    const signature = request.headers.get('X-Twilio-Signature');
    const url = request.url;
    const params = Object.fromEntries(formData.entries()) as Record<string, string>;

    if (signature && !validateWebhookSignature(signature, url, params)) {
      console.error('[SMS Webhook] Invalid Twilio signature');
      return new NextResponse(
        formatTwiMLResponse('Unauthorized'),
        {
          status: 401,
          headers: { 'Content-Type': 'text/xml' },
        }
      );
    }
    */

    // Detect message intent
    const { intent, confidence } = detectMessageIntent(body);

    console.log(`[SMS Webhook] Detected intent: ${intent} (confidence: ${confidence})`);

    // Route message to appropriate handler
    const responseMessage = await routeMessage(intent, body, from);

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
