import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to manually trigger cron jobs for local development
 * Access: http://localhost:3000/api/cron/test?job=expire-consequences&secret=YOUR_CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.url.split('?')[1];
    const params = new URLSearchParams(searchParams);
    const job = params.get('job');
    const secret = params.get('secret');

    // Verify secret
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    if (!job) {
      return NextResponse.json({
        error: 'Missing job parameter',
        availableJobs: [
          'expire-consequences',
          'commitment-reminders',
          'consequence-warnings',
          'calculate-reliability',
          'weekly-report',
        ],
      });
    }

    // Call the appropriate cron endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const cronUrl = `${baseUrl}/api/cron/${job}`;

    const response = await fetch(cronUrl, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      job,
      cronResponse: data,
      status: response.status,
    });
  } catch (error) {
    console.error('Error testing cron job:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
