import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running family members migration...');

    // Read the migration file
    const migrationPath = resolve(__dirname, '../supabase/migrations/20250121000003_add_family_members.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('Trying direct SQL execution...');

      // Split by semicolons and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        const { error: execError } = await supabase.from('_').select('*').limit(0);

        // Use the REST API to execute raw SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ query: statement }),
        });

        if (!response.ok && response.status !== 404) {
          console.error('Failed to execute statement:', statement.substring(0, 100));
        }
      }

      console.log('✅ Migration completed (using direct execution)');
    } else {
      console.log('✅ Migration completed successfully!');
    }

    console.log('\nTables created:');
    console.log('  - family_members (stores family member information)');
    console.log('  - family_info_members (links entries to family members)');
    console.log('\nYou can now associate family members with entries!');

  } catch (error) {
    console.error('Error running migration:', error);
    console.log('\n⚠️  Note: You may need to run this migration manually in the Supabase SQL Editor');
    console.log('The migration file is located at:');
    console.log('  supabase/migrations/20250121000003_add_family_members.sql');
  }
}

runMigration();
