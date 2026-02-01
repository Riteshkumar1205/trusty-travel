-- Create security definer function to check if user is parcel owner
CREATE OR REPLACE FUNCTION public.is_parcel_owner_check(parcel_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT parcel_user_id = auth.uid()
$$;

-- Create security definer function to check if user is journey owner
CREATE OR REPLACE FUNCTION public.is_journey_owner_check(journey_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT journey_user_id = auth.uid()
$$;

-- Create security definer function to check if user has delivery relationship
CREATE OR REPLACE FUNCTION public.has_delivery_with_user(other_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.deliveries d
    WHERE (d.sender_id = auth.uid() AND d.traveler_id = other_user_id)
       OR (d.traveler_id = auth.uid() AND d.sender_id = other_user_id)
  )
$$;

-- Create public view for parcels (hides contact info for non-owners)
CREATE OR REPLACE VIEW public.parcels_public
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  title,
  description,
  weight,
  dimensions,
  category,
  urgency,
  urgent_delivery,
  pickup_city,
  pickup_location,
  drop_city,
  drop_location,
  budget,
  preferred_modes,
  status,
  created_at,
  updated_at,
  -- Only show contact info to parcel owner
  CASE WHEN is_parcel_owner_check(user_id) THEN pickup_contact ELSE NULL END as pickup_contact,
  CASE WHEN is_parcel_owner_check(user_id) THEN drop_contact ELSE NULL END as drop_contact
FROM public.parcels;

-- Create public view for journeys (hides sensitive transport info for non-owners)
CREATE OR REPLACE VIEW public.journeys_public
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  source_city,
  source_location,
  destination_city,
  destination_location,
  departure_date,
  departure_time,
  arrival_date,
  arrival_time,
  transport_mode,
  total_capacity,
  available_capacity,
  price_per_kg,
  max_parcel_weight,
  accepted_parcel_types,
  notes,
  status,
  current_lat,
  current_lng,
  created_at,
  updated_at,
  -- Only show sensitive transport info to journey owner
  CASE WHEN is_journey_owner_check(user_id) THEN vehicle_number ELSE NULL END as vehicle_number,
  CASE WHEN is_journey_owner_check(user_id) THEN pnr_number ELSE NULL END as pnr_number
FROM public.journeys;

-- Create public view for profiles (hides phone for non-related users)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  verification_status,
  trust_score,
  total_deliveries,
  successful_deliveries,
  created_at,
  updated_at,
  -- Only show phone to self or delivery participants
  CASE 
    WHEN user_id = auth.uid() THEN phone
    WHEN has_delivery_with_user(user_id) THEN phone
    ELSE NULL 
  END as phone
FROM public.profiles;

-- Grant access to views for authenticated users
GRANT SELECT ON public.parcels_public TO authenticated;
GRANT SELECT ON public.journeys_public TO authenticated;
GRANT SELECT ON public.profiles_public TO authenticated;

-- Grant access to views for anon users (for public browsing)
GRANT SELECT ON public.parcels_public TO anon;
GRANT SELECT ON public.journeys_public TO anon;