import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Seed script to populate dummy accountability data
 * Run with: npx tsx src/scripts/seed-accountability-data.ts
 */

async function seedData() {
  console.log('🌱 Seeding accountability data...\n');

  // Get current user (you'll need to be logged in)
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('❌ Not authenticated. Please log in first.');
    process.exit(1);
  }

  console.log(`✓ Authenticated as: ${user.email}`);

  // Create 3 children
  const childrenData = [
    { name: 'Emma', age: 12, avatar_color: '#3B82F6', user_id: user.id },
    { name: 'Jake', age: 10, avatar_color: '#10B981', user_id: user.id },
    { name: 'Sarah', age: 14, avatar_color: '#F59E0B', user_id: user.id },
  ];

  console.log('\n📝 Creating children...');
  const { data: children, error: childrenError } = await supabase
    .from('children')
    .insert(childrenData)
    .select();

  if (childrenError) {
    console.error('❌ Error creating children:', childrenError);
    process.exit(1);
  }

  console.log(`✓ Created ${children.length} children`);

  // Create consequences for the past 3 months
  const now = new Date();
  const consequences = [];

  for (const child of children) {
    // Each child gets 3-5 consequences over the past 3 months
    const numConsequences = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numConsequences; i++) {
      const daysAgo = Math.floor(Math.random() * 90); // Random day in past 90 days
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      const restrictionTypes = ['device', 'activity', 'privilege', 'location'];
      const restrictionType = restrictionTypes[Math.floor(Math.random() * restrictionTypes.length)];

      const restrictionItems = {
        device: ['iPad', 'Phone', 'TV', 'Gaming Console', 'Computer'],
        activity: ['Soccer Practice', 'Friend Visits', 'After-School Activities'],
        privilege: ['Dessert', 'Allowance', 'Movie Night', 'Late Bedtime'],
        location: ['Friend\'s House', 'Park', 'Mall'],
      };

      const reasons = ['homework', 'attitude', 'chores', 'behavior', 'lying', 'fighting'];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];

      const durationDays = [1, 2, 3, 5, 7][Math.floor(Math.random() * 5)];
      const expiresAt = new Date(createdAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

      // Determine status based on time
      let status;
      if (expiresAt < now) {
        status = Math.random() > 0.2 ? 'expired' : 'lifted'; // 80% expired, 20% lifted early
      } else {
        status = 'active';
      }

      consequences.push({
        child_id: child.id,
        restriction_type: restrictionType,
        restriction_item: restrictionItems[restrictionType][Math.floor(Math.random() * restrictionItems[restrictionType].length)],
        reason,
        duration_days: durationDays,
        expires_at: expiresAt.toISOString(),
        status,
        created_by: user.id,
        created_at: createdAt.toISOString(),
        severity: ['minor', 'medium', 'major'][Math.floor(Math.random() * 3)],
      });
    }
  }

  console.log('\n📝 Creating consequences...');
  const { error: consequencesError } = await supabase
    .from('consequences')
    .insert(consequences);

  if (consequencesError) {
    console.error('❌ Error creating consequences:', consequencesError);
    process.exit(1);
  }

  console.log(`✓ Created ${consequences.length} consequences`);

  // Create commitments for the past 3 months
  const commitments = [];

  for (const child of children) {
    // Each child gets 20-30 commitments over the past 3 months
    const numCommitments = 20 + Math.floor(Math.random() * 11);

    // Create varying reliability scores for each child
    const baseReliability = [0.85, 0.65, 0.75][children.indexOf(child)]; // Emma: 85%, Jake: 65%, Sarah: 75%

    for (let i = 0; i < numCommitments; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      const categories = ['homework', 'chores', 'responsibilities', 'behavior', 'other'];
      const category = categories[Math.floor(Math.random() * categories.length)];

      const commitmentTexts = {
        homework: ['Finish math homework', 'Complete reading assignment', 'Study for test', 'Do science project'],
        chores: ['Clean room', 'Take out trash', 'Do dishes', 'Vacuum living room', 'Feed the dog'],
        responsibilities: ['Practice piano', 'Soccer practice', 'Walk the dog', 'Help with dinner'],
        behavior: ['Be respectful to siblings', 'No fighting', 'Use kind words'],
        other: ['Read for 30 minutes', 'Limited screen time', 'Bedtime on time'],
      };

      const commitmentText = commitmentTexts[category][Math.floor(Math.random() * commitmentTexts[category].length)];

      // Due date: random hour between 5pm and 9pm on the same day
      const dueHour = 17 + Math.floor(Math.random() * 4);
      const dueDate = new Date(createdAt);
      dueDate.setHours(dueHour, 0, 0, 0);

      // Determine if completed on time based on child's reliability
      const random = Math.random();
      let status;
      let completedOnTime = null;
      let completedAt = null;

      if (random < baseReliability) {
        // Completed on time
        status = 'completed';
        completedOnTime = true;
        completedAt = new Date(dueDate.getTime() - Math.floor(Math.random() * 30 * 60 * 1000)); // 0-30 min before deadline
      } else if (random < baseReliability + 0.1) {
        // Completed late
        status = 'completed';
        completedOnTime = false;
        completedAt = new Date(dueDate.getTime() + Math.floor(Math.random() * 60 * 60 * 1000)); // 0-60 min after deadline
      } else {
        // Missed
        status = 'missed';
        completedOnTime = false;
      }

      commitments.push({
        child_id: child.id,
        commitment_text: commitmentText,
        due_date: dueDate.toISOString(),
        status,
        category,
        committed_by: user.id,
        created_at: createdAt.toISOString(),
        completed_on_time: completedOnTime,
        completed_at: completedAt ? completedAt.toISOString() : null,
        reminded_at: dueDate < now ? new Date(dueDate.getTime() - 30 * 60 * 1000).toISOString() : null,
      });
    }
  }

  console.log('\n📝 Creating commitments...');
  const { error: commitmentsError } = await supabase
    .from('commitments')
    .insert(commitments);

  if (commitmentsError) {
    console.error('❌ Error creating commitments:', commitmentsError);
    process.exit(1);
  }

  console.log(`✓ Created ${commitments.length} commitments`);

  // Calculate and insert commitment stats for each child for each month
  console.log('\n📝 Calculating commitment stats...');

  for (const child of children) {
    // Get past 3 months
    for (let monthsAgo = 0; monthsAgo < 3; monthsAgo++) {
      const month = new Date();
      month.setMonth(month.getMonth() - monthsAgo);
      const monthStr = month.toISOString().slice(0, 7) + '-01';

      // Get commitments for this child this month
      const monthCommitments = commitments.filter(c => {
        return c.child_id === child.id &&
          c.created_at.slice(0, 7) === monthStr.slice(0, 7) &&
          (c.status === 'completed' || c.status === 'missed');
      });

      if (monthCommitments.length === 0) continue;

      const total = monthCommitments.length;
      const completedOnTime = monthCommitments.filter(c => c.completed_on_time === true).length;
      const completedLate = monthCommitments.filter(c => c.status === 'completed' && c.completed_on_time === false).length;
      const missed = monthCommitments.filter(c => c.status === 'missed').length;

      const reliabilityScore = (completedOnTime / total) * 100;

      const homeworkCount = monthCommitments.filter(c => c.category === 'homework').length;
      const choresCount = monthCommitments.filter(c => c.category === 'chores').length;
      const otherCount = monthCommitments.filter(c => !['homework', 'chores'].includes(c.category)).length;

      await supabase
        .from('commitment_stats')
        .insert({
          child_id: child.id,
          month: monthStr,
          total_commitments: total,
          completed_on_time: completedOnTime,
          completed_late: completedLate,
          missed,
          reliability_score: reliabilityScore,
          improvement_trend: 'stable',
          homework_count: homeworkCount,
          chores_count: choresCount,
          other_count: otherCount,
        });
    }
  }

  console.log('✓ Created commitment stats');

  console.log('\n✅ Seeding complete!\n');
  console.log('Summary:');
  console.log(`  - ${children.length} children created`);
  console.log(`  - ${consequences.length} consequences created`);
  console.log(`  - ${commitments.length} commitments created`);
  console.log(`  - Commitment stats for 3 months\n`);
  console.log('🎉 Visit http://localhost:3000/accountability/analytics to see the analytics!\n');
}

seedData().catch((error) => {
  console.error('Error seeding data:', error);
  process.exit(1);
});
