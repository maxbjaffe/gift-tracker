// GiftStash → Profile Hub enrichment sync
// Pushes profile changes to the unified Profile Hub when recipients are updated

const PROFILE_HUB_URL =
  process.env.PROFILE_HUB_URL || "https://profiles.maxjaffe.ai";
const SYNC_SECRET = process.env.PROFILE_SYNC_SECRET;

// GiftStash field → Profile Hub field mapping
const FIELD_MAP: Record<string, string> = {
  name: "name",
  relationship: "relationship",
  birthday: "date_of_birth",
  interests: "interests",
  hobbies: "hobbies",
  favorite_colors: "favorite_colors",
  favorite_brands: "favorite_brands",
  favorite_stores: "favorite_stores",
  restrictions: "restrictions",
  personality_type: "personality_type",
  personality_description: "personality_description",
  gender: "gender",
  clothing_sizes: "clothing_sizes",
  grade: "grade",
};

interface SyncResult {
  success: boolean;
  profileId?: string;
  enrichmentsApplied: number;
  errors: string[];
}

export async function syncToProfileHub(
  recipientId: string,
  changedFields: Record<string, unknown>
): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    enrichmentsApplied: 0,
    errors: [],
  };

  try {
    // Look up the unified profile by giftstash_recipient_id
    const lookupRes = await fetch(
      `${PROFILE_HUB_URL}/api/profiles?giftstash_recipient_id=${recipientId}`,
      {
        headers: SYNC_SECRET
          ? { Authorization: `Bearer ${SYNC_SECRET}` }
          : {},
      }
    );

    if (!lookupRes.ok) {
      result.errors.push(
        `Failed to look up profile: ${lookupRes.status}`
      );
      return result;
    }

    const profiles = await lookupRes.json();
    if (!Array.isArray(profiles) || profiles.length === 0) {
      // No linked profile — skip silently
      return { ...result, success: true };
    }

    const profileId = profiles[0].id;
    result.profileId = profileId;

    // Push each changed field as an enrichment
    for (const [gsField, value] of Object.entries(changedFields)) {
      const profileField = FIELD_MAP[gsField];
      if (!profileField) continue; // Not a mapped field (e.g., notes)

      try {
        const enrichRes = await fetch(`${PROFILE_HUB_URL}/api/enrich`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(SYNC_SECRET
              ? { Authorization: `Bearer ${SYNC_SECRET}` }
              : {}),
          },
          body: JSON.stringify({
            profileId,
            sourceApp: "giftstash",
            fieldPath: profileField,
            action: "set",
            value,
            confidence: "user_confirmed",
          }),
        });

        if (enrichRes.ok) {
          result.enrichmentsApplied++;
        } else {
          result.errors.push(
            `Failed to enrich ${profileField}: ${enrichRes.status}`
          );
        }
      } catch (err) {
        result.errors.push(
          `Error enriching ${profileField}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    result.success = result.errors.length === 0;
    return result;
  } catch (err) {
    result.errors.push(
      `Sync failed: ${err instanceof Error ? err.message : String(err)}`
    );
    return result;
  }
}

// Fire-and-forget wrapper — use this in save handlers
export function syncToProfileHubAsync(
  recipientId: string,
  changedFields: Record<string, unknown>
): void {
  syncToProfileHub(recipientId, changedFields).then((result) => {
    if (result.errors.length > 0) {
      console.error("[Profile Hub Sync]", result.errors);
    } else if (result.enrichmentsApplied > 0) {
      console.log(
        `[Profile Hub Sync] ${result.enrichmentsApplied} enrichments applied to ${result.profileId}`
      );
    }
  });
}
