-- Upgrade children table to use new avatar system
-- Adds support for illustrated avatars instead of just colors/emojis

-- Add new avatar fields
ALTER TABLE children
ADD COLUMN IF NOT EXISTS avatar_type text,
ADD COLUMN IF NOT EXISTS avatar_data text,
ADD COLUMN IF NOT EXISTS avatar_background text;

-- Add comment explaining the avatar system
COMMENT ON COLUMN children.avatar_type IS 'Avatar type: preset (illustrated) or emoji';
COMMENT ON COLUMN children.avatar_data IS 'Avatar data: preset ID or emoji character';
COMMENT ON COLUMN children.avatar_background IS 'Background gradient ID for emoji avatars';

-- The avatar and avatar_color columns can remain for backward compatibility
-- but new records should use avatar_type, avatar_data, avatar_background
