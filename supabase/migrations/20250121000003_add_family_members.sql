-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT, -- e.g., "Self", "Spouse", "Child", "Parent"
  date_of_birth DATE,
  is_primary BOOLEAN DEFAULT false, -- True for the main user
  avatar_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS family_info_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_info_id UUID NOT NULL REFERENCES family_information(id) ON DELETE CASCADE,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_info_id, family_member_id)
);

-- Add indexes
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_info_members_info_id ON family_info_members(family_info_id);
CREATE INDEX idx_family_info_members_member_id ON family_info_members(family_member_id);

-- Enable RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_info_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_members
CREATE POLICY "Users can view their own family members"
  ON family_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own family members"
  ON family_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family members"
  ON family_members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own family members"
  ON family_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for family_info_members
CREATE POLICY "Users can view their family info member associations"
  ON family_info_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_information
      WHERE family_information.id = family_info_members.family_info_id
      AND family_information.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their family info member associations"
  ON family_info_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_information
      WHERE family_information.id = family_info_members.family_info_id
      AND family_information.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their family info member associations"
  ON family_info_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_information
      WHERE family_information.id = family_info_members.family_info_id
      AND family_information.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_family_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_family_members_updated_at();
