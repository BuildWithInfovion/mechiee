import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const body = await req.json();

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled", garage_notes: body.reason })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ booking: data });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
