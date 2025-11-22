/**
 * API Endpoint: POST /api/recipients/match
 *
 * Matches a search name/term against user's recipients using fuzzy matching
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { findRecipientMatch } from '@/lib/recipient-matcher';
import type { MatchRequest, MatchResponse } from '@/types/recipient-matching';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: MatchRequest = await request.json();
    const { searchName, userId } = body;

    // Validate input
    if (!searchName || searchName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search name is required' },
        { status: 400 }
      );
    }

    // Use authenticated user's ID if not provided
    const targetUserId = userId || user.id;

    // Perform matching
    const matchResult = await findRecipientMatch(searchName, targetUserId, supabase);

    // Remove debug info in production
    const response: MatchResponse = {
      ...matchResult,
      debug: process.env.NODE_ENV === 'development' ? matchResult.debug : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in recipient match API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
