import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enrichGiftImages } from '@/lib/image-enrichment/enrichment-service';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const MAX_PER_RUN = 5;
const MAX_ATTEMPTS = 3;

export async function GET() {
  try {
    const supabase = getSupabase();

    // Find pending or failed jobs (with attempts < MAX)
    const { data: jobs, error } = await supabase
      .from('gift_enrichment_jobs')
      .select('gift_id, attempts')
      .or(`status.eq.pending,status.eq.failed`)
      .lt('attempts', MAX_ATTEMPTS)
      .order('created_at', { ascending: true })
      .limit(MAX_PER_RUN);

    if (error) {
      console.error('[cron/enrich-images] Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ processed: 0, message: 'No jobs to process' });
    }

    // Fetch gift details for each job
    const giftIds = jobs.map((j) => j.gift_id);
    const { data: gifts } = await supabase
      .from('gifts')
      .select('id, url, name')
      .in('id', giftIds);

    const giftMap = new Map(
      (gifts || []).map((g: any) => [g.id, { url: g.url, name: g.name }])
    );

    let processed = 0;
    const results: any[] = [];

    for (const job of jobs) {
      const gift = giftMap.get(job.gift_id);
      if (!gift) continue;

      const result = await enrichGiftImages(
        job.gift_id,
        gift.url || null,
        gift.name || null
      );
      results.push({ giftId: job.gift_id, ...result });
      processed++;
    }

    return NextResponse.json({ processed, results });
  } catch (error) {
    console.error('[cron/enrich-images] Error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
