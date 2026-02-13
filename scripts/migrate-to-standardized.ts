import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

// GiftStash Supabase
const gsUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const gsKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const giftstash = createClient(gsUrl, gsKey);

// Platform Supabase (reference data)
const platformUrl = process.env.PLATFORM_SUPABASE_URL!;
const platformKey = process.env.PLATFORM_SUPABASE_SERVICE_KEY!;
const platform = createClient(platformUrl, platformKey);

interface TaxonomyItem {
  id: string;
  name: string;
  keywords: string[];
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");
}

function mapToStandard(
  value: string,
  items: TaxonomyItem[]
): { standardName: string; matchedOn: string } | null {
  const input = normalize(value);
  if (!input) return null;

  // Exact match on name
  for (const item of items) {
    if (normalize(item.name) === input) {
      return { standardName: item.name, matchedOn: "exact" };
    }
  }

  // Keyword exact match
  for (const item of items) {
    for (const kw of item.keywords || []) {
      if (normalize(kw) === input) {
        return { standardName: item.name, matchedOn: "keyword" };
      }
    }
  }

  // Partial match (name contains or contained by)
  let best: { item: TaxonomyItem; score: number } | null = null;
  for (const item of items) {
    const itemName = normalize(item.name);
    if (itemName.includes(input) || input.includes(itemName)) {
      const overlap = Math.min(input.length, itemName.length);
      const longer = Math.max(input.length, itemName.length);
      const score = overlap / longer;
      if (!best || score > best.score) {
        best = { item, score };
      }
    }
  }

  if (best && best.score >= 0.6) {
    return { standardName: best.item.name, matchedOn: "fuzzy" };
  }

  return null;
}

