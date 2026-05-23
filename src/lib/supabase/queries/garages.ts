import { createClient } from "../client";
import { haversineDistance } from "@/lib/utils";
import type { Garage, NearbyGaragesParams } from "@/types";

export async function getNearbyGarages({
  lat,
  lng,
  radius_km = 10,
  service_category,
}: NearbyGaragesParams): Promise<Garage[]> {
  const supabase = createClient();
  let query = supabase
    .from("garages")
    .select("*")
    .eq("status", "active");

  if (service_category) {
    query = query.contains("services", [service_category]);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? [])
    .map((g) => ({
      ...g,
      distance_km: haversineDistance(lat, lng, g.lat, g.lng),
    }))
    .filter((g) => g.distance_km <= radius_km)
    .sort((a, b) => a.distance_km - b.distance_km);
}

export async function getGarageById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("garages")
    .select(`*, owner:users(*), garage_services(*, service:service_catalog(*))`)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}
