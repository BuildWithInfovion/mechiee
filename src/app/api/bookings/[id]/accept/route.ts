import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyCustomerBookingAccepted } from "@/lib/whatsapp";
import { format } from "date-fns";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get the garage for this owner
    const { data: garage } = await supabase
      .from("garages")
      .select("id, name, phone")
      .eq("owner_id", user.id)
      .single();

    if (!garage) return NextResponse.json({ error: "Garage not found" }, { status: 404 });

    // Verify a pending broadcast exists for this garage
    const { data: broadcast } = await supabase
      .from("booking_broadcasts")
      .select("id, status")
      .eq("booking_id", id)
      .eq("garage_id", garage.id)
      .single();

    if (!broadcast) return NextResponse.json({ error: "Request not available to your garage" }, { status: 403 });
    if (broadcast.status !== "pending") return NextResponse.json({ error: "Already taken by another garage" }, { status: 409 });

    // Atomic claim: only succeeds if booking still has garage_id = NULL and status = 'pending'
    const { data: updated, error: updateError } = await supabase
      .from("bookings")
      .update({
        garage_id: garage.id,
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "pending")
      .is("garage_id", null)
      .select(`*, garage:garages(*), customer:customers(*, user:users(*)), vehicle:vehicles(*), service:service_catalog(*)`)
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: "Already taken by another garage" }, { status: 409 });
    }

    // Mark this broadcast accepted; expire all others for this booking
    await Promise.all([
      supabase
        .from("booking_broadcasts")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("id", broadcast.id),
      supabase
        .from("booking_broadcasts")
        .update({ status: "expired", responded_at: new Date().toISOString() })
        .eq("booking_id", id)
        .neq("id", broadcast.id),
    ]);

    // Notify customer in-app
    await supabase.from("notifications").insert({
      user_id: updated.customer_id,
      title: "Mechanic Found!",
      body: `${garage.name} has accepted your booking and is on the way.`,
      type: "booking_accepted",
      data: { booking_id: id },
    });

    // WhatsApp to customer (non-fatal)
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mechiee.vercel.app";
      await notifyCustomerBookingAccepted({
        customerPhone: updated.customer?.user?.phone ?? "",
        bookingNumber: updated.booking_number,
        garageName: garage.name,
        mechanicName: "Our mechanic",
        date: format(new Date(updated.scheduled_date), "dd MMM yyyy"),
        time: updated.scheduled_time,
        trackingLink: `${appUrl}/bookings/${id}`,
      });
    } catch {}

    return NextResponse.json({ booking: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
