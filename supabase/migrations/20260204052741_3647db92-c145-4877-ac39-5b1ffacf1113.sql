-- Fix timing attack vulnerability by using generic error messages
-- This prevents attackers from distinguishing valid codes from invalid ones

CREATE OR REPLACE FUNCTION public.verify_and_join_classroom(p_join_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    -- Use generic error message to prevent code enumeration
    RETURN jsonb_build_object('success', false, 'error', 'Unable to join classroom. Please verify the code and try again.');
  END IF;
  
  -- Check if already a member - use same generic message to prevent timing attacks
  IF EXISTS (SELECT 1 FROM classroom_members WHERE classroom_id = v_classroom_id AND student_id = v_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unable to join classroom. Please verify the code and try again.');
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
$function$;