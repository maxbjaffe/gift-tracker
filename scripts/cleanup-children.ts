/**
 * Cleanup script to manage children in database
 * Run with: npx tsx scripts/cleanup-children.ts
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
  console.log('Fetching all children...\n');

  // Fetch all children
  const { data: children, error } = await supabase
    .from('children')
    .select('id, name, age, created_at, user_id')
    .order('name');

  if (error) {
    console.error('Error fetching children:', error);
    process.exit(1);
  }

  console.log(`Found ${children.length} children:\n`);
  children.forEach((child, index) => {
    console.log(`${index + 1}. ${child.name} (Age: ${child.age || 'N/A'}) - ID: ${child.id}`);
    console.log(`   Created: ${new Date(child.created_at).toLocaleString()}`);
    console.log(`   User ID: ${child.user_id}\n`);
  });

  // Keep only Riley, Parker, and Devin
  const keepNames = ['Riley', 'Parker', 'Devin'];

  // Find children to delete (not in keepNames)
  const toDelete = children.filter(child => !keepNames.includes(child.name));

  // Find duplicates of Riley, Parker, Devin (keep only the oldest one for each)
  const grouped = children.reduce((acc, child) => {
    if (!acc[child.name]) acc[child.name] = [];
    acc[child.name].push(child);
    return acc;
  }, {} as Record<string, typeof children>);

  // For each kept name, if there are duplicates, mark extras for deletion
  keepNames.forEach(name => {
    if (grouped[name] && grouped[name].length > 1) {
      // Sort by created_at, keep oldest, delete rest
      const sorted = grouped[name].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      // Add all but the first (oldest) to deletion list
      toDelete.push(...sorted.slice(1));
    }
  });

  if (toDelete.length === 0) {
    console.log('\n✅ No cleanup needed! Database looks good.');
    return;
  }

  console.log(`\n⚠️  Will delete ${toDelete.length} children:\n`);
  toDelete.forEach(child => {
    console.log(`  - ${child.name} (ID: ${child.id})`);
  });

  console.log('\n🔄 Deleting...');

  // Delete unwanted children
  for (const child of toDelete) {
    const { error: deleteError } = await supabase
      .from('children')
      .delete()
      .eq('id', child.id);

    if (deleteError) {
      console.error(`❌ Error deleting ${child.name}:`, deleteError);
    } else {
      console.log(`✅ Deleted ${child.name}`);
    }
  }

  console.log('\n✨ Cleanup complete!');

  // Show final state
  const { data: finalChildren } = await supabase
    .from('children')
    .select('id, name, age')
    .order('name');

  console.log('\nFinal children in database:');
  finalChildren?.forEach((child, index) => {
    console.log(`${index + 1}. ${child.name} (Age: ${child.age || 'N/A'})`);
  });
}

main().catch(console.error);
