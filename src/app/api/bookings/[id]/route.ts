import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(`*, garage:garages(*), vehicle:vehicles(*), service:service_catalog(*), customer:customers(*, user:users(*)), mechanic:mechanics(*, user:users(*))`)
      .eq("id", id)
      .single();
    if (error) throw error;
    return NextResponse.json({ booking: data });
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
    const body = await req.json();
    const { data, error } = await supabase
      .from("bookings")
      .update(body)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ booking: data });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
