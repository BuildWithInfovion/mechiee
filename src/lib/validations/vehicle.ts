import { z } from "zod";

export const vehicleSchema = z.object({
  make: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1990).max(new Date().getFullYear() + 1).optional(),
  color: z.string().optional(),
  registration_number: z.string().optional(),
  fuel_type: z.enum(["petrol", "electric"]).default("petrol"),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
