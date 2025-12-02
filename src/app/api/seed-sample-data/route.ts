import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/seed-sample-data
 *
 * Seeds sample recipient and gift data for new users so they can
 * immediately see how the app looks and works. Called on first dashboard visit.
 */
export async function POST() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has any recipients (not a new user)
    const { data: existingRecipients } = await supabase
      .from('recipients')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (existingRecipients && existingRecipients.length > 0) {
      return NextResponse.json({
        message: 'User already has data, skipping seed',
        seeded: false
      })
    }

    // Create sample recipient - "Sample Friend (Demo)"
    // Birthday set to 45 days from now so it shows in upcoming
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 45)
    const birthdayStr = futureDate.toISOString().split('T')[0]

    const { data: recipient, error: recipientError } = await supabase
      .from('recipients')
      .insert({
        user_id: user.id,
        name: 'Alex (Sample)',
        relationship: 'friend',
        birthday: birthdayStr,
        age_range: '25-34',
        gender: 'other',
        interests: ['cooking', 'reading', 'hiking', 'technology'],
        hobbies: ['photography', 'board games'],
        favorite_colors: ['blue', 'green'],
        favorite_stores: ['Amazon', 'Target', 'REI'],
        max_budget: 100,
        notes: 'This is a sample recipient to help you get started! Feel free to edit or delete.',
        gift_dos: ['Experiences over things', 'Eco-friendly products'],
        gift_donts: ['Nothing too bulky', 'No candles'],
      })
      .select()
      .single()

    if (recipientError) {
      console.error('Error creating sample recipient:', recipientError)
      return NextResponse.json({ error: 'Failed to create sample recipient' }, { status: 500 })
    }

    // Create sample gifts
    const sampleGifts = [
      {
        user_id: user.id,
        name: 'Wireless Earbuds',
        description: 'Great for hiking and workouts. Noise-canceling with good battery life.',
        current_price: 79.99,
        store: 'Amazon',
        category: 'electronics',
        status: 'idea',
        notes: 'This is a sample gift idea. You can edit details, change status, or delete it.',
        url: 'https://amazon.com',
      },
      {
        user_id: user.id,
        name: 'Cookbook: "Salt Fat Acid Heat"',
        description: 'Highly rated cookbook perfect for someone who loves cooking.',
        current_price: 24.99,
        store: 'Target',
        category: 'books',
        status: 'idea',
        notes: 'Sample gift - try changing the status to "purchased" to see how tracking works!',
      },
    ]

    const { data: gifts, error: giftsError } = await supabase
      .from('gifts')
      .insert(sampleGifts)
      .select()

    if (giftsError) {
      console.error('Error creating sample gifts:', giftsError)
      // Still return success since recipient was created
    }

    // Link gifts to recipient via gift_recipients junction table
    if (gifts && gifts.length > 0) {
      const giftRecipientLinks = gifts.map((gift) => ({
        user_id: user.id,
        gift_id: gift.id,
        recipient_id: recipient.id,
        status: 'idea',
        occasion: 'birthday',
      }))

      const { error: linkError } = await supabase
        .from('gift_recipients')
        .insert(giftRecipientLinks)

      if (linkError) {
        console.error('Error linking gifts to recipient:', linkError)
      }
    }

    return NextResponse.json({
      message: 'Sample data created successfully',
      seeded: true,
      recipient: recipient,
      giftsCount: gifts?.length || 0,
    })

  } catch (error) {
    console.error('Error seeding sample data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
