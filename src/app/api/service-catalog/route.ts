import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("service_catalog")
      .select("id, name, category, base_price, duration_minutes, icon_name")
      .eq("is_active", true)
      .order("category");

    if (error) throw error;
    return NextResponse.json({ catalog: data ?? [] });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
