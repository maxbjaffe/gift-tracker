// Accountability Service - Supabase operations for consequences and commitments

import { createClient } from '@/lib/supabase/client';
import type {
  Child,
  Consequence,
  Commitment,
  CommitmentStats,
  PartnerNotification,
  PartnerSettings,
  CreateChildData,
  CreateConsequenceData,
  CreateCommitmentData,
  UpdateConsequenceStatusData,
  UpdateCommitmentStatusData,
  AccountabilityDashboard,
  ChildSummary,
} from '@/types/accountability';

const supabase = createClient();

// ==================== CHILDREN ====================

export async function fetchChildren(): Promise<Child[]> {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching children:', error);
    throw new Error('Failed to fetch children');
  }

  return data || [];
}

export async function fetchChild(id: string): Promise<Child | null> {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching child:', error);
    return null;
  }

  return data;
}

export async function createChild(childData: CreateChildData): Promise<Child> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('children')
    .insert({
      ...childData,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating child:', error);
    throw new Error('Failed to create child');
  }

  return data;
}

export async function updateChild(
  id: string,
  updates: Partial<CreateChildData>
): Promise<Child> {
  const { data, error } = await supabase
    .from('children')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating child:', error);
    throw new Error('Failed to update child');
  }

  return data;
}

export async function deleteChild(id: string): Promise<void> {
  const { error } = await supabase.from('children').delete().eq('id', id);

  if (error) {
    console.error('Error deleting child:', error);
    throw new Error('Failed to delete child');
  }
}

// ==================== CONSEQUENCES ====================

export async function fetchConsequences(
  filters?: {
    childId?: string;
    status?: string;
  }
): Promise<Consequence[]> {
  let query = supabase
    .from('consequences')
    .select('*, child:children(*)')
    .order('created_at', { ascending: false });

  if (filters?.childId) {
    query = query.eq('child_id', filters.childId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching consequences:', error);
    throw new Error('Failed to fetch consequences');
  }

  return data || [];
}

export async function fetchActiveConsequences(): Promise<Consequence[]> {
  return fetchConsequences({ status: 'active' });
}

export async function fetchConsequence(id: string): Promise<Consequence | null> {
  const { data, error } = await supabase
    .from('consequences')
    .select('*, child:children(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching consequence:', error);
    return null;
  }

  return data;
}

export async function createConsequence(
  consequenceData: CreateConsequenceData
): Promise<Consequence> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  // Calculate expiration if duration is provided
  let expires_at = consequenceData.expires_at;
  if (!expires_at && consequenceData.duration_days) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + consequenceData.duration_days);
    expires_at = expirationDate.toISOString();
  }

  const { data, error } = await supabase
    .from('consequences')
    .insert({
      ...consequenceData,
      created_by: user.id,
      expires_at,
    })
    .select('*, child:children(*)')
    .single();

  if (error) {
    console.error('Error creating consequence:', error);
    throw new Error('Failed to create consequence');
  }

  return data;
}

export async function updateConsequenceStatus(
  id: string,
  statusUpdate: UpdateConsequenceStatusData
): Promise<Consequence> {
  const updateData: any = {
    status: statusUpdate.status,
  };

  if (statusUpdate.lifted_by) {
    updateData.lifted_by = statusUpdate.lifted_by;
    updateData.lifted_at = new Date().toISOString();
  }

  if (statusUpdate.confirmed_by) {
    updateData.confirmed_by = statusUpdate.confirmed_by;
    updateData.confirmed_at = new Date().toISOString();
  }

  if (statusUpdate.notes) {
    updateData.notes = statusUpdate.notes;
  }

  const { data, error } = await supabase
    .from('consequences')
    .update(updateData)
    .eq('id', id)
    .select('*, child:children(*)')
    .single();

  if (error) {
    console.error('Error updating consequence status:', error);
    throw new Error('Failed to update consequence status');
  }

  return data;
}

