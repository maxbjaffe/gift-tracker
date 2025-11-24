-- Add purchased_date to gift_recipients table
-- This tracks when a gift was actually marked as purchased, helping with budget tracking

ALTER TABLE gift_recipients
ADD COLUMN purchased_date TIMESTAMPTZ;

COMMENT ON COLUMN gift_recipients.purchased_date IS 'Date when the gift status was changed to purchased (or wrapped/given)';

-- Create index for efficient querying
CREATE INDEX idx_gift_recipients_purchased_date ON gift_recipients(purchased_date);

-- Create a function to automatically set purchased_date when status changes
CREATE OR REPLACE FUNCTION set_purchased_date()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is being changed to purchased, wrapped, or given, and purchased_date is not set
  IF (NEW.status IN ('purchased', 'wrapped', 'given')) AND (OLD.status IS NULL OR OLD.status NOT IN ('purchased', 'wrapped', 'given')) THEN
    NEW.purchased_date = NOW();
  END IF;

  -- If status is changed back to idea or considering, clear the purchased_date
  IF (NEW.status IN ('idea', 'considering')) AND (OLD.status IN ('purchased', 'wrapped', 'given')) THEN
    NEW.purchased_date = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update purchased_date
DROP TRIGGER IF EXISTS trigger_set_purchased_date ON gift_recipients;
CREATE TRIGGER trigger_set_purchased_date
  BEFORE UPDATE ON gift_recipients
  FOR EACH ROW
  EXECUTE FUNCTION set_purchased_date();
