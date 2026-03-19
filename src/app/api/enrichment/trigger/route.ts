import { NextRequest, NextResponse } from 'next/server';
import { enrichGiftImages } from '@/lib/image-enrichment/enrichment-service';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const { giftId, url, name } = await request.json();

    if (!giftId) {
      return NextResponse.json({ error: 'giftId is required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Check if job already exists and is completed
    const { data: existingJob } = await supabase
      .from('gift_enrichment_jobs')
      .select('status')
      .eq('gift_id', giftId)
      .single();

    if (existingJob?.status === 'completed') {
      return NextResponse.json({ status: 'already_completed' });
    }

    if (existingJob?.status === 'processing') {
      return NextResponse.json({ status: 'already_processing' });
    }

    // Run enrichment (fits within Vercel's 60s function limit)
    const result = await enrichGiftImages(giftId, url || null, name || null);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[enrichment/trigger] Error:', error);
    return NextResponse.json(
      { error: 'Enrichment failed' },
      { status: 500 }
    );
  }
}
