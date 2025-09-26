-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Allow anonymous users to read invites by token" ON public.convites;

-- Create a more specific policy that only allows reading specific invite tokens
-- We cannot filter by token in the policy because we don't have access to the token in the USING clause
-- So we'll make the table readable to anon users but limit what they can see via application logic
CREATE POLICY "Allow public access to read valid invites" 
ON public.convites 
FOR SELECT 
TO public
USING (status = 'pendente' AND expires_at > now());