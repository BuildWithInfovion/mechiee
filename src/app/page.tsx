import { redirect } from "next/navigation";
import { LandingPage } from "@/components/marketing/LandingPage";

export default async function RootPage() {
  const { createClient, createAdminClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const admin = await createAdminClient();
    const { data: profile } = await admin
      .from("users")
      .select("role, name")
      .eq("id", user.id)
      .single();

    if (!profile?.name) redirect("/onboard");

    const ROLE_HOME: Record<string, string> = {
      customer: "/home",
      garage_owner: "/garage/dashboard",
      mechanic: "/garage/dashboard",
      admin: "/admin/dashboard",
    };
    redirect(ROLE_HOME[profile.role] ?? "/home");
  }

  return <LandingPage />;
}

