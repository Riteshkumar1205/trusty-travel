-- Create storage bucket for delivery proof photos
INSERT INTO storage.buckets (id, name, public) VALUES ('delivery-proofs', 'delivery-proofs', true);

-- RLS policies for delivery proof photos
CREATE POLICY "Anyone can view delivery proof photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'delivery-proofs');

CREATE POLICY "Authenticated users can upload delivery proofs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'delivery-proofs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own proofs"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'delivery-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own proofs"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'delivery-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add photo proof columns to deliveries table
ALTER TABLE public.deliveries 
ADD COLUMN pickup_photo_url TEXT,
ADD COLUMN delivery_photo_url TEXT,
ADD COLUMN recipient_name TEXT,
ADD COLUMN recipient_phone TEXT;

-- Add parcel preferences to journeys table
ALTER TABLE public.journeys
ADD COLUMN accepted_parcel_types TEXT[] DEFAULT ARRAY['documents', 'electronics', 'clothing', 'food', 'medicines', 'general'],
ADD COLUMN max_parcel_weight NUMERIC DEFAULT 10,
ADD COLUMN notes TEXT;

-- Add urgency price multiplier
ALTER TABLE public.parcels
ADD COLUMN urgent_delivery BOOLEAN DEFAULT false;