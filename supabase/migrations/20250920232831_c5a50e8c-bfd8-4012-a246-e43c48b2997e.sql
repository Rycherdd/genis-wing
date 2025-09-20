-- Drop the insecure policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a secure policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- If you need to allow viewing basic profile info for app functionality,
-- you could create a more specific policy like this instead:
-- CREATE POLICY "Users can view basic profile info" 
-- ON public.profiles 
-- FOR SELECT 
-- USING (auth.uid() IS NOT NULL);  -- Only authenticated users can view profiles
-- 
-- Or even more restrictive - only show specific columns:
-- CREATE POLICY "Users can view profile names only" 
-- ON public.profiles 
-- FOR SELECT 
-- USING (auth.uid() IS NOT NULL);