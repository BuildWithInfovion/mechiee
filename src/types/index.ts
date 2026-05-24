export type UserRole = "customer" | "garage_owner" | "mechanic" | "admin";
export type GarageStatus = "pending" | "active" | "suspended";
export type BookingStatus =
  | "pending"
  | "accepted"
  | "dispatched"
  | "in_progress"
  | "completed"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "refunded";
export type ServiceCategory =
  | "general_service"
  | "repair"
  | "tyres"
  | "battery"
  | "washing"
  | "other";

export interface User {
  id: string;
  phone: string;
  name: string | null;
  role: UserRole;
  profile_photo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  email: string | null;
  default_address: string | null;
  default_lat: number | null;
  default_lng: number | null;
  user?: User;
}

export interface OperatingHours {
  open: string;
  close: string;
  closed?: boolean;
}

export interface Garage {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  phone: string;
  whatsapp_number: string;
  address: string;
  lat: number;
  lng: number;
  city: string | null;
  area: string | null;
  pincode: string | null;
  status: GarageStatus;
  rating: number;
  total_reviews: number;
  total_jobs: number;
  operating_hours: Record<string, OperatingHours> | null;
  documents: Record<string, string> | null;
  logo_url: string | null;
  banner_url: string | null;
  vehicle_specialties: string[];
  service_specialties: string[];
  created_at: string;
  owner?: User;
  distance_km?: number;
}

export interface Mechanic {
  id: string;
  garage_id: string;
  experience_years: number | null;
  is_available: boolean;
  current_lat: number | null;
  current_lng: number | null;
  last_location_at: string | null;
  user?: User;
}

export interface Vehicle {
  id: string;
  customer_id: string;
  make: string;
  model: string;
  year: number | null;
  color: string | null;
  registration_number: string | null;
  fuel_type: string;
  created_at: string;
}

export interface ServiceCatalog {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  base_price: number | null;
  max_price: number | null;
  duration_minutes: number | null;
  icon_name: string | null;
  is_active: boolean;
}

export interface GarageService {
  id: string;
  garage_id: string;
  service_id: string;
  price: number;
  duration_minutes: number | null;
  is_available: boolean;
  service?: ServiceCatalog;
}

export interface BookingBroadcast {
  id: string;
  booking_id: string;
  garage_id: string;
  notified_at: string;
  status: "pending" | "accepted" | "expired";
  responded_at: string | null;
  booking?: Booking;
  distance_km?: number | null;
}

export interface Booking {
  id: string;
  booking_number: string;
  customer_id: string;
  garage_id: string | null;
  vehicle_id: string;
  service_id: string;
  mechanic_id: string | null;
  status: BookingStatus;
  scheduled_date: string;
  scheduled_time: string;
  customer_address: string;
  customer_lat: number | null;
  customer_lng: number | null;
  estimated_price: number | null;
  final_price: number | null;
  customer_notes: string | null;
  garage_notes: string | null;
  arrival_otp: string | null;
  payment_status: PaymentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  accepted_at: string | null;
  dispatched_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  customer?: Customer & { user?: User };
  garage?: Garage;
  vehicle?: Vehicle;
  service?: ServiceCatalog;
  mechanic?: Mechanic & { user?: User };
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  garage_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer?: Customer & { user?: User };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface NearbyGaragesParams {
  lat: number;
  lng: number;
  radius_km?: number;
  service_category?: ServiceCategory;
}

export interface BookingCreateInput {
  vehicle_id: string;
  service_id: string;
  scheduled_date: string;
  scheduled_time: string;
  customer_address: string;
  customer_lat?: number;
  customer_lng?: number;
  customer_notes?: string;
  estimated_price?: number;
}

export interface DashboardStats {
  total_bookings: number;
  pending_bookings: number;
  completed_bookings: number;
  total_revenue: number;
  avg_rating: number;
  total_garages?: number;
  total_customers?: number;
}
