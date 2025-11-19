import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function verifyToken(token: string | null): Promise<string | null> {
  if (!token) return null;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('kiosk_token', token)
    .single();

  return profile?.id || null;
}

/**
 * GET /api/kiosk/checklist/[childId]?token=xxx
 * Get checklist for a child with completion status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    const userId = await verifyToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const childId = params.childId;
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Get checklist items for this child
    let query = supabase
      .from('checklist_items')
      .select('*')
      .eq('child_id', childId)
      .eq('is_active', true)
      .order('display_order');

    // On weekends, exclude weekday-only items
    if (isWeekend) {
      query = query.eq('weekdays_only', false);
    }

    const { data: items, error: itemsError } = await query;

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Get today's completions
    const { data: completions, error: completionsError } = await supabase
      .from('checklist_completions')
      .select('item_id')
      .eq('child_id', childId)
      .eq('completion_date', today);

    if (completionsError) {
      return NextResponse.json({ error: completionsError.message }, { status: 500 });
    }

    const completedItemIds = new Set(completions?.map((c) => c.item_id) || []);

    // Combine items with completion status
    const checklist = items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      icon: item.icon,
      display_order: item.display_order,
      isCompleted: completedItemIds.has(item.id),
    }));

    const stats = {
      total: checklist.length,
      completed: checklist.filter((item) => item.isCompleted).length,
      remaining: checklist.filter((item) => !item.isCompleted).length,
      isComplete: checklist.length > 0 && checklist.every((item) => item.isCompleted),
    };

    return NextResponse.json({ checklist, stats });
  } catch (error) {
    console.error('Error fetching checklist:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
