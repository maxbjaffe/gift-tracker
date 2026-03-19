/**
 * Orchestrates image enrichment for a gift:
 * 1. Tier 1: Extract images from product page HTML (JSON-LD, meta tags)
 * 2. Tier 2: Google Custom Search (if <3 images from Tier 1)
 * 3. Download + upload all images to Supabase Storage
 * 4. Insert gift_images rows, update gifts.image_url with best image
 */

import { createClient } from '@supabase/supabase-js';
import {
  extractImagesFromUrl,
  searchGoogleImages,
  type ExtractedImage,
} from './extractor';
import { uploadImages, type UploadResult } from './uploader';

// Use `any` for DB generic — gift_images / gift_enrichment_jobs aren't in generated types yet
function getSupabase() {
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type SupabaseAny = ReturnType<typeof getSupabase>;

export interface EnrichmentResult {
  success: boolean;
  imagesFound: number;
  imagesStored: number;
  strategyUsed: string;
  error?: string;
}

export async function enrichGiftImages(
  giftId: string,
  url: string | null,
  name: string | null
): Promise<EnrichmentResult> {
  const supabase = getSupabase();

  // Create or update job row
  await supabase
    .from('gift_enrichment_jobs')
    .upsert(
      {
        gift_id: giftId,
        status: 'processing',
        attempts: 1,
      },
      { onConflict: 'gift_id' }
    )
    .select()
    .single()
    .then(({ data }) => {
      // Increment attempts if already exists
      if (data && data.attempts > 1) {
        return supabase
          .from('gift_enrichment_jobs')
          .update({ status: 'processing', attempts: data.attempts + 1 })
          .eq('gift_id', giftId);
      }
    });

  try {
    let allImages: ExtractedImage[] = [];
    let strategyUsed = 'none';

    // Tier 1: Extract from product URL
    if (url) {
      const tier1Images = await extractImagesFromUrl(url);
      allImages.push(...tier1Images);
      if (tier1Images.length > 0) {
        strategyUsed = 'jsonld';
      }
    }

    // Tier 2: Google search if we have <3 images and a product name
    if (allImages.length < 3 && name) {
      const excludeUrls = new Set(allImages.map((img) => img.url));
      const searchImages = await searchGoogleImages(name, excludeUrls);
      allImages.push(...searchImages);
      strategyUsed =
        strategyUsed === 'jsonld' ? 'both' : searchImages.length > 0 ? 'search' : strategyUsed;
    }

    if (allImages.length === 0) {
      await updateJob(supabase, giftId, {
        status: 'completed',
        strategy_used: 'none',
        images_found: 0,
        images_stored: 0,
        completed_at: new Date().toISOString(),
      });
      return { success: true, imagesFound: 0, imagesStored: 0, strategyUsed: 'none' };
    }

    // Cap at 8 images total
    allImages = allImages.slice(0, 8);

    // Download and upload to Supabase Storage
    const imageUrls = allImages.map((img) => img.url);
    const uploaded = await uploadImages(imageUrls, giftId);

    if (uploaded.length === 0) {
      await updateJob(supabase, giftId, {
        status: 'completed',
        strategy_used: strategyUsed,
        images_found: allImages.length,
        images_stored: 0,
        completed_at: new Date().toISOString(),
      });
      return {
        success: true,
        imagesFound: allImages.length,
        imagesStored: 0,
        strategyUsed,
      };
    }

    // Insert gift_images rows
    const imageRows = uploaded.map((result: UploadResult, idx: number) => {
      // Find the matching ExtractedImage to get the source
      const sourceImg = allImages.find((img) => img.url === result.originalUrl);
      return {
        gift_id: giftId,
        url: result.publicUrl,
        original_url: result.originalUrl,
        storage_path: result.storagePath,
        position: idx,
        source: sourceImg?.source === 'search' ? 'search' : 'enrichment',
      };
    });

    // Delete any existing enrichment images for this gift (re-enrichment scenario)
    await supabase
      .from('gift_images')
      .delete()
      .eq('gift_id', giftId)
      .in('source', ['enrichment', 'search']);

    const { error: insertError } = await supabase
      .from('gift_images')
      .insert(imageRows);

    if (insertError) {
      console.error('[EnrichmentService] Insert gift_images failed:', insertError);
    }

    // Update gifts.image_url with the best (position 0) image
    const bestImage = uploaded[0];
    if (bestImage) {
      await supabase
        .from('gifts')
        .update({ image_url: bestImage.publicUrl })
        .eq('id', giftId);
    }

    await updateJob(supabase, giftId, {
      status: 'completed',
      strategy_used: strategyUsed,
      images_found: allImages.length,
      images_stored: uploaded.length,
      completed_at: new Date().toISOString(),
    });

    return {
      success: true,
      imagesFound: allImages.length,
      imagesStored: uploaded.length,
      strategyUsed,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error';
    console.error('[EnrichmentService] Error:', errorMessage);

    await updateJob(supabase, giftId, {
      status: 'failed',
      error_message: errorMessage,
    });

    return {
      success: false,
      imagesFound: 0,
      imagesStored: 0,
      strategyUsed: 'none',
      error: errorMessage,
    };
  }
}

async function updateJob(
  supabase: SupabaseAny,
  giftId: string,
  fields: Record<string, any>
) {
  await supabase
    .from('gift_enrichment_jobs')
    .update(fields)
    .eq('gift_id', giftId);
}
