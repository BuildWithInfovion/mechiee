import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const adminClient = await createAdminClient();

    const [garagesRes, customersRes, bookingsRes] = await Promise.all([
      adminClient.from("garages").select("id, status"),
      adminClient.from("customers").select("id"),
      adminClient.from("bookings").select("id, status, final_price, estimated_price"),
    ]);

    const garages = garagesRes.data ?? [];
    const customers = customersRes.data ?? [];
    const bookings = bookingsRes.data ?? [];

    const completed = bookings.filter((b) => b.status === "completed");
    const revenue = completed.reduce((sum, b) => sum + (b.final_price ?? b.estimated_price ?? 0), 0);

    return NextResponse.json({
      total_garages: garages.length,
      pending_garages: garages.filter((g) => g.status === "pending").length,
      total_customers: customers.length,
      total_bookings: bookings.length,
      completed_bookings: completed.length,
      pending_bookings: bookings.filter((b) => b.status === "pending").length,
      total_revenue: revenue,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
