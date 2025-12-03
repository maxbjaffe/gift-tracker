import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface SMSContext {
  id: string;
  phoneNumber: string;
  userId: string | null;
  lastMessage: string;
  lastIntent: string;
  pendingClarification: string | null;
  // Use parsedData for gift handler compatibility
  parsedData: Record<string, unknown>;
  contextData: {
    partialConsequence?: {
      childId?: string;
      restrictionType?: string;
      restrictionItem?: string;
      reason?: string;
      duration?: number;
    };
    partialCommitment?: {
      childId?: string;
      commitmentText?: string;
      category?: string;
      dueDate?: string;
    };
    lastChildMentioned?: string;
    conversationStep?: 'awaiting_child' | 'awaiting_duration' | 'awaiting_reason' | 'awaiting_confirmation';
  };
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// Raw database row type (snake_case)
interface SMSContextRow {
  id: string;
  phone_number: string;
  user_id: string | null;
  last_message: string;
  last_intent: string;
  pending_clarification: string | null;
  context_data: Record<string, unknown>;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// Transform database row to SMSContext
function transformContext(row: SMSContextRow): SMSContext {
  return {
    id: row.id,
    phoneNumber: row.phone_number,
    userId: row.user_id,
    lastMessage: row.last_message,
    lastIntent: row.last_intent,
    pendingClarification: row.pending_clarification,
    // parsedData is an alias for contextData for gift handler compatibility
    parsedData: row.context_data || {},
    contextData: row.context_data as SMSContext['contextData'] || {},
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get or create SMS conversation context
 */
export async function getSMSContext(phoneNumber: string): Promise<SMSContext | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('sms_context')
    .select('*')
    .eq('phone_number', phoneNumber)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found
    console.error('Error fetching SMS context:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return transformContext(data as SMSContextRow);
}

/**
 * Save or update SMS conversation context
 */
export async function saveSMSContext(
  phoneNumber: string,
  userId: string | null,
  message: string,
  intent: string,
  contextData: Record<string, unknown>,
  pendingClarification: string | null = null
): Promise<SMSContext | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Context expires after 30 minutes
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30);

  const contextRecord = {
    phone_number: phoneNumber,
    user_id: userId,
    last_message: message,
    last_intent: intent,
    pending_clarification: pendingClarification,
    context_data: contextData,
    expires_at: expiresAt.toISOString(),
  };

  const { data, error } = await supabase
    .from('sms_context')
    .upsert(contextRecord, {
      onConflict: 'phone_number',
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving SMS context:', error);
    return null;
  }

  return transformContext(data as SMSContextRow);
}

/**
 * Clear SMS context for a phone number
 */
export async function clearSMSContext(phoneNumber: string): Promise<boolean> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { error } = await supabase.from('sms_context').delete().eq('phone_number', phoneNumber);

  if (error) {
    console.error('Error clearing SMS context:', error);
    return false;
  }

  return true;
}

/**
 * Check if user has pending clarification
 */
export function hasPendingClarification(context: SMSContext | null): boolean {
  return !!(context?.pendingClarification && context.contextData.conversationStep);
}

/**
 * Get last mentioned child from context
 */
export function getLastChildMentioned(context: SMSContext | null): string | null {
  return context?.contextData.lastChildMentioned || null;
}

/**
 * Merge clarification response with partial data
 */
export function mergeClarificationResponse(
  context: SMSContext,
  response: string
): SMSContext['contextData'] {
  const step = context.contextData.conversationStep;
  const newData = { ...context.contextData };

  switch (step) {
    case 'awaiting_child':
      // User provided child name
      newData.lastChildMentioned = response;
      if (context.contextData.partialConsequence) {
        newData.partialConsequence = {
          ...context.contextData.partialConsequence,
          childId: response, // Will be resolved to actual ID later
        };
      }
      if (context.contextData.partialCommitment) {
        newData.partialCommitment = {
          ...context.contextData.partialCommitment,
          childId: response,
        };
      }
      break;

    case 'awaiting_duration':
      // User provided duration
      const durationMatch = response.match(/(\d+)/);
      if (durationMatch && context.contextData.partialConsequence) {
        newData.partialConsequence = {
          ...context.contextData.partialConsequence,
          duration: parseInt(durationMatch[1]),
        };
      }
      break;

    case 'awaiting_reason':
      // User provided reason
      if (context.contextData.partialConsequence) {
        newData.partialConsequence = {
          ...context.contextData.partialConsequence,
          reason: response,
        };
      }
      break;
  }

  // Clear conversation step after merging
  delete newData.conversationStep;

  return newData;
}

/**
 * Clean up expired contexts (called by cron job)
 */
export async function cleanupExpiredContexts(): Promise<number> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('sms_context')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select();

  if (error) {
    console.error('Error cleaning up expired contexts:', error);
    return 0;
  }

  return data?.length || 0;
}
