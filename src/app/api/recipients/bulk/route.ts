// src/app/api/recipients/bulk/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateDefaultAvatar } from '@/lib/avatar-utils';

interface BulkRecipient {
  name: string;
  relationship?: string;
  birthday?: string;
  age_range?: string;
}

// POST /api/recipients/bulk - Create multiple recipients at once
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recipients } = body as { recipients: BulkRecipient[] };

    // Validate input
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'At least one recipient is required' },
        { status: 400 }
      );
    }

    // Validate each recipient has a name
    const invalidRecipients = recipients.filter(r => !r.name?.trim());
    if (invalidRecipients.length > 0) {
      return NextResponse.json(
        { error: 'All recipients must have a name' },
        { status: 400 }
      );
    }

    // Prepare recipients for insertion with random avatars
    const recipientsToInsert = recipients.map(r => {
      const avatar = generateDefaultAvatar();
      return {
        user_id: user.id,
        name: r.name.trim(),
        relationship: r.relationship?.trim() || null,
        birthday: r.birthday || null,
        age_range: r.age_range?.trim() || null,
        avatar_type: avatar.type,
        avatar_data: avatar.data,
        avatar_background: avatar.background || null,
      };
    });

    // Insert all recipients
    const { data: createdRecipients, error } = await supabase
      .from('recipients')
      .insert(recipientsToInsert)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: createdRecipients?.length || 0,
      recipients: createdRecipients,
    });
  } catch (error: any) {
    console.error('Error creating bulk recipients:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create recipients' },
      { status: 500 }
    );
  }
}
