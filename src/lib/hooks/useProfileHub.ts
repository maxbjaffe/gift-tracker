"use client";

import { useState, useEffect } from "react";
import type { Recipient } from "@/types/database.types";

export interface ProfileHubData {
  id: string;
  name: string;
  date_of_birth: string | null;
  gender: string | null;
  relationship: string | null;
  interests: string[];
  hobbies: string[];
  favorite_colors: string[];
  favorite_brands: string[];
  favorite_stores: string[];
  personality_type: string | null;
  personality_description: string | null;
  school: string | null;
  grade: string | null;
  restrictions: string[];
  clothing_sizes: Record<string, string> | null;
  knowledge_score: number;
  profileHubUrl: string;
}

function toProfileHubData(profile: Record<string, unknown>): ProfileHubData {
  const id = profile.id as string;
  return {
    id,
    name: (profile.name as string) || "",
    date_of_birth: (profile.date_of_birth as string) || null,
    gender: (profile.gender as string) || null,
    relationship: (profile.relationship as string) || null,
    interests: (profile.interests as string[]) || [],
    hobbies: (profile.hobbies as string[]) || [],
    favorite_colors: (profile.favorite_colors as string[]) || [],
    favorite_brands: (profile.favorite_brands as string[]) || [],
    favorite_stores: (profile.favorite_stores as string[]) || [],
    personality_type: (profile.personality_type as string) || null,
    personality_description: (profile.personality_description as string) || null,
    school: (profile.school as string) || null,
    grade: (profile.grade as string) || null,
    restrictions: (profile.restrictions as string[]) || [],
    clothing_sizes:
      (profile.clothing_sizes as Record<string, string>) || null,
    knowledge_score: (profile.knowledge_score as number) || 0,
    profileHubUrl: `https://profiles.maxjaffe.ai?profile=${id}`,
  };
}

export function useProfileHub(
  recipientId: string,
  recipient: Recipient | null
): {
  profile: ProfileHubData | null;
  loading: boolean;
  error: string | null;
} {
  const [profile, setProfile] = useState<ProfileHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipientId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchProfile() {
      try {
        // 1. Look up existing profile
        const res = await fetch(
          `/api/profile-hub?giftstash_recipient_id=${recipientId}`
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch profile: ${res.status}`);
        }

        const profiles = await res.json();

        if (Array.isArray(profiles) && profiles.length > 0) {
          if (!cancelled) {
            setProfile(toProfileHubData(profiles[0]));
            setLoading(false);
          }
          return;
        }

        // 2. No profile found — auto-create if we have recipient data
        if (!recipient) {
          if (!cancelled) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        const seedData = {
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
          giftstash_recipient_id: recipientId,
        };

        const createRes = await fetch("/api/profile-hub", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(seedData),
        });

        if (!createRes.ok) {
          throw new Error(`Failed to create profile: ${createRes.status}`);
        }

        const created = await createRes.json();
        if (!cancelled) {
          setProfile(toProfileHubData(created));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load profile"
          );
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [recipientId, recipient]);

  return { profile, loading, error };
}
