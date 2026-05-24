import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const OTP_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function buildOtpCookie(otp: string, phone: string): string {
  const exp = Date.now() + 10 * 60 * 1000;
  const payload = `${otp}:${phone}:${exp}`;
  const sig = createHmac("sha256", OTP_SECRET).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ otp, phone, exp, sig })).toString("base64url");
}

async function sendViaTwilio(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_PHONE_NUMBER!;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "SMS delivery failed");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone || !/^\+91[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid Indian phone number" }, { status: 400 });
    }

    const otp = generateOtp();

    await sendViaTwilio(
      phone,
      `Your Mechiee OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`
    );

    const response = NextResponse.json({ success: true });
    response.cookies.set("otp_state", buildOtpCookie(otp, phone), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
