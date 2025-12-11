-- Add column to track who rejected each delivery request
ALTER TABLE public.delivery_requests 
ADD COLUMN IF NOT EXISTS rejected_by uuid[] DEFAULT '{}';

-- Drop the existing update policy that is too restrictive
DROP POLICY IF EXISTS "Delivery persons can update requests" ON public.delivery_requests;

-- Create new policy that allows:
-- 1. Store owners to update their delivery requests
-- 2. Delivery persons to accept pending requests in their region
-- 3. Delivery persons to update requests assigned to them
CREATE POLICY "Delivery persons and store owners can update requests"
ON public.delivery_requests
FOR UPDATE
USING (
  -- Store owner can update
  EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = delivery_requests.store_id 
    AND stores.owner_id = auth.uid()
  )
  OR
  -- Delivery person assigned to this request can update
  delivery_person_id = auth.uid()
  OR
  -- Any authenticated user can update pending requests (to accept or reject)
  (status = 'pending' AND auth.uid() IS NOT NULL)
);