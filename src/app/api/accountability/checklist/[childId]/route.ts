/**
 * Child Checklist API
 * GET /api/accountability/checklist/[childId] - Get child's checklist with today's completion status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { childId } = params;
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    // Get all active items for this child
    let itemsQuery = supabase
      .from('checklist_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('child_id', childId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    // Filter by weekdays if it's a weekend
    if (!isWeekday) {
      itemsQuery = itemsQuery.eq('weekdays_only', false);
    }

    const { data: items, error: itemsError } = await itemsQuery;

    if (itemsError) {
      console.error('Error fetching checklist items:', itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Get today's completions for this child
    const { data: completions, error: completionsError } = await supabase
      .from('checklist_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('child_id', childId)
      .eq('completion_date', today);

    if (completionsError) {
      console.error('Error fetching completions:', completionsError);
      return NextResponse.json({ error: completionsError.message }, { status: 500 });
    }

    // Create a set of completed item IDs for quick lookup
    const completedItemIds = new Set(completions?.map(c => c.item_id) || []);

    // Combine items with their completion status
    const checklist = items?.map(item => ({
      ...item,
      isCompleted: completedItemIds.has(item.id),
    })) || [];

    const stats = {
      total: checklist.length,
      completed: checklist.filter(item => item.isCompleted).length,
      remaining: checklist.filter(item => !item.isCompleted).length,
      isComplete: checklist.length > 0 && checklist.every(item => item.isCompleted),
    };

    return NextResponse.json({ checklist, stats });
  } catch (error: any) {
    console.error('Error in GET /api/accountability/checklist/[childId]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
