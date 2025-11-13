-- Migration: Add max_purchased_budget column to recipients table
-- Date: 2025-11-13
-- Description: Adds a new column to track the maximum total budget for all purchased gifts for a recipient
--              This is separate from max_budget which is the budget per individual gift.

-- Add new column for maximum total budget across all purchased gifts
ALTER TABLE recipients
ADD COLUMN IF NOT EXISTS max_purchased_budget DECIMAL(10, 2) DEFAULT NULL;

-- Add comment to document the column purpose
COMMENT ON COLUMN recipients.max_purchased_budget IS 'Maximum total budget for all purchased gifts for this recipient (across all occasions). Separate from max_budget which is per-gift limit.';

-- Note: NULL means no limit set
-- This allows tracking total spending on purchased gifts per recipient
