import { createClient, createServiceSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/users
 * Admin-only endpoint to list all users with their data counts
 */
export async function GET() {
  try {
    // Use regular client for auth check
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Use service role client to bypass RLS and fetch all user profiles
    const adminClient = createServiceSupabaseClient();

    const { data: profiles, error: profilesError } = await adminClient
      .from('user_profiles')
      .select('id, email, is_admin, created_at');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch user profiles' },
        { status: 500 }
      );
    }

    // Get data counts for each user using service role client
    const usersWithCounts = await Promise.all(
      profiles.map(async (profile) => {
        const [recipients, gifts, conversations] = await Promise.all([
          adminClient.from('recipients').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
          adminClient.from('gifts').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
          adminClient.from('chat_conversations').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
        ]);

        return {
          id: profile.id,
          email: profile.email,
          is_admin: profile.is_admin,
          signup_date: profile.created_at,
          last_login: null, // Can be added later if needed
          recipient_count: recipients.count || 0,
          gift_count: gifts.count || 0,
          conversation_count: conversations.count || 0,
        };
      })
    );

    return NextResponse.json({ users: usersWithCounts });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
