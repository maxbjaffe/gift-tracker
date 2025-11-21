-- Family Information Hub Tables
-- Stores important family documents, contacts, insurance info, etc.

-- Main family information table
CREATE TABLE IF NOT EXISTS family_information (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core fields
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- Insurance, Contact, Financial, Healthcare, Education, Home, Auto, Legal, Other
  description TEXT,
  details TEXT, -- Rich text/markdown content

  -- Metadata
  tags TEXT[], -- Array of tags for categorization
  important_dates JSONB, -- Flexible date storage: {renewal: "2025-03-15", expiry: "2026-01-01"}
  related_contacts JSONB, -- Array of contact objects or references
  status TEXT DEFAULT 'active', -- active, inactive, expired, pending
  security_level TEXT DEFAULT 'private', -- public, private, encrypted

  -- File attachments
  file_urls TEXT[], -- Array of file storage URLs
  file_metadata JSONB, -- File info: {name, size, type, uploaded_at}

  -- Search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(details, ''))
  ) STORED,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Chat conversation history
CREATE TABLE IF NOT EXISTS family_info_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT, -- Auto-generated from first message
  messages JSONB NOT NULL, -- Array of {role, content, timestamp}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Document processing queue
CREATE TABLE IF NOT EXISTS family_info_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_info_id UUID REFERENCES family_information(id) ON DELETE SET NULL,

  -- File info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,

  -- Processing status
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  extracted_text TEXT,
  extracted_data JSONB, -- Structured data extracted by AI
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_family_info_user_id ON family_information(user_id);
CREATE INDEX IF NOT EXISTS idx_family_info_type ON family_information(type);
CREATE INDEX IF NOT EXISTS idx_family_info_status ON family_information(status);
CREATE INDEX IF NOT EXISTS idx_family_info_tags ON family_information USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_family_info_search ON family_information USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_family_info_created_at ON family_information(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON family_info_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON family_info_conversations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON family_info_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON family_info_documents(processing_status);

-- Enable Row Level Security
ALTER TABLE family_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_info_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_info_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_information
CREATE POLICY "Users can view their own family information"
  ON family_information FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own family information"
  ON family_information FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family information"
  ON family_information FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own family information"
  ON family_information FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON family_info_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON family_info_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON family_info_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON family_info_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for documents
CREATE POLICY "Users can view their own documents"
  ON family_info_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON family_info_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON family_info_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON family_info_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_family_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_family_information_updated_at
  BEFORE UPDATE ON family_information
  FOR EACH ROW
  EXECUTE FUNCTION update_family_info_updated_at();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON family_info_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_family_info_updated_at();
