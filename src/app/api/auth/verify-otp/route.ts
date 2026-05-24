import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createHmac } from "crypto";

const OTP_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ROLE_REDIRECTS: Record<string, string> = {
  customer: "/home",
  garage_owner: "/garage/dashboard",
  mechanic: "/garage/dashboard",
  admin: "/admin/dashboard",
};

function verifyOtpCookie(token: string, phone: string, otp: string): boolean {
  try {
    const parsed = JSON.parse(Buffer.from(token, "base64url").toString());
    const { otp: storedOtp, phone: storedPhone, exp, sig } = parsed;
    if (storedPhone !== phone) return false;
    if (Date.now() > exp) return false;
    const expected = createHmac("sha256", OTP_SECRET)
      .update(`${storedOtp}:${storedPhone}:${exp}`)
      .digest("hex");
    if (sig !== expected) return false;
    return storedOtp === otp;
  } catch {
    return false;
  }
}

function deriveAuthCredentials(phone: string) {
  const digits = phone.replace("+91", "");
  const email = `${digits}@m.mechiee.in`;
  const password = createHmac("sha256", OTP_SECRET).update(email).digest("hex");
  return { email, password };
}

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, from } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
    }

    // Verify OTP from signed HttpOnly cookie
    const cookieStore = await cookies();
    const stateToken = cookieStore.get("otp_state")?.value;
    if (!stateToken || !verifyOtpCookie(stateToken, phone, otp)) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    const { email, password } = deriveAuthCredentials(phone);
    const adminClient = await createAdminClient();

    // Create Supabase auth user if this is a first-time login (ignore if already exists)
    await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      password,
      user_metadata: { phone },
    }).catch(() => {});

    // Sign in with derived credentials — SSR client sets session cookies automatically
    const supabase = await createClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) throw signInError;
    if (!signInData.user) throw new Error("Authentication failed");

    const userId = signInData.user.id;

    // Create or fetch app-level user profile
    let { data: profile } = await adminClient
      .from("users")
      .select("role, name")
      .eq("id", userId)
      .single();

    if (!profile) {
      const { data: newProfile } = await adminClient
        .from("users")
        .insert({ id: userId, phone, role: "customer", name: null })
        .select("role, name")
        .single();

      await adminClient
        .from("customers")
        .upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true });

      profile = newProfile;
    }

    const role = profile?.role ?? "customer";
    // New garage users: send to garage registration instead of customer home
    const isNewUser = !profile?.name;
    const redirect = isNewUser && from === "garage"
      ? "/garage/register"
      : (ROLE_REDIRECTS[role] ?? "/home");

    const response = NextResponse.json({
      success: true,
      needs_onboarding: !profile?.name && from !== "garage",
      redirect,
    });

    // Clear OTP state cookie
    response.cookies.delete("otp_state");

    // Persist role in a long-lived cookie so middleware can redirect without a DB call
    response.cookies.set("user_role", role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
