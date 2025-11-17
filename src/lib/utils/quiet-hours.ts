import { createClient } from '@/lib/supabase/server';

/**
 * Check if current time is within quiet hours for a user
 */
export async function isWithinQuietHours(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data: settings } = await supabase
      .from('partner_settings')
      .select('quiet_hours_start, quiet_hours_end')
      .eq('user_id', userId)
      .single();

    if (!settings?.quiet_hours_start || !settings?.quiet_hours_end) {
      return false; // No quiet hours configured
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const quietStart = settings.quiet_hours_start;
    const quietEnd = settings.quiet_hours_end;

    // Handle cases where quiet hours span midnight
    if (quietStart < quietEnd) {
      // Normal case: 22:00 to 07:00
      return currentTime >= quietStart && currentTime < quietEnd;
    } else {
      // Spans midnight: 22:00 to 07:00 next day
      return currentTime >= quietStart || currentTime < quietEnd;
    }
  } catch (error) {
    console.error('Error checking quiet hours:', error);
    return false; // Default to allowing notifications if check fails
  }
}

/**
 * Get next available send time (after quiet hours if currently in quiet hours)
 */
export async function getNextAvailableSendTime(userId: string): Promise<Date> {
  const now = new Date();

  const inQuietHours = await isWithinQuietHours(userId);
  if (!inQuietHours) {
    return now; // Can send immediately
  }

  try {
    const supabase = await createClient();

    const { data: settings } = await supabase
      .from('partner_settings')
      .select('quiet_hours_end')
      .eq('user_id', userId)
      .single();

    if (!settings?.quiet_hours_end) {
      return now;
    }

    // Parse quiet hours end time
    const [endHour, endMinute] = settings.quiet_hours_end.split(':').map(Number);

    const nextSendTime = new Date();
    nextSendTime.setHours(endHour, endMinute, 0, 0);

    // If end time already passed today, it's tomorrow
    if (nextSendTime <= now) {
      nextSendTime.setDate(nextSendTime.getDate() + 1);
    }

    return nextSendTime;
  } catch (error) {
    console.error('Error getting next send time:', error);
    return now;
  }
}

/**
 * Format time range for display
 */
export function formatQuietHours(start: string, end: string): string {
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
  };

  return `${formatTime(start)} - ${formatTime(end)}`;
}
