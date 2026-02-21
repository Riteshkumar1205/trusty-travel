-- Recreate views with security_invoker = true to fix SECURITY DEFINER warnings
-- These views already exclude sensitive columns from a previous migration

DROP VIEW IF EXISTS profiles_public;
CREATE VIEW profiles_public WITH (security_invoker = true) AS
  SELECT id, user_id, full_name, avatar_url, verification_status,
         trust_score, total_deliveries, successful_deliveries,
         created_at, updated_at
  FROM profiles;

DROP VIEW IF EXISTS parcels_public;
CREATE VIEW parcels_public WITH (security_invoker = true) AS
  SELECT id, user_id, title, description, pickup_city,
         pickup_location, drop_city, drop_location, weight,
         dimensions, category, urgency, budget, preferred_modes,
         urgent_delivery, status, created_at, updated_at
  FROM parcels;

DROP VIEW IF EXISTS journeys_public;
CREATE VIEW journeys_public WITH (security_invoker = true) AS
  SELECT id, user_id, source_city, source_location,
         destination_city, destination_location, transport_mode,
         departure_date, departure_time, arrival_date, arrival_time,
         total_capacity, available_capacity, price_per_kg,
         max_parcel_weight, accepted_parcel_types, notes,
         current_lat, current_lng, status, created_at, updated_at
  FROM journeys;