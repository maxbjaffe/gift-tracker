/**
 * API Endpoint: GET /api/recipients/suggest
 *
 * Provides recipient suggestions for autocomplete/typeahead
 * Query params: ?q=search&limit=10
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRecipientSuggestions } from '@/lib/recipient-matcher';
import type { SuggestResponse } from '@/types/recipient-matching';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limitParam = searchParams.get('limit');
    const userIdParam = searchParams.get('userId');

    // Validate query
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Parse limit (default 10, max 50)
    const limit = limitParam ? Math.min(parseInt(limitParam), 50) : 10;

    // Use authenticated user's ID if not provided
    const targetUserId = userIdParam || user.id;

    // Get suggestions
    const suggestions = await getRecipientSuggestions(
      query,
      targetUserId,
      supabase,
      limit
    );

    const response: SuggestResponse = {
      suggestions,
      total: suggestions.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in recipient suggest API:', error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
