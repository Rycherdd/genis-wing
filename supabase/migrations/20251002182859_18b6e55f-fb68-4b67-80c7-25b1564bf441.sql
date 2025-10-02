-- Drop existing overly permissive policies on convites table
DROP POLICY IF EXISTS "Only admins can manage convites" ON public.convites;

-- Recreate specific RLS policies for convites table with proper access control
-- Only admins can view all invites
CREATE POLICY "Only admins can view invites"
ON public.convites
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can create invites
CREATE POLICY "Only admins can create invites"
ON public.convites
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update invites
CREATE POLICY "Only admins can update invites"
ON public.convites
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete invites
CREATE POLICY "Only admins can delete invites"
ON public.convites
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Ensure RLS is enabled on convites table
ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner (defense in depth)
ALTER TABLE public.convites FORCE ROW LEVEL SECURITY;