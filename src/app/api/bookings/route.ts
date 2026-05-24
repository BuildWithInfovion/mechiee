import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBookingNumber, generateOTP, haversineDistance } from "@/lib/utils";
import { notifyGarageNewBooking } from "@/lib/whatsapp";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

    let query = supabase
      .from("bookings")
      .select(`*, garage:garages(*), vehicle:vehicles(*), service:service_catalog(*), customer:customers(*, user:users(*)), mechanic:mechanics(*, user:users(*))`)
      .order("created_at", { ascending: false });

    if (profile?.role === "customer") {
      query = query.eq("customer_id", user.id);
    } else if (profile?.role === "garage_owner" || profile?.role === "mechanic") {
      const { data: garage } = await supabase.from("garages").select("id").eq("owner_id", user.id).single();
      if (garage) query = query.eq("garage_id", garage.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ bookings: data ?? [] });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      service_id,
      vehicle_id,
      scheduled_date,
      scheduled_time,
      customer_address,
      customer_lat,
      customer_lng,
      customer_notes,
      estimated_price,
    } = body;

    // Resolve vehicle + service for specialty matching
    const [{ data: vehicle }, { data: service }] = await Promise.all([
      supabase.from("vehicles").select("make, model").eq("id", vehicle_id).single(),
      supabase.from("service_catalog").select("name, category").eq("id", service_id).single(),
    ]);

    // Insert booking with garage_id = NULL (dispatch model)
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        garage_id: null,
        vehicle_id,
        service_id,
        scheduled_date,
        scheduled_time,
        customer_address,
        customer_lat: customer_lat ?? null,
        customer_lng: customer_lng ?? null,
        customer_notes: customer_notes ?? null,
        estimated_price: estimated_price ?? null,
        booking_number: generateBookingNumber(),
        arrival_otp: generateOTP(),
        status: "pending",
        payment_status: "pending",
      })
      .select(`*, vehicle:vehicles(*), service:service_catalog(*), customer:customers(*, user:users(*))`)
      .single();

    if (error) throw error;

    // Broadcast to nearby matching garages
    if (customer_lat && customer_lng) {
      const { data: allGarages } = await supabase
        .from("garages")
        .select("id, lat, lng, whatsapp_number, area, city, vehicle_specialties, service_specialties")
        .eq("status", "active");

      const vehicleMake = (vehicle?.make ?? "").toLowerCase();
      const serviceCategory = service?.category ?? "";

      // Filter by distance + specialty match
      const nearby = (allGarages ?? []).filter((g) => {
        const dist = haversineDistance(customer_lat, customer_lng, Number(g.lat), Number(g.lng));
        if (dist > 5) return false;
        const vs: string[] = g.vehicle_specialties ?? [];
        if (vs.length > 0 && !vs.map((v: string) => v.toLowerCase()).includes(vehicleMake)) return false;
        const ss: string[] = g.service_specialties ?? [];
        if (ss.length > 0 && !ss.includes(serviceCategory)) return false;
        return true;
      });

      // Also ensure they offer this specific service
      const { data: garageServiceRows } = await supabase
        .from("garage_services")
        .select("garage_id")
        .eq("service_id", service_id)
        .eq("is_available", true);

      const garagesOfferingService = new Set((garageServiceRows ?? []).map((r: { garage_id: string }) => r.garage_id));
      const matched = nearby.filter((g) => garagesOfferingService.has(g.id));

      if (matched.length > 0) {
        await supabase.from("booking_broadcasts").insert(
          matched.map((g) => ({ booking_id: booking.id, garage_id: g.id }))
        );

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mechiee.vercel.app";
        await Promise.allSettled(
          matched.map((g) => {
            const dist = haversineDistance(customer_lat, customer_lng, Number(g.lat), Number(g.lng));
            return notifyGarageNewBooking({
              garageWhatsApp: g.whatsapp_number,
              bookingNumber: booking.booking_number,
              customerName: booking.customer?.user?.name ?? "Customer",
              vehicleName: `${vehicle?.make ?? ""} ${vehicle?.model ?? ""}`.trim(),
              serviceName: service?.name ?? "",
              area: g.area ?? g.city ?? "Nearby",
              distanceKm: dist,
              date: format(new Date(scheduled_date), "dd MMM yyyy"),
              time: scheduled_time,
              estimatedPrice: estimated_price ?? 0,
              bookingLink: `${appUrl}/garage/requests`,
            });
          })
        );
      }
    }

    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Searching for mechanics...",
      body: `Booking #${booking.booking_number} placed. Finding the best mechanic near you.`,
      type: "booking_new",
      data: { booking_id: booking.id },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
