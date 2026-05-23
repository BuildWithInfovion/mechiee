import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { booking_id, rating, comment } = await req.json();

    const { data: booking } = await supabase
      .from("bookings")
      .select("garage_id")
      .eq("id", booking_id)
      .eq("customer_id", user.id)
      .single();

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const { data: review, error } = await supabase
      .from("reviews")
      .upsert({
        booking_id,
        customer_id: user.id,
        garage_id: booking.garage_id,
        rating,
        comment,
      })
      .select()
      .single();

    if (error) throw error;

    const { data: stats } = await supabase
      .from("reviews")
      .select("rating")
      .eq("garage_id", booking.garage_id);

    if (stats && stats.length > 0) {
      const avg = stats.reduce((sum, r) => sum + r.rating, 0) / stats.length;
      await supabase
        .from("garages")
        .update({ rating: Math.round(avg * 10) / 10, total_reviews: stats.length })
        .eq("id", booking.garage_id);
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
