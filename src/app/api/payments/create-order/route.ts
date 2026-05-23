import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOrder } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { booking_id, amount } = await req.json();

    const order = await createOrder(amount, booking_id);

    await supabase
      .from("bookings")
      .update({ razorpay_order_id: order.id })
      .eq("id", booking_id)
      .eq("customer_id", user.id);

    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
