-- Add kiosk token to profiles for Dakboard access without login
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS kiosk_token TEXT UNIQUE;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_kiosk_token ON profiles(kiosk_token);

-- Function to generate a random kiosk token
CREATE OR REPLACE FUNCTION generate_kiosk_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;
