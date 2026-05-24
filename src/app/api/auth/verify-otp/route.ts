import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/server";
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

    // Create Supabase auth user on first login (ignore "already exists" error)
    await adminClient.auth.admin
      .createUser({ email, email_confirm: true, password, user_metadata: { phone } })
      .catch(() => {});

    // Collect session cookies produced by signInWithPassword so we can
    // apply them to the returned NextResponse (cookieStore.set and
    // NextResponse.cookies are separate — we must bridge them manually)
    const pendingCookies: Array<{ name: string; value: string; options: CookieOptions }> = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              pendingCookies.push({ name, value, options: options ?? {} });
            });
          },
        },
      }
    );

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) throw signInError;
    if (!signInData.user) throw new Error("Authentication failed");

    const userId = signInData.user.id;

    // Create or fetch app-level user profile using admin client
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
    const isNewUser = !profile?.name;
    const redirect =
      isNewUser && from === "garage"
        ? "/garage/register"
        : (ROLE_REDIRECTS[role] ?? "/home");

    // Build the JSON response
    const response = NextResponse.json({
      success: true,
      needs_onboarding: isNewUser && from !== "garage",
      redirect,
    });

    // Apply session cookies collected from signInWithPassword
    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    // Clear OTP state cookie and persist role for proxy fast-path
    response.cookies.delete("otp_state");
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
