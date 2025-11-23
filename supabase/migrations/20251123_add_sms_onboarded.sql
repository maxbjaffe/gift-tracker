-- Add sms_onboarded column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS sms_onboarded BOOLEAN DEFAULT FALSE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_sms_onboarded ON profiles(sms_onboarded);

COMMENT ON COLUMN profiles.sms_onboarded IS 'Whether user has received SMS onboarding tutorial';
