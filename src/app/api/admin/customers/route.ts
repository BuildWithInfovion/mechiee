import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const admin = await createAdminClient();

    const { data: users, error } = await admin
      .from("users")
      .select("id, phone, name, is_active, created_at, role")
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: bookingCounts } = await admin
      .from("bookings")
      .select("customer_id");

    const countMap: Record<string, number> = {};
    (bookingCounts ?? []).forEach((b: { customer_id: string }) => {
      countMap[b.customer_id] = (countMap[b.customer_id] ?? 0) + 1;
    });

    const { data: lastBookings } = await admin
      .from("bookings")
      .select("customer_id, created_at")
      .order("created_at", { ascending: false });

    const lastMap: Record<string, string> = {};
    (lastBookings ?? []).forEach((b: { customer_id: string; created_at: string }) => {
      if (!lastMap[b.customer_id]) lastMap[b.customer_id] = b.created_at;
    });

    const customers = (users ?? []).map((u) => ({
      ...u,
      booking_count: countMap[u.id] ?? 0,
      last_booking_at: lastMap[u.id] ?? null,
    }));

    return NextResponse.json({ customers });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
