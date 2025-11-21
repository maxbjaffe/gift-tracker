-- Create doodle_drawings table for storing kids' artwork
CREATE TABLE IF NOT EXISTS doodle_drawings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  image_data TEXT NOT NULL, -- Base64 encoded PNG data
  thumbnail_data TEXT, -- Smaller version for gallery view
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_doodle_drawings_user_id ON doodle_drawings(user_id);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_doodle_drawings_created_at ON doodle_drawings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE doodle_drawings ENABLE ROW LEVEL SECURITY;

-- Create policies for doodle_drawings
CREATE POLICY "Users can view their own drawings"
  ON doodle_drawings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drawings"
  ON doodle_drawings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drawings"
  ON doodle_drawings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drawings"
  ON doodle_drawings FOR DELETE
  USING (auth.uid() = user_id);
