import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getGarageId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("garages")
    .select("id")
    .eq("owner_id", userId)
    .single();
  return data?.id as string | undefined;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const garageId = await getGarageId(supabase, user.id);
    if (!garageId) return NextResponse.json({ services: [] });

    const { data, error } = await supabase
      .from("garage_services")
      .select("*, service_catalog(id, name, category, icon_name)")
      .eq("garage_id", garageId);

    if (error) throw error;
    return NextResponse.json({ services: data ?? [] });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const garageId = await getGarageId(supabase, user.id);
    if (!garageId) return NextResponse.json({ error: "Garage not found" }, { status: 404 });

    const body = await req.json();
    const { data, error } = await supabase
      .from("garage_services")
      .insert({ garage_id: garageId, ...body })
      .select("*, service_catalog(id, name, category)")
      .single();

    if (error) throw error;
    return NextResponse.json({ service: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const garageId = await getGarageId(supabase, user.id);
    if (!garageId) return NextResponse.json({ error: "Garage not found" }, { status: 404 });

    const { id, ...updates } = await req.json();
    const { data, error } = await supabase
      .from("garage_services")
      .update(updates)
      .eq("id", id)
      .eq("garage_id", garageId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ service: data });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const garageId = await getGarageId(supabase, user.id);
    if (!garageId) return NextResponse.json({ error: "Garage not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabase
      .from("garage_services")
      .delete()
      .eq("id", id)
      .eq("garage_id", garageId);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
