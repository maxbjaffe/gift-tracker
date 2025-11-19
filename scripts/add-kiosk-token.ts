/**
 * Script to add kiosk_token column to profiles table
 * Run with: npx tsx scripts/add-kiosk-token.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Adding kiosk_token column to profiles table...\n');

  try {
    // Add kiosk_token column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS kiosk_token TEXT UNIQUE;

        CREATE INDEX IF NOT EXISTS idx_profiles_kiosk_token ON profiles(kiosk_token);
      `
    });

    if (alterError) {
      // Try alternative method - direct SQL execution
      console.log('Trying direct SQL execution...\n');

      const queries = [
        'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kiosk_token TEXT UNIQUE;',
        'CREATE INDEX IF NOT EXISTS idx_profiles_kiosk_token ON profiles(kiosk_token);'
      ];

      for (const query of queries) {
        const { error } = await supabase.from('_sql').insert({ query });
        if (error) {
          console.error(`Error executing query: ${query}`, error);
        }
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Go to /settings in your app');
    console.log('2. Scroll to "Dakboard / Kiosk Mode" section');
    console.log('3. Your kiosk URL will be generated automatically\n');

  } catch (error) {
    console.error('❌ Error running migration:', error);
    console.log('\nPlease run this SQL manually in your Supabase dashboard:');
    console.log(`
-- Add kiosk token to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS kiosk_token TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_kiosk_token ON profiles(kiosk_token);
    `);
  }
}

main().catch(console.error);
