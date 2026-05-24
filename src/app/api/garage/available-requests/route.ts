import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { haversineDistance } from "@/lib/utils";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: garage } = await supabase
      .from("garages")
      .select("id, lat, lng")
      .eq("owner_id", user.id)
      .single();

    if (!garage) return NextResponse.json({ error: "Garage not found" }, { status: 404 });

    const { data: broadcasts, error } = await supabase
      .from("booking_broadcasts")
      .select(`
        id, notified_at, status,
        booking:bookings(
          id, booking_number, status, scheduled_date, scheduled_time,
          customer_address, customer_lat, customer_lng, estimated_price,
          vehicle:vehicles(make, model, year),
          service:service_catalog(name, category),
          customer:customers(user:users(name))
        )
      `)
      .eq("garage_id", garage.id)
      .eq("status", "pending")
      .order("notified_at", { ascending: false });

    if (error) throw error;

    // Attach distance to each request
    const results = (broadcasts ?? []).map((b) => {
      const bk = b.booking as { customer_lat?: number; customer_lng?: number } | null;
      const dist =
        bk?.customer_lat && bk?.customer_lng
          ? haversineDistance(Number(garage.lat), Number(garage.lng), bk.customer_lat, bk.customer_lng)
          : null;
      return { ...b, distance_km: dist };
    });

    return NextResponse.json({ requests: results });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
