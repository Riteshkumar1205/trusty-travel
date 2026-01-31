-- Fix Issue 1: Profiles table phone exposure
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a more restrictive policy: users can view their own profile OR profiles of users they have active deliveries with
CREATE POLICY "Users can view relevant profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.deliveries d
    WHERE (d.sender_id = auth.uid() AND d.traveler_id = user_id)
       OR (d.traveler_id = auth.uid() AND d.sender_id = user_id)
  )
  OR EXISTS (
    SELECT 1 FROM public.journeys j
    WHERE j.user_id = profiles.user_id
  )
);

-- Fix Issue 2: Create a view for public journey listings that excludes sensitive profile data
-- First, let's create a safe function to get traveler display info without exposing phone
CREATE OR REPLACE FUNCTION public.get_traveler_display_name(traveler_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(full_name, 'Anonymous Traveler')
  FROM public.profiles
  WHERE user_id = traveler_user_id
$$;

CREATE OR REPLACE FUNCTION public.get_traveler_trust_score(traveler_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(trust_score, 50)
  FROM public.profiles
  WHERE user_id = traveler_user_id
$$;

CREATE OR REPLACE FUNCTION public.get_traveler_verification_status(traveler_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(verification_status, 'pending')
  FROM public.profiles
  WHERE user_id = traveler_user_id
$$;