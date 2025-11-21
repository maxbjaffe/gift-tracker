/**
 * Family Info Chat API
 * AI-powered chat interface for querying family information using Claude
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, conversationId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user's family information for context
    const { data: familyInfo, error: fetchError } = await supabase
      .from('family_information')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);

    if (fetchError) {
      console.error('Error fetching family info:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch context' }, { status: 500 });
    }

    // Build context for Claude
    const contextSummary = familyInfo
      ?.map((item) => {
        return `Type: ${item.type}
Title: ${item.title}
Description: ${item.description || 'N/A'}
Details: ${item.details || 'N/A'}
Tags: ${item.tags?.join(', ') || 'N/A'}
Status: ${item.status}`;
      })
      .join('\n\n---\n\n');

    // Get conversation history if continuing a conversation
    let conversationHistory: any[] = [];
    if (conversationId) {
      const { data: conversation } = await supabase
        .from('family_info_conversations')
        .select('messages')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (conversation) {
        conversationHistory = conversation.messages || [];
      }
    }

    // Build messages for Claude
    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: `You are a helpful family information assistant. You have access to the user's family information database including insurance policies, contacts, financial accounts, healthcare records, and other important family documents.

The user's current family information:

${contextSummary}

When answering questions:
1. Search through the provided information for relevant details
2. Provide specific, accurate answers based on the data
3. If information is not available, say so clearly
4. Reference which document/entry the information comes from
5. Be concise but thorough
6. Suggest related information that might be helpful

Always prioritize accuracy and cite your sources from the family information database.`,
      messages,
    });

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : '';

    // Save or update conversation
    const newMessages = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: assistantMessage, timestamp: new Date().toISOString() },
    ];

    let savedConversationId = conversationId;

    if (conversationId) {
      // Update existing conversation
      await supabase
        .from('family_info_conversations')
        .update({
          messages: newMessages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
        .eq('user_id', user.id);
    } else {
      // Create new conversation
      const title = message.substring(0, 100); // First 100 chars as title
      const { data: newConversation } = await supabase
        .from('family_info_conversations')
        .insert({
          user_id: user.id,
          title,
          messages: newMessages,
        })
        .select('id')
        .single();

      savedConversationId = newConversation?.id;
    }

    return NextResponse.json({
      response: assistantMessage,
      conversationId: savedConversationId,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (error: any) {
    console.error('Error in family info chat:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: 'AI service error', details: error.message },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Retrieve conversation history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (conversationId) {
      // Get specific conversation
      const { data: conversation, error } = await supabase
        .from('family_info_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      return NextResponse.json({ conversation });
    } else {
      // Get all conversations
      const { data: conversations, error } = await supabase
        .from('family_info_conversations')
        .select('id, title, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
      }

      return NextResponse.json({ conversations });
    }
  } catch (error) {
    console.error('Error in GET conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
