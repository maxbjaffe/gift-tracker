/**
 * Interests and Activities Schema
 * Add interests/activities tracking to children
 */

-- Add interests column to children table (JSONB array)
ALTER TABLE children
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Add activities column for structured activity tracking
ALTER TABLE children
ADD COLUMN IF NOT EXISTS activities JSONB DEFAULT '[]';

-- Example activities structure:
-- [
--   {
--     "name": "Soccer",
--     "type": "sports",
--     "season": "Fall 2024",
--     "coach": "Coach Smith",
--     "practice_schedule": "Tuesdays 4pm"
--   }
-- ]

COMMENT ON COLUMN children.interests IS 'Simple array of interest tags (e.g., ["math", "soccer", "art"])';
COMMENT ON COLUMN children.activities IS 'Structured activity data with details';
