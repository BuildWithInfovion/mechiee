import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("garages")
      .select(`*, owner:users(*), garage_services(*, service:service_catalog(*)), reviews(*, customer:customers(*, user:users(*)))`)
      .eq("id", id)
      .single();

    if (error) throw error;
    return NextResponse.json({ garage: data });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 404 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const adminClient = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    const body = await req.json();

    if (profile?.role === "admin") {
      const { data, error } = await adminClient.from("garages").update(body).eq("id", id).select().single();
      if (error) throw error;
      return NextResponse.json({ garage: data });
    }

    const { data, error } = await supabase
      .from("garages")
      .update(body)
      .eq("id", id)
      .eq("owner_id", user.id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ garage: data });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
