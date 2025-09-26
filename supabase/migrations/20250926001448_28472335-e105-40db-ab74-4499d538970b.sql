-- Create a policy to allow anonymous users to read invites by token
-- This is needed for the registration page to validate invite tokens
CREATE POLICY "Allow anonymous users to read invites by token" 
ON public.convites 
FOR SELECT 
TO anon
USING (true);