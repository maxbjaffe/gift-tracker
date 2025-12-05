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

    // Check for MMS media (images)
    const numMedia = parseInt(formData.get('NumMedia') as string) || 0;
    const mediaUrls: string[] = [];
    const mediaTypes: string[] = [];

    for (let i = 0; i < numMedia; i++) {
      const mediaUrl = formData.get(`MediaUrl${i}`) as string;
      const mediaType = formData.get(`MediaContentType${i}`) as string;
      if (mediaUrl && mediaType?.startsWith('image/')) {
        mediaUrls.push(mediaUrl);
        mediaTypes.push(mediaType);
      }
    }

    // Check for GiftStash commands (EXPORT, HELP, etc.)
    const messageText = (body || '').trim().toUpperCase();

    if (messageText === 'EXPORT') {
      const { handleExportCommand } = await import('@/lib/sms/commands');
      const response = await handleExportCommand(from);
      const twiml = new MessagingResponse();
      twiml.message(response);
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    if (messageText === 'HELP') {
      const { handleHelpCommand } = await import('@/lib/sms/commands');
      const response = await handleHelpCommand();
      const twiml = new MessagingResponse();
      twiml.message(response);
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Route to accountability system if message is about consequences/commitments
    const { detectMessageIntent, routeMessage } = await import('@/lib/sms/message-router');
    const { formatTwiMLResponse } = await import('@/lib/sms/twilio-client');

    const { intent } = detectMessageIntent(body);

    if (['consequence', 'commitment', 'query', 'response'].includes(intent)) {
      const response = await routeMessage(intent, body, from);
      return new NextResponse(formatTwiMLResponse(response), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Otherwise, continue with gift tracking logic below
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

    // Process images with Vision AI if present
    const hasImages = mediaUrls.length > 0;
    let imageData: any[] = [];

    if (hasImages) {
      // Download and encode images for Vision API
      for (let i = 0; i < mediaUrls.length; i++) {
        try {
          const imageResponse = await fetch(mediaUrls[i]);
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');

          imageData.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaTypes[i],
              data: base64Image,
            },
          });
        } catch (error) {
          console.error(`Error downloading image ${i}:`, error);
        }
      }
    }

    // Build prompt for Claude (with or without vision)
    const parsePrompt = hasImages && imageData.length > 0
      ? `You are a gift tracking assistant. Analyze the image(s) and text message to extract gift information.

SMS Message: "${body || '(no text - analyze image only)'}"

Look at the image(s) and extract:
- recipient_names: Who is this gift for? Extract ALL names mentioned in text (array of strings). Examples: ["Sarah"], ["Mom", "Dad"], ["the kids"]. If no names in text, return []
- gift_name: What is the product/gift shown in the image?
- price: Any price visible in the image or mentioned in text (as a number, no currency symbols)
- category: What category? (Electronics, Books, Toys, Fashion, Home, Sports, Beauty, Food, Games, Art, or Other)
- url: Any product URL found in the message
- notes: Description of the product from the image and any additional context from text

Respond ONLY with valid JSON in this exact format:
{
  "recipient_names": ["string"] or [],
  "gift_name": "string or null",
  "price": number or null,
  "category": "string or null",
  "url": "string or null",
  "notes": "string or null"
}

If you can't extract certain information, use null for that field (or empty array for recipient_names).`
      : `You are a gift tracking assistant. Parse this SMS message and extract gift information.

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

    // Use Vision model if images present, otherwise use text-only
    const modelsToTry = hasImages && imageData.length > 0
      ? ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229']
      : ['claude-3-5-haiku-20241022', 'claude-3-haiku-20240307'];

    let message;
    let lastError;

    for (const model of modelsToTry) {
      try {

        // Build content array with text and images (if present)
        const contentArray: any[] = [];

        // Add images first if present
        if (imageData.length > 0) {
          contentArray.push(...imageData);
        }

        // Add text prompt
        contentArray.push({
          type: 'text',
          text: parsePrompt,
        });

        message = await anthropic.messages.create({
          model,
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: contentArray,
            },
          ],
        });
        break; // Success! Exit loop
      } catch (error: any) {
        lastError = error;
        continue; // Try next model
      }
    }

    if (!message) {
      console.error('All models failed. Last error:', lastError);
      throw lastError;
    }

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

    // Update the SMS record with parsed data
    if (smsRecord) {
      await supabase
        .from('sms_messages')
        .update({ parsed_data: parsedData })
        .eq('id', smsRecord.id);
    }

    // Store images in Supabase Storage if present
    let storedImageUrls: string[] = [];

    if (hasImages && mediaUrls.length > 0) {
      for (let i = 0; i < mediaUrls.length; i++) {
        try {
          // Download the image from Twilio
          const imageResponse = await fetch(mediaUrls[i]);
          const imageBuffer = await imageResponse.arrayBuffer();

          // Generate unique filename
          const timestamp = Date.now();
          const fileExtension = mediaTypes[i].split('/')[1] || 'jpg';
          const filename = `sms-gifts/${userId}/${timestamp}-${i}.${fileExtension}`;

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('gift-images')
            .upload(filename, imageBuffer, {
              contentType: mediaTypes[i],
              upsert: false,
            });

          if (uploadError) {
            console.error(`Error uploading image ${i}:`, uploadError);
          } else {
            // Get public URL
            const { data: publicUrlData } = supabase.storage
              .from('gift-images')
              .getPublicUrl(filename);

            storedImageUrls.push(publicUrlData.publicUrl);
          }
        } catch (error) {
          console.error(`Error processing image ${i}:`, error);
        }
      }
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
          image_url: storedImageUrls.length > 0 ? storedImageUrls[0] : null, // Use first image as main
          status: 'idea',
          source: 'sms',
          source_metadata: {
            original_sms: body,
            parsed_data: parsedData,
            phone_number: from,
            has_images: mediaUrls.length > 0,
            num_images: mediaUrls.length,
            media_urls: mediaUrls,
            stored_image_urls: storedImageUrls,
            analyzed_with_vision: imageData.length > 0,
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

    // Check if user needs onboarding
    const { checkAndSendOnboarding, getOnboardingMessage } = await import('@/lib/sms/commands');
    const needsOnboarding = await checkAndSendOnboarding(from, userId);

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
      const imageText = storedImageUrls.length > 0 ? ` + ${storedImageUrls.length} image(s)` : '';

      twiml.message(
        `✓ Gift saved: "${parsedData.gift_name}"${priceText}${recipientText}${urlText}${imageText}. View at ${process.env.NEXT_PUBLIC_APP_URL}/gifts`
      );

      // Send onboarding as a follow-up message if needed
      if (needsOnboarding) {
        twiml.message(getOnboardingMessage());
      }
    } else {
      const helpText = hasImages
        ? `I received your image but couldn't identify the gift. Please text a description like: "LEGO set for Mom"`
        : `I received your message but couldn't extract a clear gift idea. Try: "AirPods Pro for Sarah and Jake - $249 https://amazon.com/..."`;

      twiml.message(helpText);

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
