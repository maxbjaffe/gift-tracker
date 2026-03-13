-- Add important_dates JSONB column to recipients
-- Each entry: { label: string, date: string (YYYY-MM-DD), repeats: boolean }
-- Example: [{"label": "Anniversary", "date": "2020-06-15", "repeats": true}]

ALTER TABLE recipients ADD COLUMN IF NOT EXISTS important_dates JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN recipients.important_dates IS 'Array of important dates: [{label, date, repeats}]';
