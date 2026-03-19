import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enrichGiftImages } from '@/lib/image-enrichment/enrichment-service';

function getSupabase() {
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST /api/enrichment/backfill — enrich all existing gifts that have no enrichment job
// Pass ?limit=N to control batch size (default 10)
// Pass ?dry=true to just see what would be enriched
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const dry = searchParams.get('dry') === 'true';

  const supabase = getSupabase();

  // Find gifts with a URL or name that don't have an enrichment job yet
  const { data: allGifts } = await supabase
    .from('gifts')
    .select('id, name, url, image_url')
    .or('url.not.is.null,name.not.is.null')
    .order('created_at', { ascending: false })
    .limit(100);

  if (!allGifts || allGifts.length === 0) {
    return NextResponse.json({ message: 'No gifts found', candidates: 0 });
  }

  // Filter out gifts that already have enrichment jobs
  const { data: existingJobs } = await supabase
    .from('gift_enrichment_jobs')
    .select('gift_id')
    .in('gift_id', allGifts.map((g: any) => g.id));

  const jobGiftIds = new Set((existingJobs || []).map((j: any) => j.gift_id));
  const candidates = allGifts.filter((g: any) => !jobGiftIds.has(g.id));

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
    const result = await enrichGiftImages(gift.id, gift.url || null, gift.name || null);
    results.push({ id: gift.id, name: gift.name, ...result });
  }

  return NextResponse.json({
    processed: results.length,
    remaining: candidates.length - batch.length,
    results,
  });
}
