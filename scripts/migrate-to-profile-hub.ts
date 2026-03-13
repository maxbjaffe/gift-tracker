/**
 * Bulk migration: create Profile Hub profiles for all GiftStash recipients
 * that don't already have a linked profile.
 *
 * Usage: npx tsx scripts/migrate-to-profile-hub.ts [--dry-run]
 */

import * as dotenv from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const gsUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const gsKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const giftstash = createClient(gsUrl, gsKey);

const PROFILE_HUB_URL =
  process.env.PROFILE_HUB_URL || "https://profiles.maxjaffe.ai";
const SYNC_SECRET = process.env.PROFILE_SYNC_SECRET;

const DRY_RUN = process.argv.includes("--dry-run");
const CONCURRENCY = 5;

interface Recipient {
  id: string;
  name: string;
  relationship: string | null;
  birthday: string | null;
  gender: string | null;
  interests: string[] | null;
  hobbies: string[] | null;
  favorite_colors: string[] | null;
  favorite_brands: string[] | null;
  favorite_stores: string[] | null;
  restrictions: string[] | null;
  personality_type: string | null;
  personality_description: string | null;
  clothing_sizes: unknown;
}

async function lookupProfile(recipientId: string): Promise<boolean> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(SYNC_SECRET ? { Authorization: `Bearer ${SYNC_SECRET}` } : {}),
  };

  const res = await fetch(
    `${PROFILE_HUB_URL}/api/profiles?giftstash_recipient_id=${recipientId}`,
    { headers }
  );

  if (!res.ok) return false;
  const profiles = await res.json();
  return Array.isArray(profiles) && profiles.length > 0;
}

async function createProfile(recipient: Recipient): Promise<boolean> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(SYNC_SECRET ? { Authorization: `Bearer ${SYNC_SECRET}` } : {}),
  };

  const body = {
    name: recipient.name,
    relationship: recipient.relationship || null,
    date_of_birth: recipient.birthday || null,
    gender: recipient.gender || null,
    interests: recipient.interests || [],
    hobbies: recipient.hobbies || [],
    favorite_colors: recipient.favorite_colors || [],
    favorite_brands: recipient.favorite_brands || [],
    favorite_stores: recipient.favorite_stores || [],
    restrictions: recipient.restrictions || [],
    personality_type: recipient.personality_type || null,
    personality_description: recipient.personality_description || null,
    clothing_sizes: recipient.clothing_sizes || null,
    giftstash_recipient_id: recipient.id,
  };

  const res = await fetch(`${PROFILE_HUB_URL}/api/profiles`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`  FAIL (${res.status}): ${text}`);
    return false;
  }
  return true;
}

async function processBatch(recipients: Recipient[]): Promise<{
  created: number;
  skipped: number;
  failed: number;
}> {
  const results = { created: 0, skipped: 0, failed: 0 };

  for (const r of recipients) {
    const exists = await lookupProfile(r.id);
    if (exists) {
      console.log(`  SKIP ${r.name} — already linked`);
      results.skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would create profile for ${r.name}`);
      results.created++;
      continue;
    }

    const ok = await createProfile(r);
    if (ok) {
      console.log(`  OK   ${r.name}`);
      results.created++;
    } else {
      results.failed++;
    }
  }

  return results;
}

async function main() {
  console.log(
    `\nMigrating GiftStash recipients to Profile Hub${DRY_RUN ? " (DRY RUN)" : ""}\n`
  );
  console.log(`Profile Hub: ${PROFILE_HUB_URL}`);
  console.log(`Concurrency: ${CONCURRENCY}\n`);

  // Fetch all recipients
  const { data: recipients, error } = await giftstash
    .from("recipients")
    .select(
      "id, name, relationship, birthday, gender, interests, hobbies, favorite_colors, favorite_brands, favorite_stores, restrictions, personality_type, personality_description, clothing_sizes"
    )
    .order("name");

  if (error) {
    console.error("Failed to fetch recipients:", error);
    process.exit(1);
  }

  console.log(`Found ${recipients.length} recipients\n`);

  const totals = { created: 0, skipped: 0, failed: 0 };

  // Process in batches of CONCURRENCY
  for (let i = 0; i < recipients.length; i += CONCURRENCY) {
    const batch = recipients.slice(i, i + CONCURRENCY);
    console.log(
      `Batch ${Math.floor(i / CONCURRENCY) + 1} (${batch.map((r) => r.name).join(", ")})`
    );
    const result = await processBatch(batch);
    totals.created += result.created;
    totals.skipped += result.skipped;
    totals.failed += result.failed;
  }

  console.log(`\nDone!`);
  console.log(`  Created: ${totals.created}`);
  console.log(`  Skipped: ${totals.skipped}`);
  console.log(`  Failed:  ${totals.failed}`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
