-- GiftStash V2 Phase 1: Agent Foundation
-- Run in Supabase Dashboard SQL Editor

-- AI call metrics (append-only)
CREATE TABLE IF NOT EXISTS giftstash_ai_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text NOT NULL,
  caller text NOT NULL,
  input_tokens int,
  output_tokens int,
  latency_ms int,
  estimated_cost_usd numeric(10,6),
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Conversation context for multi-turn SMS
CREATE TABLE IF NOT EXISTS giftstash_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  phone text NOT NULL,
  persona text,
  last_intent text,
  follow_up text,
  messages jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for conversation lookup by phone (most recent first)
CREATE INDEX IF NOT EXISTS idx_giftstash_conversations_phone
  ON giftstash_conversations (phone, updated_at DESC);

-- Index for AI call analytics by caller
CREATE INDEX IF NOT EXISTS idx_giftstash_ai_calls_caller
  ON giftstash_ai_calls (caller, created_at DESC);

-- Index for AI call analytics by date
CREATE INDEX IF NOT EXISTS idx_giftstash_ai_calls_date
  ON giftstash_ai_calls (created_at DESC);
