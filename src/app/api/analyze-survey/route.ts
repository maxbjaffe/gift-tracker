// API Route: Analyze personality survey and generate profile suggestions

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

type Recipient = Database['public']['Tables']['recipients']['Row'];

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { recipientId, surveyResponses } = await request.json();

    if (!recipientId || !surveyResponses) {
      return NextResponse.json(
        { error: 'Recipient ID and survey responses are required' },
        { status: 400 }
      );
    }

    // Fetch current recipient profile
    const supabase = await createServerSupabaseClient();
    const { data: recipient, error: recipientError } = await supabase
      .from('recipients')
      .select('*')
      .eq('id', recipientId)
      .single();

    if (recipientError || !recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Type assertion after null check
    const validRecipient: Recipient = recipient;

    // Get previous surveys to show evolution
    const { data: previousSurveys } = await supabase
      .from('personality_surveys')
      .select('responses, created_at')
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false })
      .limit(3);

    // Build AI prompt
    const prompt = buildAnalysisPrompt(validRecipient, surveyResponses, previousSurveys || []);

    // Call Claude API
    // Using Claude 3 Haiku (fast and cost-effective, same as recommendations)
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse JSON response
    let profileSuggestions;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                       responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
      profileSuggestions = JSON.parse(jsonStr);

      // Validate that we got the expected fields
      if (!profileSuggestions || typeof profileSuggestions !== 'object') {
        throw new Error('Invalid response structure');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', responseText);
      return NextResponse.json(
        {
          error: 'Failed to parse AI response. The AI may have returned an invalid format.',
          details: parseError instanceof Error ? parseError.message : 'Unknown error',
          rawResponse: responseText.substring(0, 500) // First 500 chars for debugging
        },
        { status: 500 }
      );
    }

    // Save survey to database
    const { data: savedSurvey, error: saveError } = await supabase
      .from('personality_surveys')
      .insert({
        recipient_id: recipientId,
        user_id: validRecipient.user_id,
        survey_version: 'v1',
        responses: surveyResponses as any,
        profile_suggestions: profileSuggestions as any,
        applied: false,
      } as any)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving survey:', saveError);
      // Continue anyway - we have the suggestions
    }

    return NextResponse.json({
      success: true,
      suggestions: profileSuggestions,
      surveyId: (savedSurvey as any)?.id ?? null,
    });

  } catch (error) {
    console.error('Error analyzing survey:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze survey',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function buildAnalysisPrompt(
  recipient: any,
  surveyResponses: Record<string, any>,
  previousSurveys: any[]
): string {
  const currentProfile = {
    name: recipient.name,
    relationship: recipient.relationship,
    age_range: recipient.age_range,
    gender: recipient.gender,
    interests: recipient.interests,
    hobbies: recipient.hobbies,
    favorite_colors: recipient.favorite_colors,
    favorite_brands: recipient.favorite_brands,
    favorite_stores: recipient.favorite_stores,
    gift_preferences: recipient.gift_preferences,
    gift_dos: recipient.gift_dos,
    gift_donts: recipient.gift_donts,
    restrictions: recipient.restrictions,
    items_already_owned: recipient.items_already_owned,
    max_budget: recipient.max_budget,
    notes: recipient.notes,
  };

  return `You are an expert gift advisor analyzing a personality survey to build a comprehensive gift-giving profile.

**CURRENT RECIPIENT PROFILE:**
${JSON.stringify(currentProfile, null, 2)}

**NEW SURVEY RESPONSES:**
${JSON.stringify(surveyResponses, null, 2)}

${previousSurveys.length > 0 ? `**PREVIOUS SURVEYS (showing evolution):**
${JSON.stringify(previousSurveys, null, 2)}` : ''}

**YOUR TASK:**
Analyze the survey responses and the existing profile to generate intelligent, comprehensive profile updates.

**IMPORTANT RULES:**
1. **MERGE, DON'T REPLACE**: If a field already has data (like interests: ["reading", "cooking"]), ADD new items to it, don't replace it
2. **BE SPECIFIC**: Extract concrete details from responses (brand names, store names, specific interests)
3. **SKIP IF NULL/EMPTY**: If existing profile field is null/empty, you can fill it from scratch
4. **NO DUPLICATES**: Don't add items that are already in the existing arrays
5. **INFER INTELLIGENTLY**: Read between the lines to understand personality
6. **ACTIONABLE INSIGHTS**: Focus on details useful for gift recommendations

**OUTPUT FORMAT (CRITICAL):**
Return ONLY valid JSON - NO markdown, NO explanations, NO text before or after.
Each field should be an array of strings or a string:

{
  "interests": ["array of specific interests - merge with existing"],
  "hobbies": ["array of hobbies and activities - merge with existing"],
  "favorite_colors": ["array of specific colors mentioned"],
  "favorite_brands": ["array of brand names - add NEW ones from survey"],
  "favorite_stores": ["array of store names - add NEW ones from survey"],
  "gift_preferences": "detailed paragraph about their gift style and what they appreciate",
  "gift_dos": ["specific types of gifts they love - expand based on survey"],
  "gift_donts": ["specific types of gifts to avoid - expand based on survey"],
  "restrictions": ["dietary restrictions, allergies, or sensitivities"],
  "items_already_owned": ["things they have too many of - avoid duplicates"],
  "notes": "insightful summary with personality traits, shopping style, and gift-giving tips",
  "profile_summary": "2-3 sentence overview of who they are and what makes them unique",
  "gift_recommendations": ["5-7 specific gift category suggestions based on this profile"]
}

**IMPORTANT:**
- Return ONLY valid JSON, no markdown, no explanations
- Merge intelligently - don't just copy existing data
- Be specific with brand/store names from the survey
- Extract every useful detail from survey responses
- Make inferences about their style and personality
- Focus on actionable gift-giving insights`;
}
