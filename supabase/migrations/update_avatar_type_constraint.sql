-- Migration: Update avatar_type constraint to support new 'preset' type
-- Date: 2025-11-12
-- Description: Updates the check constraint on recipients.avatar_type to allow the new 'preset' avatar type
--              while maintaining backward compatibility with existing types.

-- Drop the old constraint
ALTER TABLE recipients
DROP CONSTRAINT IF EXISTS recipients_avatar_type_check;

-- Add new constraint that includes 'preset' and all legacy types
ALTER TABLE recipients
ADD CONSTRAINT recipients_avatar_type_check
CHECK (avatar_type IN ('preset', 'emoji', 'ai', 'photo', 'initials'));

-- Note: We keep legacy types ('ai', 'photo', 'initials') for backward compatibility
-- with existing data, but the application now primarily uses 'preset' and 'emoji'.
