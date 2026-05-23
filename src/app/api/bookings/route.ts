import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBookingNumber, generateOTP } from "@/lib/utils";
import { notifyGarageNewBooking } from "@/lib/whatsapp";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

    let query = supabase
      .from("bookings")
      .select(`*, garage:garages(*), vehicle:vehicles(*), service:service_catalog(*), customer:customers(*, user:users(*)), mechanic:mechanics(*, user:users(*))`)
      .order("created_at", { ascending: false });

    if (profile?.role === "customer") {
      query = query.eq("customer_id", user.id);
    } else if (profile?.role === "garage_owner" || profile?.role === "mechanic") {
      const { data: garage } = await supabase.from("garages").select("id").eq("owner_id", user.id).single();
      if (garage) query = query.eq("garage_id", garage.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ bookings: data ?? [] });
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

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        ...body,
        customer_id: user.id,
        booking_number: generateBookingNumber(),
        arrival_otp: generateOTP(),
        status: "pending",
        payment_status: "pending",
      })
      .select(`*, garage:garages(*), vehicle:vehicles(*), service:service_catalog(*), customer:customers(*, user:users(*))`)
      .single();

    if (error) throw error;

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mechiee.vercel.app";
      await notifyGarageNewBooking({
        garageWhatsApp: booking.garage.whatsapp_number,
        bookingNumber: booking.booking_number,
        customerName: booking.customer?.user?.name ?? "Customer",
        customerPhone: booking.customer?.user?.phone ?? "",
        vehicleName: `${booking.vehicle?.make} ${booking.vehicle?.model}`,
        serviceName: booking.service?.name ?? "",
        address: booking.customer_address,
        date: format(new Date(booking.scheduled_date), "dd MMM yyyy"),
        time: booking.scheduled_time,
        estimatedPrice: booking.estimated_price ?? 0,
        bookingLink: `${appUrl}/garage/requests/${booking.id}`,
      });
    } catch {
      // WhatsApp failure is non-fatal
    }

    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Booking Confirmed!",
      body: `Your booking #${booking.booking_number} is placed. Waiting for garage confirmation.`,
      type: "booking_new",
      data: { booking_id: booking.id },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
