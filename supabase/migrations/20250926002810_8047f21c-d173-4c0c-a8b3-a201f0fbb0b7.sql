-- Remove the insecure public policy that exposes all invite data
DROP POLICY IF EXISTS "Allow public access to read valid invites" ON public.convites;

-- The remaining policies only allow authenticated users to access their own invites
-- This ensures that invitation data is properly protected