import { createClient } from "../client";
import type { Booking, BookingCreateInput } from "@/types";
import { generateBookingNumber, generateOTP } from "@/lib/utils";

export async function getBookingsByCustomer(customerId: string): Promise<Booking[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(`*, garage:garages(*), vehicle:vehicles(*), service:service_catalog(*)`)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getBookingsByGarage(garageId: string): Promise<Booking[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(`*, customer:customers(*, user:users(*)), vehicle:vehicles(*), service:service_catalog(*), mechanic:mechanics(*, user:users(*))`)
    .eq("garage_id", garageId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(`*, customer:customers(*, user:users(*)), garage:garages(*), vehicle:vehicles(*), service:service_catalog(*), mechanic:mechanics(*, user:users(*))`)
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createBooking(
  customerId: string,
  input: BookingCreateInput
): Promise<Booking> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      booking_number: generateBookingNumber(),
      customer_id: customerId,
      arrival_otp: generateOTP(),
      ...input,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