async function migrate() {
  console.log("📊 Loading reference taxonomy...\n");

  // Load all interests
  const { data: interests, error: intErr } = await platform
    .from("ref_interests")
    .select("id, name, keywords");
  if (intErr) throw intErr;

  // Load relevant enums
  const { data: colors, error: colErr } = await platform
    .from("ref_enum_options")
    .select("id, name")
    .eq("enum_type", "favorite_color");
  if (colErr) throw colErr;

  const { data: brands, error: brErr } = await platform
    .from("ref_enum_options")
    .select("id, name")
    .eq("enum_type", "favorite_brand");
  if (brErr) throw brErr;

  const { data: avoids, error: avErr } = await platform
    .from("ref_enum_options")
    .select("id, name")
    .eq("enum_type", "avoid_category");
  if (avErr) throw avErr;

  const { data: relationships, error: relErr } = await platform
    .from("ref_enum_options")
    .select("id, name")
    .eq("enum_type", "relationship");
  if (relErr) throw relErr;

  const { data: genders, error: genErr } = await platform
    .from("ref_enum_options")
    .select("id, name")
    .eq("enum_type", "gender");
  if (genErr) throw genErr;

  console.log(
    `   ${interests!.length} interests, ${colors!.length} colors, ${brands!.length} brands, ${avoids!.length} avoid categories, ${relationships!.length} relationships, ${genders!.length} genders\n`
  );

  // Load all recipients
  const { data: recipients, error: recipErr } = await giftstash
    .from("recipients")
    .select("*");
  if (recipErr) throw recipErr;

  console.log(`📋 Found ${recipients!.length} recipients to migrate.\n`);

  const interestItems = interests!.map((i) => ({
    ...i,
    keywords: i.keywords || [],
  }));
  const colorItems = colors!.map((c) => ({ ...c, keywords: [] as string[] }));
  const brandItems = brands!.map((b) => ({ ...b, keywords: [] as string[] }));
  const avoidItems = avoids!.map((a) => ({ ...a, keywords: [] as string[] }));
  const relItems = relationships!.map((r) => ({
    ...r,
    keywords: [] as string[],
  }));
  const genderItems = genders!.map((g) => ({
    ...g,
    keywords: [] as string[],
  }));

  let totalMatched = 0;
  let totalCustom = 0;

  for (const recipient of recipients!) {
    console.log(`\n👤 ${recipient.name}`);
    const updates: Record<string, unknown> = {};
    let changed = false;

    // Standardize interests
    if (Array.isArray(recipient.interests) && recipient.interests.length > 0) {
      const mapped = recipient.interests.map((val: string) => {
        const match = mapToStandard(val, interestItems);
        if (match) {
          console.log(
            `   ✅ interest: "${val}" → "${match.standardName}" (${match.matchedOn})`
          );
          totalMatched++;
          return match.standardName;
        }
        console.log(`   ⚪ interest: "${val}" (kept as custom)`);
        totalCustom++;
        return val;
      });
      updates.interests = [...new Set(mapped)];
      changed = true;
    }

    // Standardize hobbies (same taxonomy as interests)
    if (Array.isArray(recipient.hobbies) && recipient.hobbies.length > 0) {
      const mapped = recipient.hobbies.map((val: string) => {
        const match = mapToStandard(val, interestItems);
        if (match) {
          console.log(
            `   ✅ hobby: "${val}" → "${match.standardName}" (${match.matchedOn})`
          );
          totalMatched++;
          return match.standardName;
        }
        console.log(`   ⚪ hobby: "${val}" (kept as custom)`);
        totalCustom++;
        return val;
      });
      updates.hobbies = [...new Set(mapped)];
      changed = true;
    }

    // Standardize colors
    if (
      Array.isArray(recipient.favorite_colors) &&
      recipient.favorite_colors.length > 0
    ) {
      const mapped = recipient.favorite_colors.map((val: string) => {
        const match = mapToStandard(val, colorItems);
        if (match) {
          console.log(
            `   ✅ color: "${val}" → "${match.standardName}" (${match.matchedOn})`
          );
          totalMatched++;
          return match.standardName;
        }
        totalCustom++;
        return val;
      });
      updates.favorite_colors = [...new Set(mapped)];
      changed = true;
    }

    // Standardize brands
    if (
      Array.isArray(recipient.favorite_brands) &&
      recipient.favorite_brands.length > 0
    ) {
      const mapped = recipient.favorite_brands.map((val: string) => {
        const match = mapToStandard(val, brandItems);
        if (match) {
          console.log(
            `   ✅ brand: "${val}" → "${match.standardName}" (${match.matchedOn})`
          );
          totalMatched++;
          return match.standardName;
        }
        totalCustom++;
        return val;
      });
      updates.favorite_brands = [...new Set(mapped)];
      changed = true;
    }

    // Standardize gift_donts
    if (
      Array.isArray(recipient.gift_donts) &&
      recipient.gift_donts.length > 0
    ) {
      const mapped = recipient.gift_donts.map((val: string) => {
        const match = mapToStandard(val, avoidItems);
        if (match) {
          console.log(
            `   ✅ avoid: "${val}" → "${match.standardName}" (${match.matchedOn})`
          );
          totalMatched++;
          return match.standardName;
        }
        totalCustom++;
        return val;
      });
      updates.gift_donts = [...new Set(mapped)];
      changed = true;
    }

    // Standardize relationship (single value)
    if (recipient.relationship) {
      const match = mapToStandard(recipient.relationship, relItems);
      if (match) {
        console.log(
          `   ✅ relationship: "${recipient.relationship}" → "${match.standardName}" (${match.matchedOn})`
        );
        updates.relationship = match.standardName;
        totalMatched++;
        changed = true;
      }
    }

    // Standardize gender (single value)
    if (recipient.gender) {
      const match = mapToStandard(recipient.gender, genderItems);
      if (match) {
        console.log(
          `   ✅ gender: "${recipient.gender}" → "${match.standardName}" (${match.matchedOn})`
        );
        updates.gender = match.standardName;
        totalMatched++;
        changed = true;
      }
    }

    if (changed) {
      updates.updated_at = new Date().toISOString();
      const { error } = await giftstash
        .from("recipients")
        .update(updates)
        .eq("id", recipient.id);
      if (error) {
        console.error(`   ❌ Failed to update: ${error.message}`);
      } else {
        console.log(`   💾 Updated.`);
      }
    } else {
      console.log(`   (no array fields to migrate)`);
    }
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`✅ Migration complete!`);
  console.log(`   Matched to taxonomy: ${totalMatched}`);
  console.log(`   Kept as custom: ${totalCustom}`);
  console.log(`═══════════════════════════════════════\n`);
}

migrate().catch(console.error);
