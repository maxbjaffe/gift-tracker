-- Daily Checklist System for Kids
-- Creates tables for managing daily checklists and tracking completions

-- Checklist Items (master list per child)
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji or icon name
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  weekdays_only BOOLEAN NOT NULL DEFAULT true, -- only show on weekdays
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checklist Completions (daily tracking)
CREATE TABLE IF NOT EXISTS checklist_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one completion per item per child per day
  UNIQUE(child_id, item_id, completion_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_checklist_items_child ON checklist_items(child_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_user ON checklist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_active ON checklist_items(is_active);
CREATE INDEX IF NOT EXISTS idx_checklist_completions_child ON checklist_completions(child_id);
CREATE INDEX IF NOT EXISTS idx_checklist_completions_date ON checklist_completions(completion_date);
CREATE INDEX IF NOT EXISTS idx_checklist_completions_item ON checklist_completions(item_id);

-- RLS Policies
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_completions ENABLE ROW LEVEL SECURITY;

-- Checklist Items Policies
CREATE POLICY "Users can view their own checklist items"
  ON checklist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checklist items"
  ON checklist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklist items"
  ON checklist_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklist items"
  ON checklist_items FOR DELETE
  USING (auth.uid() = user_id);

-- Checklist Completions Policies
CREATE POLICY "Users can view their own checklist completions"
  ON checklist_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checklist completions"
  ON checklist_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklist completions"
  ON checklist_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Updated at trigger for checklist_items
CREATE OR REPLACE FUNCTION update_checklist_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_checklist_items_updated_at
  BEFORE UPDATE ON checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_checklist_items_updated_at();
