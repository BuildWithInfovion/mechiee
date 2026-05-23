import { redirect } from "next/navigation";

export default async function RootPage() {
  // In dev preview mode, redirect directly to the customer home
  if (process.env.NEXT_PUBLIC_DEV_PREVIEW === "true") {
    redirect("/home");
  }

  const { createClient } = await import("@/lib/supabase/server");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role, name")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (!profile.name) redirect("/onboard");

  const ROLE_HOME: Record<string, string> = {
    customer: "/home",
    garage_owner: "/garage/dashboard",
    mechanic: "/garage/dashboard",
    admin: "/admin/dashboard",
  };

  redirect(ROLE_HOME[profile.role] ?? "/home");
}
