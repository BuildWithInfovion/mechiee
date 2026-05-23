-- ============================================================
-- Mechiee Platform — Initial Database Schema
-- ============================================================

-- ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'garage_owner', 'mechanic', 'admin');
CREATE TYPE garage_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'dispatched', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE service_category AS ENUM ('general_service', 'repair', 'tyres', 'battery', 'washing', 'other');

-- USERS (mirrors auth.users, role-based)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100),
  role user_role NOT NULL DEFAULT 'customer',
  profile_photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMERS
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  default_address TEXT,
  default_lat DECIMAL(10,8),
  default_lng DECIMAL(11,8)
);

-- GARAGES
CREATE TABLE garages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  phone VARCHAR(15) NOT NULL,
  whatsapp_number VARCHAR(15) NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  city VARCHAR(100),
  area VARCHAR(100),
  pincode VARCHAR(10),
  status garage_status DEFAULT 'pending',
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  operating_hours JSONB DEFAULT '{}',
  documents JSONB DEFAULT '{}',
  logo_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MECHANICS (staff linked to a garage)
CREATE TABLE mechanics (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  garage_id UUID REFERENCES garages(id),
  experience_years INTEGER,
  is_available BOOLEAN DEFAULT true,
  current_lat DECIMAL(10,8),
  current_lng DECIMAL(11,8),
  last_location_at TIMESTAMPTZ
);

-- VEHICLES
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER,
  color VARCHAR(50),
  registration_number VARCHAR(20),
  fuel_type VARCHAR(20) DEFAULT 'petrol',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICE CATALOG (platform-wide service types)
CREATE TABLE service_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category service_category NOT NULL,
  base_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  duration_minutes INTEGER,
  icon_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- GARAGE SERVICES (services a specific garage offers)
CREATE TABLE garage_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID REFERENCES garages(id) ON DELETE CASCADE,
  service_id UUID REFERENCES service_catalog(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER,
  is_available BOOLEAN DEFAULT true,
  UNIQUE(garage_id, service_id)
);

-- BOOKINGS
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(30) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  garage_id UUID REFERENCES garages(id),
  vehicle_id UUID REFERENCES vehicles(id),
  service_id UUID REFERENCES service_catalog(id),
  mechanic_id UUID REFERENCES mechanics(id),
  status booking_status DEFAULT 'pending',
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  customer_address TEXT NOT NULL,
  customer_lat DECIMAL(10,8),
  customer_lng DECIMAL(11,8),
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  customer_notes TEXT,
  garage_notes TEXT,
  arrival_otp VARCHAR(6),
  payment_status payment_status DEFAULT 'pending',
  razorpay_order_id VARCHAR(200),
  razorpay_payment_id VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  dispatched_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES bookings(id),
  customer_id UUID REFERENCES customers(id),
  garage_id UUID REFERENCES garages(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50),
  read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_garages_location ON garages (lat, lng);
CREATE INDEX idx_garages_status ON garages (status);
CREATE INDEX idx_bookings_customer ON bookings (customer_id, created_at DESC);
CREATE INDEX idx_bookings_garage ON bookings (garage_id, created_at DESC);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_vehicles_customer ON vehicles (customer_id);
CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC);
CREATE INDEX idx_reviews_garage ON reviews (garage_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can do everything on users" ON users FOR ALL USING (auth.role() = 'service_role');

-- CUSTOMERS policies
CREATE POLICY "Customers can view own data" ON customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Customers can update own data" ON customers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role full access on customers" ON customers FOR ALL USING (auth.role() = 'service_role');

-- GARAGES policies
CREATE POLICY "Anyone can view active garages" ON garages FOR SELECT USING (status = 'active' OR owner_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY "Owner can update own garage" ON garages FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Service role full access on garages" ON garages FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Authenticated users can insert garage" ON garages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- VEHICLES policies
CREATE POLICY "Customers see own vehicles" ON vehicles FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Customers manage own vehicles" ON vehicles FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "Service role full access on vehicles" ON vehicles FOR ALL USING (auth.role() = 'service_role');

-- BOOKINGS policies
CREATE POLICY "Customer sees own bookings" ON bookings FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Garage sees assigned bookings" ON bookings FOR SELECT USING (
  garage_id IN (SELECT id FROM garages WHERE owner_id = auth.uid())
);
CREATE POLICY "Customers can create bookings" ON bookings FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Garage can update bookings" ON bookings FOR UPDATE USING (
  garage_id IN (SELECT id FROM garages WHERE owner_id = auth.uid())
);
CREATE POLICY "Service role full access on bookings" ON bookings FOR ALL USING (auth.role() = 'service_role');

-- REVIEWS policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Customers can write reviews" ON reviews FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Service role full access on reviews" ON reviews FOR ALL USING (auth.role() = 'service_role');

-- SERVICE CATALOG policies
CREATE POLICY "Anyone can view services" ON service_catalog FOR SELECT USING (is_active = true);
CREATE POLICY "Service role full access on catalog" ON service_catalog FOR ALL USING (auth.role() = 'service_role');

-- GARAGE SERVICES policies
CREATE POLICY "Anyone can view garage services" ON garage_services FOR SELECT USING (true);
CREATE POLICY "Garage owners can manage their services" ON garage_services FOR ALL USING (
  garage_id IN (SELECT id FROM garages WHERE owner_id = auth.uid())
);
CREATE POLICY "Service role full access on garage_services" ON garage_services FOR ALL USING (auth.role() = 'service_role');

-- NOTIFICATIONS policies
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Service role full access on notifications" ON notifications FOR ALL USING (auth.role() = 'service_role');

-- MECHANICS policies
CREATE POLICY "Anyone can view mechanics" ON mechanics FOR SELECT USING (true);
CREATE POLICY "Service role full access on mechanics" ON mechanics FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- TRIGGER: update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER garages_updated_at BEFORE UPDATE ON garages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED: Service Catalog
-- ============================================================
INSERT INTO service_catalog (name, description, category, base_price, max_price, duration_minutes, icon_name, sort_order) VALUES
  ('General Service', 'Complete bike service: oil change, filter cleaning, chain lubrication, brake check', 'general_service', 499, 999, 90, 'wrench', 1),
  ('Oil Change', 'Engine oil replacement with genuine oil', 'general_service', 199, 399, 30, 'droplets', 2),
  ('Tyre Puncture Repair', 'Quick puncture fix at your doorstep', 'tyres', 99, 199, 30, 'circle', 3),
  ('Tyre Replacement', 'New tyre fitting (tyre cost extra)', 'tyres', 149, 299, 45, 'circle-dot', 4),
  ('Battery Check & Replace', 'Battery health check and replacement', 'battery', 99, 1999, 30, 'battery', 5),
  ('Brake Service', 'Brake pad inspection and replacement', 'repair', 199, 599, 60, 'disc', 6),
  ('Chain & Sprocket', 'Chain cleaning, lubrication and sprocket inspection', 'repair', 149, 499, 45, 'link', 7),
  ('Bike Wash', 'Full exterior wash and clean', 'washing', 149, 299, 45, 'sparkles', 8),
  ('Carburetor Cleaning', 'Carburetor cleaning and tuning', 'repair', 299, 599, 60, 'settings', 9),
  ('Clutch & Gear Service', 'Clutch plate inspection and gear adjustment', 'repair', 299, 799, 90, 'cog', 10);
