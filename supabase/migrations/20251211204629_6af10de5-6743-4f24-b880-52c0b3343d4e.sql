-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can add favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can remove favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view their favorites" ON public.favorites;

-- Create new PERMISSIVE policies
CREATE POLICY "Users can view their favorites" 
ON public.favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" 
ON public.favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" 
ON public.favorites 
FOR DELETE 
USING (auth.uid() = user_id);