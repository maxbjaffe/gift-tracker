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
  parsedData: Record<string, unknown>;
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

function transformContext(row: SMSContextRow): SMSContext {
  return {
    id: row.id,
    phoneNumber: row.phone_number,
    userId: row.user_id,
    lastMessage: row.last_message,
    lastIntent: row.last_intent,
    pendingClarification: row.pending_clarification,
    parsedData: row.context_data || {},
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get SMS conversation context for a phone number
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
