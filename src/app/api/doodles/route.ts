import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all drawings for the current user
export async function GET(request: NextRequest) {
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
    console.error('Error fetching drawings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ drawings });
}

// POST - Save a new drawing
export async function POST(request: NextRequest) {
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
    console.error('Error saving drawing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ drawing: data }, { status: 201 });
}

// DELETE - Delete a drawing
export async function DELETE(request: NextRequest) {
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
    console.error('Error deleting drawing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
