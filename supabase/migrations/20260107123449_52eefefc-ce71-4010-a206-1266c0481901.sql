-- Fix the permissive RLS policy for alerts insert
DROP POLICY IF EXISTS "System can insert alerts" ON public.alerts;

-- Create a proper policy that allows authenticated users to insert alerts for crisis situations
CREATE POLICY "Authenticated users can insert alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);