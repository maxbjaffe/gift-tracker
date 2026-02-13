import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SYNC_SECRET = process.env.PROFILE_SYNC_SECRET;

// Profile Hub field → GiftStash field mapping (reverse of profile-hub-sync.ts)
const FIELD_MAP: Record<string, string> = {
  name: "name",
  relationship: "relationship",
  date_of_birth: "birthday",
  interests: "interests",
  hobbies: "hobbies",
  favorite_colors: "favorite_colors",
  favorite_brands: "favorite_brands",
  favorite_stores: "favorite_stores",
  gift_dos: "gift_dos",
  gift_donts: "gift_donts",
  restrictions: "restrictions",
  personality_type: "personality_type",
  personality_description: "personality_description",
  gender: "gender",
  clothing_sizes: "clothing_sizes",
};

export async function POST(request: NextRequest) {
  // Validate shared secret
  if (SYNC_SECRET) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${SYNC_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = await request.json();
    const { recipientId, updates } = body;

    if (!recipientId || !updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "recipientId and updates are required" },
        { status: 400 }
      );
    }

    // Map Profile Hub field names to GiftStash field names
    const gsUpdates: Record<string, unknown> = {};
    for (const [profileField, value] of Object.entries(updates)) {
      const gsField = FIELD_MAP[profileField];
      if (gsField) {
        gsUpdates[gsField] = value;
      }
    }

    if (Object.keys(gsUpdates).length === 0) {
      return NextResponse.json({ success: true, updated: 0 });
    }

    gsUpdates.updated_at = new Date().toISOString();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("recipients")
      .update(gsUpdates)
      .eq("id", recipientId);

    if (error) {
      console.error("[Profile Sync] Update failed:", error);
      return NextResponse.json(
        { error: "Failed to update recipient" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: Object.keys(gsUpdates).length - 1, // -1 for updated_at
    });
  } catch (error) {
    console.error("[Profile Sync] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
