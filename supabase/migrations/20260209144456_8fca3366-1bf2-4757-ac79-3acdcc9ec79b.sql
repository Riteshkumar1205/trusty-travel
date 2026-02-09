
-- Phase 1: Secure public views by removing sensitive columns

-- Recreate profiles_public without phone
DROP VIEW IF EXISTS profiles_public;
CREATE VIEW profiles_public AS
  SELECT id, user_id, full_name, avatar_url, verification_status,
         trust_score, total_deliveries, successful_deliveries,
         created_at, updated_at
  FROM profiles;

-- Recreate parcels_public without contact fields
DROP VIEW IF EXISTS parcels_public;
CREATE VIEW parcels_public AS
  SELECT id, user_id, title, description, pickup_city,
         pickup_location, drop_city, drop_location, weight,
         dimensions, category, urgency, budget, preferred_modes,
         urgent_delivery, status, created_at, updated_at
  FROM parcels;

-- Recreate journeys_public without pnr_number and vehicle_number
DROP VIEW IF EXISTS journeys_public;
CREATE VIEW journeys_public AS
  SELECT id, user_id, source_city, source_location,
         destination_city, destination_location, transport_mode,
         departure_date, departure_time, arrival_date, arrival_time,
         total_capacity, available_capacity, price_per_kg,
         max_parcel_weight, accepted_parcel_types, notes,
         current_lat, current_lng, status, created_at, updated_at
  FROM journeys;

-- Phase 2: OTP hashing support
CREATE EXTENSION IF NOT EXISTS pgcrypto;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS pickup_otp_expires_at timestamptz;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_otp_expires_at timestamptz;

-- Phase 2b: OTP rate limiting table
CREATE TABLE IF NOT EXISTS public.otp_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  otp_type text NOT NULL CHECK (otp_type IN ('pickup', 'delivery')),
  attempted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.otp_attempts ENABLE ROW LEVEL SECURITY;

-- Only allow the service role to manage otp_attempts (edge function uses service key)
-- No client-side access needed
CREATE POLICY "No direct access to otp_attempts"
  ON public.otp_attempts
  FOR ALL
  USING (false);
