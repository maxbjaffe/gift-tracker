-- Add unique constraint to prevent duplicate children
-- First, remove any existing duplicates by keeping only the oldest record for each name/user_id combo

-- Remove duplicate children, keeping only the oldest one
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY user_id, LOWER(TRIM(name)) ORDER BY created_at ASC) as rn
  FROM children
)
DELETE FROM children
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Add unique constraint on user_id and name (case-insensitive, trimmed)
CREATE UNIQUE INDEX IF NOT EXISTS idx_children_user_name_unique
  ON children (user_id, LOWER(TRIM(name)));
