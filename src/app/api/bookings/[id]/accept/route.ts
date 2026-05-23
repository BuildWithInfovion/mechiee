import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyCustomerBookingAccepted } from "@/lib/whatsapp";
import { format } from "date-fns";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const body = await req.json();

    const { data: booking, error } = await supabase
      .from("bookings")
      .update({
        status: "accepted",
        mechanic_id: body.mechanic_id ?? null,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`*, garage:garages(*), customer:customers(*, user:users(*)), mechanic:mechanics(*, user:users(*))`)
      .single();

    if (error) throw error;

    await supabase.from("notifications").insert({
      user_id: booking.customer_id,
      title: "Booking Accepted!",
      body: `${booking.garage?.name} has accepted your booking.`,
      type: "booking_accepted",
      data: { booking_id: id },
    });

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mechiee.vercel.app";
      await notifyCustomerBookingAccepted({
        customerPhone: booking.customer?.user?.phone ?? "",
        bookingNumber: booking.booking_number,
        garageName: booking.garage?.name ?? "",
        mechanicName: booking.mechanic?.user?.name ?? "Assigned mechanic",
        date: format(new Date(booking.scheduled_date), "dd MMM yyyy"),
        time: booking.scheduled_time,
        trackingLink: `${appUrl}/bookings/${id}`,
      });
    } catch {}

    return NextResponse.json({ booking });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
