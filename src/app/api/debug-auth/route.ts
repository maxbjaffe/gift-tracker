// Debug endpoint to check auth status
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    return NextResponse.json({
      authenticated: !!user,
      userId: user?.id || null,
      userEmail: user?.email || null,
      error: authError?.message || null,
      cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
      headers: {
        host: request.headers.get('host'),
        referer: request.headers.get('referer'),
        userAgent: request.headers.get('user-agent')?.substring(0, 50),
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack?.substring(0, 200)
    }, { status: 500 });
  }
}
