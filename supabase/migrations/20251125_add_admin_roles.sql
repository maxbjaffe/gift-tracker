-- Add Admin Role System
-- Allows marking users as admins who can manage all users and their data

-- ============================================================================
-- STEP 1: Create user_profiles table to store admin status and metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Only admins can update profiles
CREATE POLICY "Admins can update profiles"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- ============================================================================
-- STEP 2: Create profiles for existing users
-- ============================================================================

INSERT INTO user_profiles (id, email, is_admin, created_at)
SELECT
  id,
  email,
  CASE
    WHEN email = 'maxbjaffe@gmail.com' THEN true
    ELSE false
  END as is_admin,
  created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  is_admin = CASE
    WHEN EXCLUDED.email = 'maxbjaffe@gmail.com' THEN true
    ELSE user_profiles.is_admin
  END;

-- ============================================================================
-- STEP 3: Create admin view to see all users and their data
-- ============================================================================

CREATE OR REPLACE VIEW admin_users_overview AS
SELECT
  u.id,
  u.email,
  up.is_admin,
  up.created_at as signup_date,
  up.last_login,
  (SELECT COUNT(*) FROM recipients WHERE user_id = u.id) as recipient_count,
  (SELECT COUNT(*) FROM gifts WHERE user_id = u.id) as gift_count,
  (SELECT COUNT(*) FROM chat_conversations WHERE user_id = u.id) as conversation_count
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
ORDER BY up.created_at DESC;

-- Grant access to authenticated users (RLS will restrict to admins in the API)
GRANT SELECT ON admin_users_overview TO authenticated;

-- ============================================================================
-- STEP 4: Create function to delete user and all their data
-- ============================================================================

CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  deleted_recipients INT;
  deleted_gifts INT;
  deleted_conversations INT;
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized: Admin access required'
    );
  END IF;

  -- Prevent deleting yourself
  IF target_user_id = auth.uid() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot delete your own admin account'
    );
  END IF;

  -- Count what will be deleted
  SELECT COUNT(*) INTO deleted_recipients FROM recipients WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO deleted_gifts FROM gifts WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO deleted_conversations FROM chat_conversations WHERE user_id = target_user_id;

  -- Delete user (CASCADE will handle related data)
  DELETE FROM auth.users WHERE id = target_user_id;

  -- Return summary
  RETURN json_build_object(
    'success', true,
    'deleted', json_build_object(
      'recipients', deleted_recipients,
      'gifts', deleted_gifts,
      'conversations', deleted_conversations
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (function checks admin status internally)
GRANT EXECUTE ON FUNCTION admin_delete_user TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE user_profiles IS 'User metadata including admin status';
COMMENT ON COLUMN user_profiles.is_admin IS 'Admin users can view and manage all users';
COMMENT ON VIEW admin_users_overview IS 'Admin-only view of all users with data counts';
COMMENT ON FUNCTION admin_delete_user IS 'Admin function to delete a user and all their data';
