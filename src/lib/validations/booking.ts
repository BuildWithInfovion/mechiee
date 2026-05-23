import { z } from "zod";

export const bookingSchema = z.object({
  garage_id: z.string().uuid("Invalid garage"),
  vehicle_id: z.string().uuid("Invalid vehicle"),
  service_id: z.string().uuid("Invalid service"),
  scheduled_date: z.string().min(1, "Select a date"),
  scheduled_time: z.string().min(1, "Select a time"),
  customer_address: z.string().min(10, "Enter full address"),
  customer_lat: z.number().optional(),
  customer_lng: z.number().optional(),
  customer_notes: z.string().max(500).optional(),
  estimated_price: z.number().positive().optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
