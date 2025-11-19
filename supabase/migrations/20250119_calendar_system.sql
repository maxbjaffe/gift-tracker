-- Calendar System Migration
-- Created: 2025-01-19
-- Adds calendar subscriptions, events, and weather caching

-- =====================================================
-- CALENDAR SUBSCRIPTIONS
-- Store iCal feed URLs and sync settings
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ical_url TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6', -- Default blue
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'success', 'error')),
  sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CALENDAR EVENTS
-- Unified event storage from all sources
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Source tracking
  source_type TEXT NOT NULL CHECK (source_type IN ('ical', 'birthday', 'email', 'commitment', 'manual')),
  source_id UUID, -- FK to subscription_id, recipient_id, email_message_id, commitment_id, etc.

  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN DEFAULT false,

  -- Recurrence
  recurrence_rule TEXT, -- iCal RRULE format

  -- Categorization
  category TEXT, -- school, sports, birthday, work, family, other
  color TEXT,

  -- Status
  is_cancelled BOOLEAN DEFAULT false,

  -- External tracking (for iCal sync deduplication)
  external_id TEXT, -- UID from iCal

  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- WEATHER CACHE
-- Cache weather data (refresh hourly)
-- =====================================================
CREATE TABLE IF NOT EXISTS weather_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Location
  location TEXT NOT NULL, -- City name or "lat,lon"

  -- Current conditions
  current_temp NUMERIC,
  feels_like NUMERIC,
  condition TEXT, -- "Sunny", "Partly cloudy", etc.
  condition_code TEXT, -- Weather API condition code
  condition_icon TEXT, -- Weather API icon URL
  humidity INTEGER,
  wind_speed NUMERIC,
  wind_direction TEXT,

  -- Forecast (next 3-7 days)
  forecast_data JSONB DEFAULT '[]'::jsonb,

  -- Alerts (severe weather, etc.)
  alerts JSONB DEFAULT '[]'::jsonb,

  -- Cache control
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Only one cache entry per user
  UNIQUE(user_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Calendar subscriptions
CREATE INDEX IF NOT EXISTS idx_calendar_subscriptions_user_id ON calendar_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_subscriptions_active ON calendar_subscriptions(user_id, is_active) WHERE is_active = true;

-- Calendar events
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_source ON calendar_events(user_id, source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_time ON calendar_events(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date_range ON calendar_events(user_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_external_id ON calendar_events(user_id, external_id) WHERE external_id IS NOT NULL;

-- Weather cache
CREATE INDEX IF NOT EXISTS idx_weather_cache_user_id ON weather_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires ON weather_cache(expires_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE calendar_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;

-- Calendar subscriptions policies
CREATE POLICY "Users can view their own calendar subscriptions"
  ON calendar_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar subscriptions"
  ON calendar_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar subscriptions"
  ON calendar_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar subscriptions"
  ON calendar_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Calendar events policies
CREATE POLICY "Users can view their own calendar events"
  ON calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar events"
  ON calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
  ON calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
  ON calendar_events FOR DELETE
  USING (auth.uid() = user_id);

-- Weather cache policies
CREATE POLICY "Users can view their own weather cache"
  ON weather_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weather cache"
  ON weather_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weather cache"
  ON weather_cache FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weather cache"
  ON weather_cache FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_calendar_subscriptions_updated_at
  BEFORE UPDATE ON calendar_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weather_cache_updated_at
  BEFORE UPDATE ON weather_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Clean up old events (optional - run monthly)
CREATE OR REPLACE FUNCTION cleanup_old_calendar_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM calendar_events
  WHERE end_time < NOW() - INTERVAL '6 months'
    AND source_type != 'birthday'; -- Keep birthdays forever

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Get upcoming events for a user
CREATE OR REPLACE FUNCTION get_upcoming_events(
  p_user_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN,
  category TEXT,
  source_type TEXT,
  color TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.title,
    e.start_time,
    e.end_time,
    e.all_day,
    e.category,
    e.source_type,
    COALESCE(e.color, s.color) as color
  FROM calendar_events e
  LEFT JOIN calendar_subscriptions s ON e.source_id = s.id AND e.source_type = 'ical'
  WHERE e.user_id = p_user_id
    AND e.is_cancelled = false
    AND e.start_time >= NOW()
    AND e.start_time <= NOW() + (p_days || ' days')::INTERVAL
  ORDER BY e.start_time ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE calendar_subscriptions IS 'iCal feed subscriptions for external calendar sync';
COMMENT ON TABLE calendar_events IS 'Unified event storage from all sources (iCal, birthdays, emails, commitments)';
COMMENT ON TABLE weather_cache IS 'Weather data cache (refreshed hourly)';
