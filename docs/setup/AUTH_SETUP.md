# Authentication Setup Guide

This guide will help you complete the authentication setup for your Gift Tracker application.

## Prerequisites

- A Supabase project created at [supabase.com](https://supabase.com)
- Node.js and npm installed

## Step 1: Configure Environment Variables

Create a `.env.local` file in the root directory (if it doesn't exist) and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings:
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click on "Settings" (gear icon)
4. Go to "API" section
5. Copy "Project URL" and "anon/public" key

## Step 2: Run Database Migration

You need to add `user_id` columns to your database tables and set up Row Level Security (RLS):

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the sidebar
3. Copy the contents of `supabase/migrations/add_user_id_to_tables.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

This will:
- Add `user_id` columns to `recipients` and `gifts` tables
- Enable Row Level Security (RLS)
- Create policies so users can only see their own data

## Step 3: Configure Supabase Auth

### Enable Email Authentication

1. In your Supabase dashboard, go to "Authentication" > "Providers"
2. Make sure "Email" is enabled
3. Configure email settings:
   - **Confirm email**: Toggle ON if you want users to confirm their email
   - **Secure email change**: Recommended to keep ON
   - **Double confirm email changes**: Optional

### Configure Site URL and Redirect URLs

1. Go to "Authentication" > "URL Configuration"
2. Set the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add these URLs:
     - `http://localhost:3000/dashboard`
     - `http://localhost:3000/login`
     - For production, add your production URLs

## Step 4: Update Existing Data (Optional)

If you have existing data in your database, you'll need to assign it to a user:

1. Create a user account through your app's signup page
2. Get the user's ID from the Supabase Auth dashboard
3. Run this SQL to assign existing data to that user:

```sql
-- Replace 'USER_ID_HERE' with the actual user ID
UPDATE recipients SET user_id = 'USER_ID_HERE' WHERE user_id IS NULL;
UPDATE gifts SET user_id = 'USER_ID_HERE' WHERE user_id IS NULL;
```

## Step 5: Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and you should see:
- A "Sign In" and "Sign Up" button in the header (when logged out)
- The login page at `/login`
- The signup page at `/signup`

## Step 6: Test the Authentication Flow

1. **Sign Up**:
   - Go to `/signup`
   - Enter your email and password
   - Click "Create Account"
   - Check your email for confirmation (if enabled)

2. **Sign In**:
   - Go to `/login`
   - Enter your credentials
   - You should be redirected to `/dashboard`

3. **Protected Routes**:
   - Try accessing `/dashboard`, `/recipients`, or `/gifts` without logging in
   - You should be redirected to `/login`

4. **Sign Out**:
   - Click on your email in the header
   - Select "Sign Out"
   - You should be redirected to the home page

## Features Implemented

- **Supabase Auth**: Email/password authentication
- **Protected Routes**: Middleware redirects unauthenticated users to login
- **User-scoped Data**: Each user only sees their own recipients and gifts
- **Row Level Security**: Database-level security policies
- **Login/Signup Pages**: Beautiful UI with form validation
- **User Menu**: Displays user email and sign out option

## Troubleshooting

### "Unauthorized" errors
- Make sure you're logged in
- Check that your `.env.local` file has the correct Supabase credentials
- Verify the database migration ran successfully

### Email confirmation not working
- Check your Supabase Auth settings
- Look at the Email Templates in Supabase Auth settings
- For development, you can disable email confirmation

### RLS errors
- Make sure the migration script ran successfully
- Check that the policies were created in Supabase dashboard under "Authentication" > "Policies"

## Production Deployment

Before deploying to production:

1. Update environment variables with production Supabase credentials
2. Update Site URL and Redirect URLs in Supabase to your production domain
3. Enable email confirmation for better security
4. Consider adding OAuth providers (Google, GitHub, etc.)

## Next Steps

- Add password reset functionality
- Implement OAuth providers (Google, GitHub)
- Add user profile management
- Set up email templates in Supabase
- Add 2FA (Two-Factor Authentication)
