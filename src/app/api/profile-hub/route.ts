import { NextRequest, NextResponse } from "next/server";

const PROFILE_HUB_URL =
  process.env.PROFILE_HUB_URL || "https://profiles.maxjaffe.ai";
const SYNC_SECRET = process.env.PROFILE_SYNC_SECRET;

const headers: Record<string, string> = {
  "Content-Type": "application/json",
  ...(SYNC_SECRET ? { Authorization: `Bearer ${SYNC_SECRET}` } : {}),
};

// GET /api/profile-hub?giftstash_recipient_id=<uuid>
export async function GET(request: NextRequest) {
  const recipientId = request.nextUrl.searchParams.get(
    "giftstash_recipient_id"
  );
  if (!recipientId) {
    return NextResponse.json(
      { error: "giftstash_recipient_id is required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${PROFILE_HUB_URL}/api/profiles?giftstash_recipient_id=${recipientId}`,
      { headers, next: { revalidate: 0 } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Profile Hub returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Profile Hub Proxy] GET error:", error);
    return NextResponse.json(
      { error: "Failed to reach Profile Hub" },
      { status: 502 }
    );
  }
}

// POST /api/profile-hub — create a new profile in Profile Hub
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${PROFILE_HUB_URL}/api/profiles`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Profile Hub Proxy] POST failed:", res.status, errText);
      return NextResponse.json(
        { error: `Profile Hub returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[Profile Hub Proxy] POST error:", error);
    return NextResponse.json(
      { error: "Failed to reach Profile Hub" },
      { status: 502 }
    );
  }
}
