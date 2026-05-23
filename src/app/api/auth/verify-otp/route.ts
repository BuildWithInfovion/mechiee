import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const ROLE_REDIRECTS: Record<string, string> = {
  customer: "/",
  garage_owner: "/garage/dashboard",
  mechanic: "/garage/dashboard",
  admin: "/admin/dashboard",
};

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    if (error) throw error;
    if (!data.user) throw new Error("Authentication failed");

    const adminClient = await createAdminClient();

    let { data: profile } = await adminClient
      .from("users")
      .select("role, name")
      .eq("id", data.user.id)
      .single();

    if (!profile) {
      const { data: newProfile } = await adminClient
        .from("users")
        .insert({
          id: data.user.id,
          phone,
          role: "customer",
          name: null,
        })
        .select("role, name")
        .single();

      await adminClient
        .from("customers")
        .upsert({ id: data.user.id }, { onConflict: "id", ignoreDuplicates: true });

      profile = newProfile;
    }

    const needs_onboarding = !profile?.name;
    const redirect = ROLE_REDIRECTS[profile?.role ?? "customer"] ?? "/";

    return NextResponse.json({ success: true, needs_onboarding, redirect });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
