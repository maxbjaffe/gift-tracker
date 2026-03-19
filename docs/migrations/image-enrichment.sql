-- Image Enrichment Tables
-- Run in Supabase Dashboard SQL Editor

-- Table to store multiple images per gift (enriched from product pages + search)
CREATE TABLE gift_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,              -- Supabase storage public URL
  original_url TEXT,              -- Source URL (for debugging)
  storage_path TEXT,              -- Path in gift-images bucket
  position INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'enrichment', -- 'enrichment', 'search', 'extension', 'sms', 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gift_id, position)
);
CREATE INDEX idx_gift_images_gift_id ON gift_images(gift_id);

-- Enable RLS
ALTER TABLE gift_images ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can see images for their own gifts
CREATE POLICY "Users can view their gift images"
  ON gift_images FOR SELECT
  USING (gift_id IN (SELECT id FROM gifts WHERE user_id = auth.uid()));

-- Service role can insert/update/delete (enrichment runs server-side)
CREATE POLICY "Service role full access to gift_images"
  ON gift_images FOR ALL
  USING (true)
  WITH CHECK (true);

-- Job tracking table for enrichment processing
CREATE TABLE gift_enrichment_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  strategy_used TEXT,             -- 'jsonld', 'search', 'both', 'none'
  images_found INTEGER DEFAULT 0,
  images_stored INTEGER DEFAULT 0,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX idx_enrichment_jobs_status ON gift_enrichment_jobs(status);

-- Enable RLS
ALTER TABLE gift_enrichment_jobs ENABLE ROW LEVEL SECURITY;

-- Service role full access (cron + trigger routes use service role)
CREATE POLICY "Service role full access to enrichment_jobs"
  ON gift_enrichment_jobs FOR ALL
  USING (true)
  WITH CHECK (true);
