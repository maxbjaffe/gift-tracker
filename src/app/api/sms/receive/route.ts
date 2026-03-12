import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { GiftStashOrchestrator } from '@/lib/agents/orchestrator';

const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const MessagingResponse = twilio.twiml.MessagingResponse;

function twimlResponse(message: string, status = 200) {
  const twiml = new MessagingResponse();
  twiml.message(message);
  return new NextResponse(twiml.toString(), {
    status,
    headers: { 'Content-Type': 'text/xml' },
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const twilioSignature = request.headers.get('x-twilio-signature') || '';

    // Collect MMS images
    const numMedia = parseInt(formData.get('NumMedia') as string) || 0;
    const mediaUrls: string[] = [];
    const mediaTypes: string[] = [];
    for (let i = 0; i < numMedia; i++) {
      const url = formData.get(`MediaUrl${i}`) as string;
      const type = formData.get(`MediaContentType${i}`) as string;
      if (url && type?.startsWith('image/')) {
        mediaUrls.push(url);
        mediaTypes.push(type);
      }
    }

    // Handle keyword commands before signature validation
    const upper = (body || '').trim().toUpperCase();
    if (upper === 'EXPORT') {
      const { handleExportCommand } = await import('@/lib/sms/commands');
      return twimlResponse(await handleExportCommand(from));
    }
    if (upper === 'HELP') {
      const { handleHelpCommand } = await import('@/lib/sms/commands');
      return twimlResponse(await handleHelpCommand());
    }

    // Validate Twilio signature
    if (twilioAuthToken) {
      const params: Record<string, string> = {};
      formData.forEach((value, key) => {
        params[key] = value.toString();
      });
      if (!twilio.validateRequest(twilioAuthToken, twilioSignature, request.url, params)) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    // Look up user by phone number
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', from)
      .single();

    if (!user) {
      return twimlResponse(
        "Hi! I couldn't find your account. Please register your phone number in the app settings first."
      );
    }

    // Log SMS (fire-and-forget)
    supabase
      .from('sms_messages')
      .insert({ user_id: user.id, phone_number: from, message_body: body, processing_status: 'received' })
      .then();

    // Download MMS images for vision processing
    const images: { url: string; base64: string; mediaType: string }[] = [];
    for (let i = 0; i < mediaUrls.length; i++) {
      try {
        const res = await fetch(mediaUrls[i]);
        const buf = await res.arrayBuffer();
        images.push({
          url: mediaUrls[i],
          base64: Buffer.from(buf).toString('base64'),
          mediaType: mediaTypes[i],
        });
      } catch {
        // Skip failed image downloads
      }
    }

    // Route through orchestrator
    const orchestrator = new GiftStashOrchestrator();
    const result = await orchestrator.handleSMS(body, images, { id: user.id, phone: from });

    // Check onboarding
    const { checkAndSendOnboarding, getOnboardingMessage } = await import('@/lib/sms/commands');
    const needsOnboarding = await checkAndSendOnboarding(from, user.id);

    const twiml = new MessagingResponse();
    twiml.message(result.reply);
    if (needsOnboarding) {
      twiml.message(getOnboardingMessage());
    }

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Error processing SMS:', error);
    return twimlResponse('Sorry, there was an error processing your message. Please try again later.', 500);
  }
}
