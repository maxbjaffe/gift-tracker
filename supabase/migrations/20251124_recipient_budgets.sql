-- Create recipient_budgets table for date-range based budget tracking
-- Allows users to set different budgets for different occasions and time periods
-- Example: $500 for Christmas 2024, $100 for Mom's Birthday 2025, $200 for general spending

CREATE TABLE recipient_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,

  -- Budget details
  name TEXT NOT NULL, -- e.g., "Christmas 2024", "Mom's Birthday 2025", "General Spending"
  max_budget DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Date range
  start_date DATE,
  end_date DATE,

  -- Optional occasion type for filtering
  occasion_type TEXT, -- e.g., "christmas", "birthday", "anniversary", "general"

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT positive_budget CHECK (max_budget >= 0),
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Indexes for performance
CREATE INDEX idx_recipient_budgets_user ON recipient_budgets(user_id);
CREATE INDEX idx_recipient_budgets_recipient ON recipient_budgets(recipient_id);
CREATE INDEX idx_recipient_budgets_dates ON recipient_budgets(start_date, end_date);
CREATE INDEX idx_recipient_budgets_occasion ON recipient_budgets(occasion_type);

-- RLS Policies
ALTER TABLE recipient_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recipient budgets"
  ON recipient_budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recipient budgets"
  ON recipient_budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipient budgets"
  ON recipient_budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipient budgets"
  ON recipient_budgets FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_recipient_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipient_budgets_timestamp
  BEFORE UPDATE ON recipient_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_recipient_budgets_updated_at();

-- Add comments for documentation
COMMENT ON TABLE recipient_budgets IS 'Date-range based budgets for recipients, allowing different budgets for different occasions';
COMMENT ON COLUMN recipient_budgets.name IS 'User-friendly name for the budget (e.g., "Christmas 2024")';
COMMENT ON COLUMN recipient_budgets.occasion_type IS 'Type of occasion for filtering (birthday, christmas, etc.)';
COMMENT ON COLUMN recipient_budgets.start_date IS 'Start date of the budget period (optional)';
COMMENT ON COLUMN recipient_budgets.end_date IS 'End date of the budget period (optional)';