export async function liftConsequence(id: string, liftedBy: string): Promise<Consequence> {
  return updateConsequenceStatus(id, {
    status: 'lifted',
    lifted_by: liftedBy,
  });
}

export async function confirmConsequence(id: string, confirmedBy: string): Promise<Consequence> {
  return updateConsequenceStatus(id, {
    status: 'active',
    confirmed_by: confirmedBy,
  });
}

// ==================== COMMITMENTS ====================

export async function fetchCommitments(
  filters?: {
    childId?: string;
    status?: string;
    category?: string;
  }
): Promise<Commitment[]> {
  let query = supabase
    .from('commitments')
    .select('*, child:children(*)')
    .order('due_date', { ascending: true });

  if (filters?.childId) {
    query = query.eq('child_id', filters.childId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching commitments:', error);
    throw new Error('Failed to fetch commitments');
  }

  return data || [];
}

export async function fetchActiveCommitments(): Promise<Commitment[]> {
  return fetchCommitments({ status: 'active' });
}

export async function fetchCommitment(id: string): Promise<Commitment | null> {
  const { data, error } = await supabase
    .from('commitments')
    .select('*, child:children(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching commitment:', error);
    return null;
  }

  return data;
}

export async function createCommitment(
  commitmentData: CreateCommitmentData
): Promise<Commitment> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('commitments')
    .insert({
      ...commitmentData,
      committed_by: user.id,
    })
    .select('*, child:children(*)')
    .single();

  if (error) {
    console.error('Error creating commitment:', error);
    throw new Error('Failed to create commitment');
  }

  return data;
}

export async function updateCommitmentStatus(
  id: string,
  statusUpdate: UpdateCommitmentStatusData
): Promise<Commitment> {
  const updateData: any = {
    status: statusUpdate.status,
  };

  if (statusUpdate.verified_by) {
    updateData.verified_by = statusUpdate.verified_by;
  }

  if (statusUpdate.status === 'completed') {
    updateData.completed_at = new Date().toISOString();
    updateData.completed_on_time = statusUpdate.completed_on_time ?? null;
  }

  if (statusUpdate.notes) {
    updateData.notes = statusUpdate.notes;
  }

  const { data, error } = await supabase
    .from('commitments')
    .update(updateData)
    .eq('id', id)
    .select('*, child:children(*)')
    .single();

  if (error) {
    console.error('Error updating commitment status:', error);
    throw new Error('Failed to update commitment status');
  }

  return data;
}

export async function completeCommitment(
  id: string,
  verifiedBy: string,
  onTime: boolean
): Promise<Commitment> {
  return updateCommitmentStatus(id, {
    status: 'completed',
    verified_by: verifiedBy,
    completed_on_time: onTime,
  });
}

export async function markCommitmentMissed(id: string): Promise<Commitment> {
  return updateCommitmentStatus(id, {
    status: 'missed',
  });
}

// ==================== COMMITMENT STATS ====================

export async function fetchCommitmentStats(
  childId: string,
  month?: Date
): Promise<CommitmentStats | null> {
  const targetMonth = month || new Date();
  const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const monthStr = monthStart.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('commitment_stats')
    .select('*, child:children(*)')
    .eq('child_id', childId)
    .eq('month', monthStr)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found
    console.error('Error fetching commitment stats:', error);
    return null;
  }

  return data;
}

export async function fetchAllChildrenStats(month?: Date): Promise<CommitmentStats[]> {
  const targetMonth = month || new Date();
  const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const monthStr = monthStart.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('commitment_stats')
    .select('*, child:children(*)')
    .eq('month', monthStr);

  if (error) {
    console.error('Error fetching children stats:', error);
    return [];
  }

  return data || [];
}

export async function calculateReliabilityScore(childId: string, month: Date): Promise<number> {
  const { data, error } = await supabase.rpc('calculate_reliability_score', {
    p_child_id: childId,
    p_month: month.toISOString().split('T')[0],
  });

  if (error) {
    console.error('Error calculating reliability score:', error);
    return 0;
  }

  return data || 0;
}

