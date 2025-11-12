-- Add user_id column to recipients table
ALTER TABLE recipients
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to gifts table
ALTER TABLE gifts
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX idx_recipients_user_id ON recipients(user_id);
CREATE INDEX idx_gifts_user_id ON gifts(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- Create policies for recipients table
CREATE POLICY "Users can view their own recipients"
  ON recipients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipients"
  ON recipients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipients"
  ON recipients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipients"
  ON recipients FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for gifts table
CREATE POLICY "Users can view their own gifts"
  ON gifts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gifts"
  ON gifts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gifts"
  ON gifts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gifts"
  ON gifts FOR DELETE
  USING (auth.uid() = user_id);
