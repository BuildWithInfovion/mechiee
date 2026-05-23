import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyCustomerServiceComplete } from "@/lib/whatsapp";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const body = await req.json();

    const { data: existing } = await supabase
      .from("bookings")
      .select("arrival_otp, customer_id, booking_number, final_price, garage:garages(*), customer:customers(*, user:users(*))")
      .eq("id", id)
      .single();

    if (!existing) throw new Error("Booking not found");

    if (body.verify_otp && existing.arrival_otp !== body.otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .update({
        status: body.verify_otp ? "in_progress" : "completed",
        started_at: body.verify_otp ? new Date().toISOString() : undefined,
        completed_at: !body.verify_otp ? new Date().toISOString() : undefined,
        final_price: body.final_price ?? existing.final_price,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!body.verify_otp) {
      await supabase.from("notifications").insert({
        user_id: existing.customer_id,
        title: "Service Complete!",
        body: "Your bike service is done. Please rate your experience.",
        type: "booking_completed",
        data: { booking_id: id },
      });

      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mechiee.vercel.app";
        await notifyCustomerServiceComplete({
          customerPhone: (existing.customer as { user?: { phone?: string } })?.user?.phone ?? "",
          bookingNumber: existing.booking_number,
          garageName: (existing.garage as { name?: string })?.name ?? "",
          finalPrice: body.final_price ?? 0,
          reviewLink: `${appUrl}/bookings/${id}?review=1`,
        });
      } catch {}
    }

    return NextResponse.json({ booking });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
