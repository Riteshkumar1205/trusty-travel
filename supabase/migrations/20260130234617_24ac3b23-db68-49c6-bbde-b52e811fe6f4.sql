-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create journeys table for traveler routes
CREATE TABLE public.journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  source_city TEXT NOT NULL,
  source_location TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_location TEXT NOT NULL,
  transport_mode TEXT NOT NULL CHECK (transport_mode IN ('flight', 'train', 'car', 'bike', 'truck')),
  departure_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  arrival_date DATE NOT NULL,
  arrival_time TIME NOT NULL,
  total_capacity DECIMAL(5,2) NOT NULL,
  available_capacity DECIMAL(5,2) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  pnr_number TEXT,
  vehicle_number TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in-transit', 'completed', 'cancelled')),
  current_lat DECIMAL(10,7),
  current_lng DECIMAL(10,7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create parcels table for sender items
CREATE TABLE public.parcels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  pickup_city TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  pickup_contact TEXT NOT NULL,
  drop_city TEXT NOT NULL,
  drop_location TEXT NOT NULL,
  drop_contact TEXT NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  dimensions TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'documents', 'electronics', 'fragile', 'medical', 'food')),
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent', 'critical')),
  preferred_modes TEXT[] DEFAULT ARRAY['train', 'flight', 'car'],
  budget DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'in-transit', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create deliveries table for handshake contracts
CREATE TABLE public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID REFERENCES public.parcels(id) ON DELETE CASCADE NOT NULL,
  journey_id UUID REFERENCES public.journeys(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(user_id) NOT NULL,
  traveler_id UUID REFERENCES public.profiles(user_id) NOT NULL,
  agreed_price DECIMAL(10,2) NOT NULL,
  pickup_otp TEXT,
  delivery_otp TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'picked-up', 'in-transit', 'delivered', 'cancelled')),
  pickup_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  sender_rating INTEGER CHECK (sender_rating >= 1 AND sender_rating <= 5),
  traveler_rating INTEGER CHECK (traveler_rating >= 1 AND traveler_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create delivery_tracking table for real-time location
CREATE TABLE public.delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES public.deliveries(id) ON DELETE CASCADE NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  accuracy DECIMAL(5,2),
  heading DECIMAL(5,2),
  speed DECIMAL(5,2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user owns a journey
CREATE OR REPLACE FUNCTION public.is_journey_owner(journey_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.journeys
    WHERE id = journey_id AND user_id = auth.uid()
  )
$$;

-- Helper function to check if user owns a parcel
CREATE OR REPLACE FUNCTION public.is_parcel_owner(parcel_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parcels
    WHERE id = parcel_id AND user_id = auth.uid()
  )
$$;

-- Helper function to check if user is delivery participant
CREATE OR REPLACE FUNCTION public.is_delivery_participant(delivery_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.deliveries
    WHERE id = delivery_id AND (sender_id = auth.uid() OR traveler_id = auth.uid())
  )
$$;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Journeys policies
CREATE POLICY "Journeys are viewable by everyone"
ON public.journeys FOR SELECT USING (true);

CREATE POLICY "Users can insert their own journeys"
ON public.journeys FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journeys"
ON public.journeys FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journeys"
ON public.journeys FOR DELETE USING (auth.uid() = user_id);

-- Parcels policies
CREATE POLICY "Parcels are viewable by everyone"
ON public.parcels FOR SELECT USING (true);

CREATE POLICY "Users can insert their own parcels"
ON public.parcels FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parcels"
ON public.parcels FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own parcels"
ON public.parcels FOR DELETE USING (auth.uid() = user_id);

-- Deliveries policies
CREATE POLICY "Delivery participants can view their deliveries"
ON public.deliveries FOR SELECT USING (sender_id = auth.uid() OR traveler_id = auth.uid());

CREATE POLICY "Authenticated users can create deliveries"
ON public.deliveries FOR INSERT WITH CHECK (
  auth.uid() = sender_id OR auth.uid() = traveler_id
);

CREATE POLICY "Delivery participants can update their deliveries"
ON public.deliveries FOR UPDATE USING (sender_id = auth.uid() OR traveler_id = auth.uid());

-- Delivery tracking policies
CREATE POLICY "Delivery participants can view tracking"
ON public.delivery_tracking FOR SELECT USING (
  public.is_delivery_participant(delivery_id)
);

CREATE POLICY "Delivery participants can insert tracking"
ON public.delivery_tracking FOR INSERT WITH CHECK (
  public.is_delivery_participant(delivery_id)
);

-- Enable realtime for deliveries and tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE public.journeys;

-- Create indexes for performance
CREATE INDEX idx_journeys_user_id ON public.journeys(user_id);
CREATE INDEX idx_journeys_status ON public.journeys(status);
CREATE INDEX idx_journeys_departure_date ON public.journeys(departure_date);
CREATE INDEX idx_parcels_user_id ON public.parcels(user_id);
CREATE INDEX idx_parcels_status ON public.parcels(status);
CREATE INDEX idx_deliveries_sender_id ON public.deliveries(sender_id);
CREATE INDEX idx_deliveries_traveler_id ON public.deliveries(traveler_id);
CREATE INDEX idx_deliveries_status ON public.deliveries(status);
CREATE INDEX idx_delivery_tracking_delivery_id ON public.delivery_tracking(delivery_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journeys_updated_at
BEFORE UPDATE ON public.journeys
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parcels_updated_at
BEFORE UPDATE ON public.parcels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at
BEFORE UPDATE ON public.deliveries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();