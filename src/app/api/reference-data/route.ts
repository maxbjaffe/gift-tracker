import { NextRequest, NextResponse } from "next/server";
import { createPlatformClient } from "@/lib/supabase/platform";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const platform = createPlatformClient();

  try {
    if (type === "interests") {
      // Full interest taxonomy: categories → subcategories → interests
      const [cats, subs, ints] = await Promise.all([
        platform
          .from("ref_interest_categories")
          .select("*")
          .order("display_order"),
        platform
          .from("ref_interest_subcategories")
          .select("*")
          .order("display_order"),
        platform.from("ref_interests").select("*").order("display_order"),
      ]);

      if (cats.error) throw cats.error;
      if (subs.error) throw subs.error;
      if (ints.error) throw ints.error;

      // Nest the structure
      const taxonomy = cats.data.map((cat) => ({
        ...cat,
        subcategories: subs.data
          .filter((s) => s.category_id === cat.id)
          .map((sub) => ({
            ...sub,
            interests: ints.data.filter((i) => i.subcategory_id === sub.id),
          })),
      }));

      return NextResponse.json(taxonomy);
    }

    if (type === "enum") {
      const enumType = searchParams.get("enum_type");
      if (!enumType) {
        return NextResponse.json(
          { error: "enum_type is required" },
          { status: 400 }
        );
      }

      const { data, error } = await platform
        .from("ref_enum_options")
        .select("*")
        .eq("enum_type", enumType)
        .order("display_order");

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (type === "search") {
      const q = searchParams.get("q")?.toLowerCase();
      if (!q) {
        return NextResponse.json(
          { error: "q is required" },
          { status: 400 }
        );
      }

      // Search interests by name and keywords
      const { data: interests, error: intErr } = await platform
        .from("ref_interests")
        .select("*, ref_interest_subcategories!inner(name, category_id)")
        .or(`name.ilike.%${q}%`);

      if (intErr) throw intErr;

      // Search enum options by name
      const { data: enums, error: enumErr } = await platform
        .from("ref_enum_options")
        .select("*")
        .ilike("name", `%${q}%`);

      if (enumErr) throw enumErr;

      return NextResponse.json({ interests, enums });
    }

    return NextResponse.json(
      { error: "type must be 'interests', 'enum', or 'search'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Reference data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reference data" },
      { status: 500 }
    );
  }
}
