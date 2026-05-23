import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone || !/^\+91[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid Indian phone number" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { channel: "sms" },
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
