-- Migration: Add SMS consent tracking to profiles
-- Required for Twilio A2P 10DLC compliance

-- Add sms_consent column to track user consent for SMS messaging
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN profiles.sms_consent IS 'Whether user has consented to receive SMS messages (required for Twilio compliance)';

-- Create index for querying consented users
CREATE INDEX IF NOT EXISTS idx_profiles_sms_consent ON profiles(sms_consent) WHERE sms_consent = TRUE;
