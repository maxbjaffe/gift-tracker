import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Database } from '@/Types/database.types'

type Recipient = Database['public']['Tables']['recipients']['Row']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { recipientId, budget, occasion } = body

    // Get recipient details
    const { data: recipient, error: recipientError } = await supabase
      .from('recipients')
      .select('*')
      .eq('id', recipientId)
      .eq('user_id', user.id)
      .single()

    if (recipientError) {
      return NextResponse.json(
        { error: 'Recipient not found', details: recipientError.message },
        { status: 404 }
      )
    }

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      )
    }

    // Type assertion after null check
    const validRecipient: Recipient = recipient

    // Initialize Anthropic client
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const anthropic = new Anthropic({ apiKey })

    // Build prompt
    const prompt = `You are a helpful gift suggestion assistant. Based on the following information about a person, suggest 5 thoughtful gift ideas.

Person Details:
- Name: ${validRecipient.name}
- Relationship: ${validRecipient.relationship || 'Not specified'}
- Age Range: ${validRecipient.age_range || 'Not specified'}
- Gender: ${validRecipient.gender || 'Not specified'}
- Interests: ${validRecipient.interests?.join(', ') || 'Not specified'}
- Hobbies: ${validRecipient.hobbies?.join(', ') || 'Not specified'}
- Favorite Brands: ${validRecipient.favorite_brands?.join(', ') || 'Not specified'}
- Favorite Stores: ${validRecipient.favorite_stores?.join(', ') || 'Not specified'}
${budget ? `- Budget: $${budget}` : ''}
${occasion ? `- Occasion: ${occasion}` : ''}

Please suggest 5 specific gift ideas. For each gift, provide:
1. Gift name
2. Brief description (1-2 sentences)
3. Estimated price range
4. Why it's a good match

Format your response as JSON array with this structure:
[
  {
    "name": "Gift Name",
    "description": "Description here",
    "price_range": "$X-$Y",
    "reason": "Why it's a good match"
  }
]`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Extract the text content
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : ''

    // Try to parse JSON from response
    let suggestions = []
    try {
      // Look for JSON array in the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Return raw response if parsing fails
      return NextResponse.json({
        success: true,
        suggestions: [],
        rawResponse: responseText
      })
    }

    return NextResponse.json({
      success: true,
      suggestions,
      recipient: {
        name: validRecipient.name,
        relationship: validRecipient.relationship
      }
    })

  } catch (error: any) {
    console.error('Error generating AI suggestions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}
