/**
 * Add school-related information to children table
 * Adds grade, teacher, school, and notes columns
 */

-- Add school-related columns
ALTER TABLE children
ADD COLUMN IF NOT EXISTS grade TEXT,
ADD COLUMN IF NOT EXISTS teacher TEXT,
ADD COLUMN IF NOT EXISTS school TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comments
COMMENT ON COLUMN children.grade IS 'Child''s grade level (e.g., "3rd Grade", "Kindergarten")';
COMMENT ON COLUMN children.teacher IS 'Child''s current teacher name';
COMMENT ON COLUMN children.school IS 'School name';
COMMENT ON COLUMN children.notes IS 'General notes about the child';
