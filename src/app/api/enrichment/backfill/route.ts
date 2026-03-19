import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enrichGiftImages } from '@/lib/image-enrichment/enrichment-service';

function getSupabase() {
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST /api/enrichment/backfill — enrich existing gifts
// ?limit=N    — batch size (default 10)
// ?dry=true   — preview only, don't process
// ?force=true — re-process gifts that already have jobs (deletes old jobs + images first)
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const dry = searchParams.get('dry') === 'true';
  const force = searchParams.get('force') === 'true';

  const supabase = getSupabase();

  // Find gifts with a URL or name
  const { data: allGifts } = await supabase
    .from('gifts')
    .select('id, name, url, image_url')
    .or('url.not.is.null,name.not.is.null')
    .order('created_at', { ascending: false })
    .limit(100);

  if (!allGifts || allGifts.length === 0) {
    return NextResponse.json({ message: 'No gifts found', candidates: 0 });
  }

  let candidates: any[];

  if (force) {
    // In force mode, re-process all gifts regardless of existing jobs
    candidates = allGifts;
  } else {
    // Filter out gifts that already have enrichment jobs
    const { data: existingJobs } = await supabase
      .from('gift_enrichment_jobs')
      .select('gift_id')
      .in('gift_id', allGifts.map((g: any) => g.id));

    const jobGiftIds = new Set((existingJobs || []).map((j: any) => j.gift_id));
    candidates = allGifts.filter((g: any) => !jobGiftIds.has(g.id));
  }

  if (dry) {
    return NextResponse.json({
      candidates: candidates.length,
      gifts: candidates.slice(0, limit).map((g: any) => ({
        id: g.id,
        name: g.name,
        url: g.url?.substring(0, 60),
        has_image: !!g.image_url,
      })),
    });
  }

  const batch = candidates.slice(0, limit);
  const results: any[] = [];

  for (const gift of batch) {
    // In force mode, delete old job and images so enrichment can re-run
    if (force) {
      await supabase.from('gift_images').delete().eq('gift_id', gift.id);
      await supabase.from('gift_enrichment_jobs').delete().eq('gift_id', gift.id);
    }

    const result = await enrichGiftImages(gift.id, gift.url || null, gift.name || null);
    results.push({ id: gift.id, name: gift.name, ...result });
  }

  return NextResponse.json({
    processed: results.length,
    remaining: candidates.length - batch.length,
    results,
  });
}
