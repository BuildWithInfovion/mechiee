import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { haversineDistance } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radius = parseFloat(searchParams.get("radius") ?? "10");
  const category = searchParams.get("category");

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("garages")
      .select("*, garage_services(service_id)")
      .eq("status", "active");

    if (error) throw error;

    let garages = data ?? [];

    if (!isNaN(lat) && !isNaN(lng)) {
      garages = garages
        .map((g) => ({ ...g, distance_km: haversineDistance(lat, lng, g.lat, g.lng) }))
        .filter((g) => g.distance_km <= radius)
        .sort((a, b) => a.distance_km - b.distance_km);
    }

    return NextResponse.json({ garages });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { data, error } = await supabase
      .from("garages")
      .insert({ ...body, owner_id: user.id, status: "pending" })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from("users")
      .update({ role: "garage_owner" })
      .eq("id", user.id);

    return NextResponse.json({ garage: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
