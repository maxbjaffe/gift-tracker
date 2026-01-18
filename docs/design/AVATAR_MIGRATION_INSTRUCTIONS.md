# Avatar System Database Migration Instructions

## Problem
You're getting this error when creating/editing recipients:
```
new row for relation "recipients" violates check constraint "recipients_avatar_type_check"
```

## Solution
The database constraint needs to be updated to allow the new `'preset'` avatar type.

## How to Fix (Choose One Method)

### Method 1: Supabase Dashboard (Recommended - Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your gift-tracker project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run This SQL**
   - Copy and paste the following SQL:
   ```sql
   -- Drop the old constraint
   ALTER TABLE recipients
   DROP CONSTRAINT IF EXISTS recipients_avatar_type_check;

   -- Add new constraint that includes 'preset' and all legacy types
   ALTER TABLE recipients
   ADD CONSTRAINT recipients_avatar_type_check
   CHECK (avatar_type IN ('preset', 'emoji', 'ai', 'photo', 'initials'));
   ```

4. **Execute**
   - Click the "Run" button or press `Cmd/Ctrl + Enter`
   - You should see: "Success. No rows returned"

### Method 2: Supabase CLI (If you have it installed)

1. **Make sure you're logged in**
   ```bash
   supabase login
   ```

2. **Link to your project** (if not already)
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Run the migration**
   ```bash
   supabase db push --file supabase/migrations/update_avatar_type_constraint.sql
   ```

## Verification

After running the migration, try creating or editing a recipient with an avatar. The error should be gone!

## What Changed?

- **Old Constraint**: Only allowed `'ai'`, `'emoji'`, `'initials'`, `'photo'`
- **New Constraint**: Now allows `'preset'`, `'emoji'`, `'ai'`, `'photo'`, `'initials'`

The new avatar system primarily uses:
- `'preset'` - Curated fun avatars (40 options)
- `'emoji'` - Emoji avatars with gradient backgrounds

Legacy types (`'ai'`, `'photo'`, `'initials'`) are kept in the constraint for backward compatibility with existing data.

## Files Updated

1. `supabase/migrations/update_avatar_type_constraint.sql` - New migration file
2. `database_schema_updates.sql` - Updated documentation

## Need Help?

If you encounter any issues:
1. Check that you're connected to the correct Supabase project
2. Verify you have the necessary permissions to alter tables
3. Check the Supabase logs for any detailed error messages
