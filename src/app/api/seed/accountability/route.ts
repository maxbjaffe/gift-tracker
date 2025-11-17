import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * API endpoint to seed dummy accountability data
 * GET /api/seed/accountability
 *
 * WARNING: This is for development only! Remove in production.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the first user from the database (for development/testing)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      return NextResponse.json({
        error: 'No users found. Please sign up first.',
        details: usersError?.message
      }, { status: 404 });
    }

    const userId = users[0].id;

      // Create 4 children with varied ages
      const childrenData = [
        { name: 'Emma', age: 12, avatar_color: '#3B82F6', user_id: userId },
        { name: 'Jake', age: 10, avatar_color: '#10B981', user_id: userId },
        { name: 'Sarah', age: 14, avatar_color: '#F59E0B', user_id: userId },
        { name: 'Liam', age: 8, avatar_color: '#8B5CF6', user_id: userId },
      ];

      const { data: children, error: childrenError } = await supabase
        .from('children')
        .insert(childrenData)
        .select();

      if (childrenError) {
        return NextResponse.json({ error: childrenError.message }, { status: 500 });
      }

      // Create consequences for the past 6 months + some active ones
      const now = new Date();
      const consequences = [];

      for (const child of children) {
        // More consequences for richer analytics (10-15 per child)
        const numConsequences = 10 + Math.floor(Math.random() * 6);

        for (let i = 0; i < numConsequences; i++) {
          // 20% chance of being very recent (active), 80% historical
          const isActive = Math.random() < 0.2;
          const daysAgo = isActive
            ? Math.floor(Math.random() * 3) // 0-3 days ago
            : 3 + Math.floor(Math.random() * 177); // 3-180 days ago
          const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

          const restrictionTypes = ['device', 'activity', 'privilege', 'location'];
          const restrictionType = restrictionTypes[Math.floor(Math.random() * restrictionTypes.length)];

          const restrictionItems: Record<string, string[]> = {
            device: ['iPad', 'Phone', 'TV', 'Gaming Console', 'Computer'],
            activity: ['Soccer Practice', 'Friend Visits', 'After-School Activities'],
            privilege: ['Dessert', 'Allowance', 'Movie Night', 'Late Bedtime'],
            location: ["Friend's House", 'Park', 'Mall'],
          };

          const reasons = ['homework', 'attitude', 'chores', 'behavior', 'lying', 'fighting'];
          const reason = reasons[Math.floor(Math.random() * reasons.length)];

          const durationDays = [1, 2, 3, 5, 7][Math.floor(Math.random() * 5)];
          const expiresAt = new Date(createdAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

          let status;
          if (expiresAt < now) {
            status = Math.random() > 0.2 ? 'expired' : 'lifted';
          } else {
            status = 'active';
          }

          consequences.push({
            child_id: child.id,
            restriction_type: restrictionType,
            restriction_item:
              restrictionItems[restrictionType][
                Math.floor(Math.random() * restrictionItems[restrictionType].length)
              ],
            reason,
            duration_days: durationDays,
            expires_at: expiresAt.toISOString(),
            status,
            created_by: userId,
            created_at: createdAt.toISOString(),
            severity: ['minor', 'medium', 'major'][Math.floor(Math.random() * 3)],
          });
        }
      }

      await supabase.from('consequences').insert(consequences);

      // Create commitments for the past 6 months + some active/upcoming ones
      const commitments = [];

      for (const child of children) {
        // Significantly more commitments for better analytics (40-60 per child)
        const numCommitments = 40 + Math.floor(Math.random() * 21);
        // Varied reliability profiles: Emma=85%, Jake=65%, Sarah=75%, Liam=55%
        const baseReliability = [0.85, 0.65, 0.75, 0.55][children.indexOf(child)] || 0.70;

        for (let i = 0; i < numCommitments; i++) {
          const daysAgo = Math.floor(Math.random() * 180); // 0-180 days ago
          const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

          const categories = ['homework', 'chores', 'responsibilities', 'behavior', 'other'];
          const category = categories[Math.floor(Math.random() * categories.length)];

          const commitmentTexts: Record<string, string[]> = {
            homework: ['Finish math homework', 'Complete reading assignment', 'Study for test', 'Do science project'],
            chores: ['Clean room', 'Take out trash', 'Do dishes', 'Vacuum living room', 'Feed the dog'],
            responsibilities: ['Practice piano', 'Soccer practice', 'Walk the dog', 'Help with dinner'],
            behavior: ['Be respectful to siblings', 'No fighting', 'Use kind words'],
            other: ['Read for 30 minutes', 'Limited screen time', 'Bedtime on time'],
          };

          const commitmentText =
            commitmentTexts[category][Math.floor(Math.random() * commitmentTexts[category].length)];

          const dueHour = 17 + Math.floor(Math.random() * 4);
          const dueDate = new Date(createdAt);
          dueDate.setHours(dueHour, 0, 0, 0);

          const random = Math.random();
          let status;
          let completedOnTime = null;
          let completedAt = null;

          if (random < baseReliability) {
            status = 'completed';
            completedOnTime = true;
            completedAt = new Date(dueDate.getTime() - Math.floor(Math.random() * 30 * 60 * 1000));
          } else if (random < baseReliability + 0.1) {
            status = 'completed';
            completedOnTime = false;
            completedAt = new Date(dueDate.getTime() + Math.floor(Math.random() * 60 * 60 * 1000));
          } else {
            status = 'missed';
            completedOnTime = false;
          }

          commitments.push({
            child_id: child.id,
            commitment_text: commitmentText,
            due_date: dueDate.toISOString(),
            status,
            category,
            committed_by: userId,
            created_at: createdAt.toISOString(),
            completed_on_time: completedOnTime,
            completed_at: completedAt ? completedAt.toISOString() : null,
            reminded_at: dueDate < now ? new Date(dueDate.getTime() - 30 * 60 * 1000).toISOString() : null,
          });
        }

        // Add 3-5 ACTIVE commitments for the future (for DAKboard display)
        const numActiveCommitments = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numActiveCommitments; i++) {
          const categories = ['homework', 'chores', 'responsibilities', 'behavior', 'other'];
          const category = categories[Math.floor(Math.random() * categories.length)];

          const commitmentTexts: Record<string, string[]> = {
            homework: ['Finish math homework', 'Complete reading assignment', 'Study for test', 'Do science project'],
            chores: ['Clean room', 'Take out trash', 'Do dishes', 'Vacuum living room', 'Feed the dog'],
            responsibilities: ['Practice piano', 'Soccer practice', 'Walk the dog', 'Help with dinner'],
            behavior: ['Be respectful to siblings', 'No fighting', 'Use kind words'],
            other: ['Read for 30 minutes', 'Limited screen time', 'Bedtime on time'],
          };

          const commitmentText =
            commitmentTexts[category][Math.floor(Math.random() * commitmentTexts[category].length)];

          // Create commitments due today, tomorrow, or within next 3 days
          const daysInFuture = Math.floor(Math.random() * 4); // 0-3 days
          const dueDate = new Date(now.getTime() + daysInFuture * 24 * 60 * 60 * 1000);
          const dueHour = 17 + Math.floor(Math.random() * 4);
          dueDate.setHours(dueHour, 0, 0, 0);

          commitments.push({
            child_id: child.id,
            commitment_text: commitmentText,
            due_date: dueDate.toISOString(),
            status: 'active',
            category,
            committed_by: userId,
            created_at: now.toISOString(),
            completed_on_time: null,
            completed_at: null,
            reminded_at: null,
          });
        }
      }

      await supabase.from('commitments').insert(commitments);

      // Calculate and insert commitment stats for past 6 months
      for (const child of children) {
        for (let monthsAgo = 0; monthsAgo < 6; monthsAgo++) {
          const month = new Date();
          month.setMonth(month.getMonth() - monthsAgo);
          const monthStr = month.toISOString().slice(0, 7) + '-01';

          const monthCommitments = commitments.filter((c) => {
            return (
              c.child_id === child.id &&
              c.created_at.slice(0, 7) === monthStr.slice(0, 7) &&
              (c.status === 'completed' || c.status === 'missed')
            );
          });

          if (monthCommitments.length === 0) continue;

          const total = monthCommitments.length;
          const completedOnTime = monthCommitments.filter((c) => c.completed_on_time === true).length;
          const completedLate = monthCommitments.filter(
            (c) => c.status === 'completed' && c.completed_on_time === false
          ).length;
          const missed = monthCommitments.filter((c) => c.status === 'missed').length;

          const reliabilityScore = (completedOnTime / total) * 100;

          const homeworkCount = monthCommitments.filter((c) => c.category === 'homework').length;
          const choresCount = monthCommitments.filter((c) => c.category === 'chores').length;
          const otherCount = monthCommitments.filter((c) => !['homework', 'chores'].includes(c.category)).length;

          await supabase.from('commitment_stats').insert({
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

      return NextResponse.json({
        success: true,
        message: 'Dummy data seeded successfully!',
        data: {
          children: children.length,
          consequences: consequences.length,
          commitments: commitments.length,
        },
      });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