export async function updateCommitmentStats(
  childId: string,
  month: Date
): Promise<CommitmentStats> {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  // Get all commitments for the month
  const { data: commitments, error: commitmentsError } = await supabase
    .from('commitments')
    .select('*')
    .eq('child_id', childId)
    .gte('created_at', monthStart.toISOString())
    .lte('created_at', monthEnd.toISOString())
    .in('status', ['completed', 'missed']);

  if (commitmentsError) {
    throw new Error('Failed to fetch commitments for stats');
  }

  const total = commitments?.length || 0;
  const completed_on_time = commitments?.filter((c) => c.completed_on_time === true).length || 0;
  const completed_late =
    commitments?.filter((c) => c.status === 'completed' && c.completed_on_time === false)
      .length || 0;
  const missed = commitments?.filter((c) => c.status === 'missed').length || 0;

  const homework_count =
    commitments?.filter((c) => c.category === 'homework').length || 0;
  const chores_count = commitments?.filter((c) => c.category === 'chores').length || 0;
  const other_count =
    commitments?.filter(
      (c) => c.category !== 'homework' && c.category !== 'chores'
    ).length || 0;

  const reliability_score = total > 0 ? (completed_on_time / total) * 100 : null;

  const monthStr = monthStart.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('commitment_stats')
    .upsert({
      child_id: childId,
      month: monthStr,
      total_commitments: total,
      completed_on_time,
      completed_late,
      missed,
      reliability_score,
      homework_count,
      chores_count,
      other_count,
    })
    .select('*, child:children(*)')
    .single();

  if (error) {
    console.error('Error updating commitment stats:', error);
    throw new Error('Failed to update commitment stats');
  }

  return data;
}

// ==================== PARTNER SETTINGS ====================

export async function fetchPartnerSettings(): Promise<PartnerSettings | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('partner_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching partner settings:', error);
    return null;
  }

  return data;
}

export async function savePartnerSettings(
  settings: Partial<Omit<PartnerSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<PartnerSettings> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('partner_settings')
    .upsert({
      user_id: user.id,
      ...settings,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving partner settings:', error);
    throw new Error('Failed to save partner settings');
  }

  return data;
}

// ==================== DASHBOARD ====================

export async function fetchAccountabilityDashboard(): Promise<AccountabilityDashboard> {
  const [children, activeConsequences, activeCommitments, recentStats] = await Promise.all([
    fetchChildren(),
    fetchActiveConsequences(),
    fetchActiveCommitments(),
    fetchAllChildrenStats(),
  ]);

  // Fetch pending notifications (would be implemented separately)
  const pendingNotifications: PartnerNotification[] = [];

  return {
    children,
    activeConsequences,
    activeCommitments,
    recentStats,
    pendingNotifications,
  };
}

export async function fetchChildSummary(childId: string): Promise<ChildSummary | null> {
  const child = await fetchChild(childId);
  if (!child) return null;

  const [activeConsequences, activeCommitments, currentMonthStats] = await Promise.all([
    fetchConsequences({ childId, status: 'active' }),
    fetchCommitments({ childId, status: 'active' }),
    fetchCommitmentStats(childId),
  ]);

  // Determine reliability trend (simplified - would compare to previous month)
  const reliabilityTrend: 'up' | 'down' | 'stable' = 'stable';

  return {
    child,
    activeConsequences,
    activeCommitments,
    currentMonthStats,
    reliabilityTrend,
  };
}

// ==================== EXPIRATION HELPERS ====================

export async function expireConsequences(): Promise<void> {
  const { error } = await supabase.rpc('expire_consequences');

  if (error) {
    console.error('Error expiring consequences:', error);
  }
}

export async function markMissedCommitments(): Promise<void> {
  const { error } = await supabase.rpc('mark_missed_commitments');

  if (error) {
    console.error('Error marking missed commitments:', error);
  }
}
