-- Add INSERT policy for crisis_detections table
-- The edge function uses service role which bypasses RLS, but having an explicit policy is best practice
CREATE POLICY "System can insert crisis detections"
  ON public.crisis_detections FOR INSERT
  WITH CHECK (true);