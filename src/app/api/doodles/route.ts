import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// GET - Fetch all drawings for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: drawings, error } = await supabase
      .from('doodle_drawings')
      .select('id, title, thumbnail_data, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching drawings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ drawings });
  } catch (error) {
    logger.error('Unexpected error in GET /api/doodles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save a new drawing
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
    const { title, imageData } = body;

    if (!imageData) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Create a smaller thumbnail (you could enhance this to actually resize the image)
    const thumbnailData = imageData; // For now, use same data

    const { data, error } = await supabase
      .from('doodle_drawings')
      .insert({
        user_id: user.id,
        title: title || `Doodle ${new Date().toLocaleDateString()}`,
        image_data: imageData,
        thumbnail_data: thumbnailData,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error saving drawing:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ drawing: data }, { status: 201 });
  } catch (error) {
    logger.error('Unexpected error in POST /api/doodles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a drawing
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Drawing ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('doodle_drawings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      logger.error('Error deleting drawing:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Unexpected error in DELETE /api/doodles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
