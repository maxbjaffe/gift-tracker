-- Add occasion and occasion_date to gift_recipients table
-- This allows the same gift to be for different occasions per recipient
-- Example: Same candle for Mom's birthday and Dad's Christmas

ALTER TABLE gift_recipients
ADD COLUMN occasion TEXT,
ADD COLUMN occasion_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN gift_recipients.occasion IS 'The occasion this gift is intended for (e.g., birthday, christmas, anniversary) - per recipient';
COMMENT ON COLUMN gift_recipients.occasion_date IS 'The date of the occasion - per recipient';

-- Create index for filtering by occasion
CREATE INDEX idx_gift_recipients_occasion ON gift_recipients(occasion);
CREATE INDEX idx_gift_recipients_occasion_date ON gift_recipients(occasion_date);
