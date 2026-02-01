-- Make delivery-proofs bucket private
UPDATE storage.buckets SET public = false WHERE id = 'delivery-proofs';

-- Drop the old public policy
DROP POLICY IF EXISTS "Anyone can view delivery proof photos" ON storage.objects;

-- Create restrictive policies for delivery participants only
CREATE POLICY "Delivery participants can view proofs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'delivery-proofs'
    AND auth.uid() IS NOT NULL
    AND (
      (storage.foldername(name))[1]::uuid IN (
        SELECT sender_id FROM public.deliveries WHERE sender_id = auth.uid()
        UNION
        SELECT traveler_id FROM public.deliveries WHERE traveler_id = auth.uid()
      )
    )
  );

CREATE POLICY "Delivery participants can upload proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'delivery-proofs'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1]::uuid = auth.uid()
  );

CREATE POLICY "Delivery participants can update their proofs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'delivery-proofs'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1]::uuid = auth.uid()
  );

CREATE POLICY "Delivery participants can delete their proofs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'delivery-proofs'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1]::uuid = auth.uid()
  );