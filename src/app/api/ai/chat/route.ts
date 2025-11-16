import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const { messages, includeContext } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    // Get Supabase client and user data
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Build context if requested
    let contextPrompt = '';

    if (includeContext) {
      // Get recipients
      const { data: recipients } = await supabase
        .from('recipients')
        .select('name, relationship, age, interests, birthday')
        .eq('user_id', user.id);

      // Get existing gifts
      const { data: giftsData } = await supabase
        .from('gifts')
        .select('name, current_price, category, recipients(name)')
        .eq('user_id', user.id)
        .limit(50);

      const gifts = giftsData || [];

      contextPrompt = `
CONTEXT ABOUT THE USER'S GIFT TRACKING:

Recipients you're shopping for:
${
  recipients && recipients.length > 0
    ? recipients
        .map(
          (r) =>
            `- ${r.name}${r.relationship ? ` (${r.relationship})` : ''}${
              r.age ? `, age ${r.age}` : ''
            }${r.interests ? `, interests: ${r.interests}` : ''}`
        )
        .join('\n')
    : '- No recipients added yet'
}

Gifts already saved:
${
  gifts.length > 0
    ? gifts
        .map((g) => {
          const recipientNames = Array.isArray(g.recipients)
            ? g.recipients.map((r: any) => r.name).join(', ')
            : 'Unassigned';
          return `- ${g.name}${g.current_price ? ` ($${g.current_price})` : ''} for ${recipientNames}`;
        })
        .join('\n')
    : '- No gifts saved yet'
}

Use this context to provide personalized gift recommendations and avoid suggesting gifts they already have.
`.trim();
    }

    // System prompt
    const systemPrompt = `You are a helpful gift advisor assistant. You help users discover thoughtful gift ideas for their loved ones.

${contextPrompt}

When suggesting gifts:
- Be specific and practical
- Consider the recipient's age, interests, and relationship
- Provide price estimates when possible
- Explain why each gift would be meaningful
- Avoid suggesting gifts the user already has
- Ask clarifying questions to better understand their needs

Keep responses conversational and friendly. Format gift suggestions clearly so they're easy to scan.`;

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = await anthropic.messages.stream({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 2000,
            system: systemPrompt,
            messages: messages.map((m: any) => ({
              role: m.role,
              content: m.content,
            })),
          });

          for await (const chunk of messageStream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const text = chunk.delta.text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
