/**
 * Downloads external images and uploads them to Supabase Storage.
 * Filters out tiny icons (<10KB) and oversized files (>5MB).
 */

import { createClient } from '@supabase/supabase-js';

const MIN_SIZE = 10 * 1024; // 10 KB
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const DOWNLOAD_TIMEOUT = 10_000; // 10s per image
const CONCURRENCY = 3;
const BUCKET = 'gift-images';

function getSupabase() {
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type SupabaseAny = ReturnType<typeof getSupabase>;

export interface UploadResult {
  publicUrl: string;
  storagePath: string;
  originalUrl: string;
}

export async function uploadImages(
  imageUrls: string[],
  giftId: string
): Promise<UploadResult[]> {
  const supabase = getSupabase();
  const results: UploadResult[] = [];

  // Process in batches of CONCURRENCY
  for (let i = 0; i < imageUrls.length; i += CONCURRENCY) {
    const batch = imageUrls.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map((url, batchIdx) =>
        downloadAndUpload(supabase, url, giftId, i + batchIdx)
      )
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      }
    }
  }

  return results;
}

async function downloadAndUpload(
  supabase: SupabaseAny,
  imageUrl: string,
  giftId: string,
  position: number
): Promise<UploadResult | null> {
  try {
    // Download image
    const res = await fetch(imageUrl, {
      signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    // Skip non-image responses
    if (!contentType.startsWith('image/')) return null;

    const buffer = Buffer.from(await res.arrayBuffer());

    // Size checks
    if (buffer.length < MIN_SIZE || buffer.length > MAX_SIZE) return null;

    // Determine extension from content type
    const ext = contentType.split('/')[1]?.split(';')[0] || 'jpg';
    const storagePath = `enriched/${giftId}/${position}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error('[Uploader] Upload failed:', uploadError.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    return {
      publicUrl: publicUrlData.publicUrl,
      storagePath,
      originalUrl: imageUrl,
    };
  } catch (err) {
    console.error('[Uploader] Error processing image:', imageUrl, err);
    return null;
  }
}
