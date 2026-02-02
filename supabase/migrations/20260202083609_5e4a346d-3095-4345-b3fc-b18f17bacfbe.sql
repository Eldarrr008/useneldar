-- Fix 1: Add INSERT policy for profiles table
-- The profiles table needs an INSERT policy to allow authenticated users to create their own profile
-- Currently handled by handle_new_user trigger, but we need explicit policy for security

-- Note: Profile creation is handled by handle_new_user() trigger on auth.users
-- We add a restrictive INSERT policy that only allows users to insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Fix 2: Improve has_role function with NULL handling
-- Add explicit NULL check to prevent potential edge cases
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _user_id IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id AND role = _role
    )
  END
$$;