import { createCommitment } from '../services/accountability';
import type { CreateCommitmentData, CommitmentCategory } from '@/types/accountability';
import { extractChildName } from './message-router';
import { createClient } from '@/lib/supabase/server';

export async function handleCommitmentMessage(
  message: string,
  fromNumber: string
): Promise<string> {
  try {
    // Parse the commitment from the message
    const parsed = await parseCommitment(message);

    if (!parsed) {
      return 'Could not parse commitment. Please include:\n' +
        '• Child name (Kid A, Kid B, etc.)\n' +
        '• What to do (finish homework, clean room, etc.)\n' +
        '• Deadline (by 7pm, tomorrow, etc.)\n\n' +
        'Example: "Kid A will finish homework by 7pm today"';
    }

    // Get user from phone number
    const userId = await getUserIdFromPhone(fromNumber);

    if (!userId) {
      return 'Your phone number is not registered. Please sign up first.';
    }

    // Get child ID
    const childId = await getChildIdByName(userId, parsed.childName);

    if (!childId) {
      return `Child "${parsed.childName}" not found. Please add this child first or check the spelling.`;
    }

    // Create the commitment
    const commitmentData: CreateCommitmentData = {
      child_id: childId,
      commitment_text: parsed.commitmentText,
      due_date: parsed.dueDate.toISOString(),
      category: parsed.category,
      status: 'active',
    };

    const commitment = await createCommitment(commitmentData);

    // Format success response
    const dueText = formatDueDate(parsed.dueDate);

    // TODO: Notify both parents and child (will implement in Session 4)
    const response =
      `✓ ${parsed.childName} committed: ${parsed.commitmentText}\n` +
      `Due: ${dueText}\n` +
      `Category: ${parsed.category}\n\n` +
      `Reminder will be sent 30min before deadline.`;

    return response;
  } catch (error) {
    console.error('Error handling commitment message:', error);
    return 'Error creating commitment. Please try again.';
  }
}

/**
 * Simple commitment parser (will be replaced with AI parsing in Session 3)
 * Extracts: child name, commitment text, deadline, category
 */
async function parseCommitment(message: string): Promise<{
  childName: string;
  commitmentText: string;
  dueDate: Date;
  category: CommitmentCategory;
} | null> {
  const normalized = message.toLowerCase();

  // Extract child name
  const childName = extractChildName(message);
  if (!childName) {
    return null;
  }

  // Extract commitment text (what they're committing to)
  let commitmentText = '';

  // Look for commitment text between "will" and "by"
  const willByMatch = message.match(/will\s+(.+?)\s+by/i);
  if (willByMatch) {
    commitmentText = willByMatch[1].trim();
  } else {
    // Look for text after child name
    const afterChildMatch = message.match(new RegExp(`${childName}\\s+will\\s+(.+)`, 'i'));
    if (afterChildMatch) {
      commitmentText = afterChildMatch[1].replace(/\s+by.+$/, '').trim();
    }
  }

  if (!commitmentText) {
    return null;
  }

  // Extract deadline
  const dueDate = parseDeadline(message);
  if (!dueDate) {
    return null;
  }

  // Determine category based on keywords
  const category = categorizeCommitment(commitmentText);

  return {
    childName,
    commitmentText,
    dueDate,
    category,
  };
}

/**
 * Parse deadline from message
 * Handles: "by 7pm", "tonight", "tomorrow", "Friday", etc.
 */
function parseDeadline(message: string): Date | null {
  const normalized = message.toLowerCase();
  const now = new Date();

  // Handle "by [time]" patterns
  const timeMatch = normalized.match(/by\s+(\d+)(?::(\d+))?\s*(am|pm)?/i);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const isPM = timeMatch[3]?.toLowerCase() === 'pm';

    const deadline = new Date(now);
    let hour = hours;

    if (isPM && hours < 12) {
      hour = hours + 12;
    } else if (!isPM && hours === 12) {
      hour = 0;
    }

    deadline.setHours(hour, minutes, 0, 0);

    // If the time has already passed today, assume tomorrow
    if (deadline <= now) {
      deadline.setDate(deadline.getDate() + 1);
    }

    return deadline;
  }

  // Handle relative time expressions
  if (normalized.includes('tonight') || normalized.includes('today')) {
    const deadline = new Date(now);
    deadline.setHours(20, 0, 0, 0); // Default to 8pm
    return deadline;
  }

  if (normalized.includes('tomorrow morning')) {
    const deadline = new Date(now);
    deadline.setDate(deadline.getDate() + 1);
    deadline.setHours(9, 0, 0, 0);
    return deadline;
  }

  if (normalized.includes('tomorrow afternoon') || normalized.includes('tomorrow')) {
    const deadline = new Date(now);
    deadline.setDate(deadline.getDate() + 1);
    deadline.setHours(17, 0, 0, 0); // 5pm
    return deadline;
  }

  // Handle day of week
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < days.length; i++) {
    if (normalized.includes(days[i])) {
      const deadline = new Date(now);
      const currentDay = deadline.getDay();
      const targetDay = i;

      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) {
        daysToAdd += 7; // Next week
      }

      deadline.setDate(deadline.getDate() + daysToAdd);
      deadline.setHours(17, 0, 0, 0); // Default to 5pm
      return deadline;
    }
  }

  return null;
}

/**
 * Categorize commitment based on keywords
 */
function categorizeCommitment(text: string): CommitmentCategory {
  const normalized = text.toLowerCase();

  if (normalized.includes('homework') || normalized.includes('study') || normalized.includes('assignment')) {
    return 'homework';
  }

  if (normalized.includes('clean') || normalized.includes('chore') || normalized.includes('trash') ||
      normalized.includes('dishes') || normalized.includes('laundry') || normalized.includes('room')) {
    return 'chores';
  }

  if (normalized.includes('practice') || normalized.includes('lesson') || normalized.includes('sport')) {
    return 'responsibilities';
  }

  if (normalized.includes('behave') || normalized.includes('attitude') || normalized.includes('respectful')) {
    return 'behavior';
  }

  return 'other';
}

/**
 * Format due date for display
 */
function formatDueDate(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) {
    return `Today ${timeString}`;
  }

  if (isTomorrow) {
    return `Tomorrow ${timeString}`;
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get user ID from phone number
 * TODO: Implement proper phone number lookup
 */
async function getUserIdFromPhone(phoneNumber: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Get child ID by name
 */
async function getChildIdByName(userId: string, childName: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('children')
    .select('id')
    .eq('user_id', userId)
    .ilike('name', childName)
    .single();

  if (error || !data) {
    console.error('Error finding child:', error);
    return null;
  }

  return data.id;
}
