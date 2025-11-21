import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, description, details } = body;

    if (!details || !type) {
      return NextResponse.json(
        { error: 'Type and details are required' },
        { status: 400 }
      );
    }

    // Use Claude to enhance the details and suggest tags
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `You are a helpful assistant that enhances family information entries.
Your job is to:
1. Clean up and format the user's input in markdown
2. Add helpful structure and organization
3. Suggest relevant tags
4. Fill in any obvious missing sections based on the entry type

Keep the user's original information but make it more organized and useful.
Be concise and practical.`,
      messages: [
        {
          role: 'user',
          content: `Entry Type: ${type}
Title: ${title || 'Not provided'}
Description: ${description || 'Not provided'}

Current Details:
${details}

Please enhance this entry by:
1. Reformatting the details in clean markdown with appropriate headers and structure
2. Adding any obviously missing sections that would be useful for this type of entry
3. Suggesting 3-5 relevant tags

Format your response as JSON:
{
  "enhancedDetails": "enhanced markdown content here",
  "suggestedTags": ["tag1", "tag2", "tag3"]
}`,
        },
      ],
    });

    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Try to parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        enhancedDetails: result.enhancedDetails,
        suggestedTags: result.suggestedTags || [],
      });
    }

    // Fallback: return the response as enhanced details
    return NextResponse.json({
      enhancedDetails: responseText,
      suggestedTags: [],
    });
  } catch (error) {
    console.error('Error enhancing entry:', error);
    return NextResponse.json(
      { error: 'Failed to enhance entry' },
      { status: 500 }
    );
  }
}
