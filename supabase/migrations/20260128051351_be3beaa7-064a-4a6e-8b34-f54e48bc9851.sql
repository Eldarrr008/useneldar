-- Fix 1: crisis_detections - restrict INSERT to service role only (remove permissive policy)
DROP POLICY IF EXISTS "System can insert crisis detections" ON public.crisis_detections;

-- Create new policy that only allows inserts from authenticated users for their own conversations
-- This will be handled by edge functions using service role key
CREATE POLICY "Service role can insert crisis detections" 
ON public.crisis_detections 
FOR INSERT 
WITH CHECK (false);
-- Note: Edge functions use service_role key which bypasses RLS, so this effectively blocks direct client inserts

-- Fix 2: classrooms - prevent join code exposure to all students
DROP POLICY IF EXISTS "Students can view active classrooms by join code" ON public.classrooms;

-- Students can only see classrooms they are members of
CREATE POLICY "Students can view their own classrooms" 
ON public.classrooms 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM classroom_members cm 
    WHERE cm.classroom_id = classrooms.id 
    AND cm.student_id = auth.uid()
  )
);

-- Create a function to verify join code without exposing all classrooms
CREATE OR REPLACE FUNCTION public.verify_and_join_classroom(p_join_code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_classroom_id UUID;
  v_classroom_name TEXT;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Find classroom by join code
  SELECT id, name INTO v_classroom_id, v_classroom_name
  FROM classrooms
  WHERE join_code = UPPER(p_join_code) AND is_active = true;
  
  IF v_classroom_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid join code');
  END IF;
  
  -- Check if already a member
  IF EXISTS (SELECT 1 FROM classroom_members WHERE classroom_id = v_classroom_id AND student_id = v_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already a member of this classroom');
  END IF;
  
  -- Add to classroom_members
  INSERT INTO classroom_members (classroom_id, student_id)
  VALUES (v_classroom_id, v_user_id)
  ON CONFLICT DO NOTHING;
  
  -- Update student_data with classroom_id
  INSERT INTO student_data (user_id, classroom_id)
  VALUES (v_user_id, v_classroom_id)
  ON CONFLICT (user_id) DO UPDATE SET classroom_id = v_classroom_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'classroom_id', v_classroom_id,
    'classroom_name', v_classroom_name
  );
END;
$$;