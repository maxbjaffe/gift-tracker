import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import twilio from 'twilio';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY!;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

// Initialize clients
const anthropic = new Anthropic({ apiKey: anthropicApiKey });
const MessagingResponse = twilio.twiml.MessagingResponse;

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming form data from Twilio
    const formData = await request.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const twilioSignature = request.headers.get('x-twilio-signature') || '';

    console.log('Received SMS from:', from, 'Message:', body);
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasAnthropicKey: !!anthropicApiKey,
      hasTwilioToken: !!twilioAuthToken,
    });

    // Validate Twilio signature for security (skip if token not available)
    if (twilioAuthToken) {
      const url = request.url;
      const params: { [key: string]: string } = {};
      formData.forEach((value, key) => {
        params[key] = value.toString();
      });

      const isValid = twilio.validateRequest(twilioAuthToken, twilioSignature, url, params);
      if (!isValid) {
        console.error('Invalid Twilio signature');
        return new NextResponse('Unauthorized', { status: 401 });
      }
    } else {
      console.warn('⚠️  TWILIO_AUTH_TOKEN not set - skipping signature validation (INSECURE!)');
    }

    // Create Supabase admin client (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // TODO: Map phone number to user_id
    // For now, we'll need to add a phone_number field to user profiles
    // or create a separate phone_number mapping table
    // This is a placeholder - you'll need to implement user lookup
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', from)
      .single();

    if (userError || !userData) {
      console.log('User not found for phone:', from);
      const twiml = new MessagingResponse();
      twiml.message(
        "Hi! I couldn't find your account. Please register your phone number in the app settings first."
      );
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    const userId = userData.id;

    // Log the SMS message
    const { data: smsRecord, error: smsError } = await supabase
      .from('sms_messages')
      .insert({
        user_id: userId,
        phone_number: from,
        message_body: body,
        processing_status: 'received',
      })
      .select()
      .single();

    if (smsError) {
      console.error('Error logging SMS:', smsError);
    }

    // Use Claude to parse the SMS message
    const parsePrompt = `You are a gift tracking assistant. Parse this SMS message and extract gift information.

SMS Message: "${body}"

Extract the following information:
- recipient_names: Who is this gift for? Extract ALL names mentioned (array of strings). Examples: ["Sarah"], ["Mom", "Dad"], ["the kids"]
- gift_name: What is the gift?
- price: Estimated or actual price (as a number, no currency symbols)
- category: What category does this fit in? (Electronics, Books, Toys, Fashion, Home, Sports, Beauty, Food, Games, Art, or Other)
- url: Any product URL found in the message (Amazon, Target, etc.)
- notes: Any additional notes or context

Respond ONLY with valid JSON in this exact format:
{
  "recipient_names": ["string"] or [],
  "gift_name": "string or null",
  "price": number or null,
  "category": "string or null",
  "url": "string or null",
  "notes": "string or null"
}

If you can't extract certain information, use null for that field (or empty array for recipient_names).`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: parsePrompt,
        },
      ],
    });

    // Extract the JSON from Claude's response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    let parsedData;

    try {
      // Extract JSON from the response (Claude might wrap it in markdown)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      parsedData = {
        recipient_names: [],
        gift_name: null,
        price: null,
        category: null,
        url: null,
        notes: body,
      };
    }

    console.log('Parsed gift data:', parsedData);

    // Update the SMS record with parsed data
    if (smsRecord) {
      await supabase
        .from('sms_messages')
        .update({ parsed_data: parsedData })
        .eq('id', smsRecord.id);
    }

    // If we have a gift name, try to create the gift
    let createdGift = null;
    let recipientIds: string[] = [];

    if (parsedData.gift_name) {
      // Try to find matching recipients (support multiple)
      if (parsedData.recipient_names && parsedData.recipient_names.length > 0) {
        for (const recipientName of parsedData.recipient_names) {
          const { data: recipientData } = await supabase
            .from('recipients')
            .select('id')
            .eq('user_id', userId)
            .ilike('name', `%${recipientName}%`)
            .limit(1)
            .single();

          if (recipientData) {
            recipientIds.push(recipientData.id);
          } else {
            console.log(`Recipient not found: ${recipientName}`);
          }
        }
      }

      // Create the gift
      const { data: giftData, error: giftError } = await supabase
        .from('gifts')
        .insert({
          user_id: userId,
          name: parsedData.gift_name,
          description: parsedData.notes || '',
          current_price: parsedData.price || null,
          category: parsedData.category || null,
          url: parsedData.url || null,
          status: 'idea',
          source: 'sms',
          source_metadata: {
            original_sms: body,
            parsed_data: parsedData,
            phone_number: from,
          },
        })
        .select()
        .single();

      if (giftError) {
        console.error('Error creating gift:', giftError);
      } else {
        createdGift = giftData;

        // Link to ALL matched recipients
        if (recipientIds.length > 0 && createdGift) {
          const associations = recipientIds.map((recipientId) => ({
            gift_id: createdGift.id,
            recipient_id: recipientId,
          }));

          await supabase.from('gift_recipients').insert(associations);
        }

        // Update SMS record with created gift ID
        if (smsRecord) {
          await supabase
            .from('sms_messages')
            .update({
              created_gift_id: createdGift.id,
              processing_status: 'processed',
            })
            .eq('id', smsRecord.id);
        }
      }
    }

    // Send confirmation SMS via TwiML
    const twiml = new MessagingResponse();

    if (createdGift) {
      let recipientText = '';
      if (recipientIds.length > 0) {
        const names = parsedData.recipient_names?.slice(0, recipientIds.length).join(', ') || '';
        recipientText = ` for ${names}`;
      } else if (parsedData.recipient_names && parsedData.recipient_names.length > 0) {
        recipientText = ` (couldn't find: ${parsedData.recipient_names.join(', ')} - you can assign later)`;
      }

      const priceText = parsedData.price ? ` ($${parsedData.price})` : '';
      const urlText = parsedData.url ? ' (with link)' : '';

      twiml.message(
        `✓ Gift saved: "${parsedData.gift_name}"${priceText}${recipientText}${urlText}. View at ${process.env.NEXT_PUBLIC_APP_URL}/gifts`
      );
    } else {
      twiml.message(
        `I received your message but couldn't extract a clear gift idea. Try: "AirPods Pro for Sarah and Jake - $249 https://amazon.com/..."`
      );

      // Update SMS status to error
      if (smsRecord) {
        await supabase
          .from('sms_messages')
          .update({
            processing_status: 'error',
            error_message: 'Could not extract gift information',
          })
          .eq('id', smsRecord.id);
      }
    }

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Error processing SMS:', error);

    // Return error TwiML
    const twiml = new MessagingResponse();
    twiml.message('Sorry, there was an error processing your message. Please try again later.');

    return new NextResponse(twiml.toString(), {
      status: 500,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
