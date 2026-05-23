"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface MechanicLocation {
  lat: number;
  lng: number;
  last_location_at: string;
}

export function useMechanicTracking(mechanicId: string | null) {
  const [location, setLocation] = useState<MechanicLocation | null>(null);

  useEffect(() => {
    if (!mechanicId) return;
    const supabase = createClient();

    supabase
      .from("mechanics")
      .select("current_lat, current_lng, last_location_at")
      .eq("id", mechanicId)
      .single()
      .then(({ data }) => {
        if (data?.current_lat && data?.current_lng) {
          setLocation({ lat: data.current_lat, lng: data.current_lng, last_location_at: data.last_location_at ?? "" });
        }
      });

    const channel = supabase
      .channel(`mechanic-${mechanicId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "mechanics",
        filter: `id=eq.${mechanicId}`,
      }, (payload) => {
        const { current_lat, current_lng, last_location_at } = payload.new as {
          current_lat?: number;
          current_lng?: number;
          last_location_at?: string;
        };
        if (current_lat && current_lng) {
          setLocation({ lat: current_lat, lng: current_lng, last_location_at: last_location_at ?? "" });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [mechanicId]);

  return location;
}

export function useBookingRealtime(bookingId: string, onUpdate: (booking: Record<string, unknown>) => void) {
  useEffect(() => {
    if (!bookingId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "bookings",
        filter: `id=eq.${bookingId}`,
      }, (payload) => {
        onUpdate(payload.new as Record<string, unknown>);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [bookingId, onUpdate]);
}

export function useNotifications(userId: string | null) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    supabase
      .from("notifications")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .eq("read", false)
      .then(({ count }) => setUnreadCount(count ?? 0));

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, () => {
        setUnreadCount((c) => c + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return unreadCount;
}

export function useMechanicLocationBroadcast(mechanicId: string | null) {
  useEffect(() => {
    if (!mechanicId || typeof window === "undefined") return;
    if (!navigator.geolocation) return;

    const supabase = createClient();

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        await supabase
          .from("mechanics")
          .update({
            current_lat: pos.coords.latitude,
            current_lng: pos.coords.longitude,
            last_location_at: new Date().toISOString(),
          })
          .eq("id", mechanicId);
      },
      undefined,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [mechanicId]);
}
