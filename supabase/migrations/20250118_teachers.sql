/**
 * Teachers Management Schema
 * Stores teacher information and associations with children
 */

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  subject TEXT, -- Math, English, Science, etc.
  school TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Child-Teacher associations (many-to-many)
CREATE TABLE IF NOT EXISTS child_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject TEXT, -- What subject this teacher teaches this child
  is_primary BOOLEAN DEFAULT false, -- Is this the primary/homeroom teacher?
  school_year TEXT, -- e.g., "2024-2025"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id, teacher_id, school_year)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers(name);
CREATE INDEX IF NOT EXISTS idx_child_teachers_child_id ON child_teachers(child_id);
CREATE INDEX IF NOT EXISTS idx_child_teachers_teacher_id ON child_teachers(teacher_id);

-- RLS Policies for teachers
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own teachers" ON teachers;
CREATE POLICY "Users can view their own teachers"
  ON teachers FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own teachers" ON teachers;
CREATE POLICY "Users can insert their own teachers"
  ON teachers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own teachers" ON teachers;
CREATE POLICY "Users can update their own teachers"
  ON teachers FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own teachers" ON teachers;
CREATE POLICY "Users can delete their own teachers"
  ON teachers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for child_teachers
ALTER TABLE child_teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their child's teachers" ON child_teachers;
CREATE POLICY "Users can view their child's teachers"
  ON child_teachers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_teachers.child_id
      AND children.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage their child's teachers" ON child_teachers;
CREATE POLICY "Users can manage their child's teachers"
  ON child_teachers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_teachers.child_id
      AND children.user_id = auth.uid()
    )
  );
