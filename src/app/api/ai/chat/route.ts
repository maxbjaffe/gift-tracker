import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { GiftStashOrchestrator } from '@/lib/agents/orchestrator';
import { logger } from '@/lib/logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Quick check: is the latest user message an actionable gift command
 * that an agent should handle (vs. general conversation)?
 */
const ACTION_PATTERNS = [
  // capture
  /\b(save|add|track|log|gift idea|picked up|get her|get him|buy|found|saw)\b/i,
  // lookup
  /\b(what do i have|what.*saved|show me.*gifts?|list.*gifts?)\b/i,
  // suggest
  /\b(help me find|suggest|recommend|ideas for)\b/i,
  // budget
  /\b(how much.*spent|budget|spending|total.*cost)\b/i,
  // occasion
  /\b(when is|upcoming.*birthday|anniversary|what.*coming up)\b/i,
  // inventory
  /\b(on hand|in stock|stash|closet|what.*purchased|what.*wrapped)\b/i,
  // enrich
  /\b(find links|where to buy|price check|how much.*cost)\b/i,
  // status
  /\b(mark.*as|set.*to|update.*status|i bought|i wrapped|i gave)\b/i,
];

function isActionable(message: string): boolean {
  return ACTION_PATTERNS.some((p) => p.test(message));
}

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

    // Check if the latest message is an actionable command
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user' && isActionable(lastMessage.content)) {
      // Route through agent system
      const orchestrator = new GiftStashOrchestrator();
      const result = await orchestrator.handleSMS(
        lastMessage.content,
        [], // no images from web chat (yet)
        { id: user.id, phone: 'web-chat' }
      );

      // Return agent response as a streamed SSE (same format the UI expects)
      const agentStream = new ReadableStream({
        start(controller) {
          // Send agent path as metadata
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ agentPath: result.agentPath, persona: result.persona })}\n\n`
            )
          );
          // Send the reply as text chunks (single chunk for agent responses)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: result.reply })}\n\n`)
          );
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(agentStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Non-actionable: fall through to streaming conversation
    let contextPrompt = '';

    if (includeContext) {
      const [{ data: recipients }, { data: giftsData }] = await Promise.all([
        supabase
          .from('recipients')
          .select('name, relationship, age_range, interests, birthday')
          .eq('user_id', user.id),
        supabase
          .from('gifts')
          .select('name, current_price, category, recipients(name)')
          .eq('user_id', user.id)
          .limit(50),
      ]);

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
              r.age_range ? `, age range: ${r.age_range}` : ''
            }${r.interests && r.interests.length > 0 ? `, interests: ${(r.interests as string[]).join(', ')}` : ''}`
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

IMPORTANT: You can also help users manage their gifts. If they ask to save a gift, look up gifts, check their budget, update a status, etc., just tell them to phrase it as a command (e.g., "Save AirPods for Mom - $249") and you'll handle it automatically.`.trim();
    }

    const systemPrompt = `You are a helpful gift advisor assistant for GiftStash. You help users discover thoughtful gift ideas for their loved ones.

${contextPrompt}

When suggesting gifts:
- Be specific and practical
- Consider the recipient's age, interests, and relationship
- Provide price estimates when possible
- Explain why each gift would be meaningful
- Avoid suggesting gifts the user already has
- Ask clarifying questions to better understand their needs

Keep responses conversational and friendly. Format gift suggestions clearly so they're easy to scan.`;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = await anthropic.messages.stream({
            model: 'claude-haiku-4-5-20251001',
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
          logger.error('Stream error:', error);
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
    logger.error('Chat error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
