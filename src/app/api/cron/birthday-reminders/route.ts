import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

/**
 * POST /api/cron/birthday-reminders
 *
 * Cron job to send birthday reminders via SMS
 * Should be called daily (e.g., via Vercel Cron or external scheduler)
 *
 * Authorization: Bearer token in Authorization header (set in Vercel Cron config)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization (use CRON_SECRET env var)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('Missing Twilio credentials');
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

    // Get today's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    // Get all recipients with birthdays
    const { data: recipients, error: recipientsError } = await supabase
      .from('recipients')
      .select(`
        id,
        name,
        birthday,
        user_id,
        profiles!inner (
          phone_number,
          full_name
        )
      `)
      .not('birthday', 'is', null)
      .not('profiles.phone_number', 'is', null);

    if (recipientsError) {
      console.error('Error fetching recipients:', recipientsError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({
        message: 'No recipients with birthdays found',
        sent: 0
      });
    }

    const reminders: Array<{ phone: string; message: string; recipient: string }> = [];

    // Check each recipient's birthday
    recipients.forEach((recipient: any) => {
      if (!recipient.birthday || !recipient.profiles?.phone_number) return;

      const birthday = new Date(recipient.birthday);
      const thisYearBirthday = new Date(
        today.getFullYear(),
        birthday.getMonth(),
        birthday.getDate()
      );

      // If birthday has passed this year, check next year
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }

      const daysUntil = Math.ceil(
        (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      let message = '';

      // Send reminder 7 days before
      if (daysUntil === 7) {
        message = `🎂 Reminder: ${recipient.name}'s birthday is in 1 week (${thisYearBirthday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })})!\n\nView gift ideas at ${process.env.NEXT_PUBLIC_APP_URL}/recipients/${recipient.id}`;
      }
      // Send reminder 1 day before
      else if (daysUntil === 1) {
        message = `🎂 Reminder: ${recipient.name}'s birthday is TOMORROW (${thisYearBirthday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })})!\n\nLast chance to get a gift!\nView ideas at ${process.env.NEXT_PUBLIC_APP_URL}/recipients/${recipient.id}`;
      }
      // Send reminder on the day
      else if (daysUntil === 0) {
        message = `🎉 Happy Birthday to ${recipient.name} TODAY!\n\nDon't forget to wish them well!\nView gift ideas at ${process.env.NEXT_PUBLIC_APP_URL}/recipients/${recipient.id}`;
      }

      if (message) {
        reminders.push({
          phone: recipient.profiles.phone_number,
          message,
          recipient: recipient.name,
        });
      }
    });

    // Send all reminders
    const results = await Promise.allSettled(
      reminders.map(async (reminder) => {
        try {
          await twilioClient.messages.create({
            body: reminder.message,
            from: twilioPhoneNumber,
            to: reminder.phone,
          });
          console.log(`✓ Sent birthday reminder for ${reminder.recipient} to ${reminder.phone}`);
          return { success: true, recipient: reminder.recipient };
        } catch (error) {
          console.error(`✗ Failed to send reminder for ${reminder.recipient}:`, error);
          return { success: false, recipient: reminder.recipient, error };
        }
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;

    return NextResponse.json({
      message: 'Birthday reminders processed',
      total: reminders.length,
      sent: successful,
      failed: reminders.length - successful,
    });
  } catch (error) {
    console.error('Error in birthday reminders cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow GET for testing (can remove in production)
export async function GET() {
  return NextResponse.json({
    message: 'Birthday reminders cron endpoint',
    usage: 'POST to this endpoint daily with Authorization: Bearer <CRON_SECRET>',
  });
}
