-- Update generate_classroom_code function to add psychologist role check
CREATE OR REPLACE FUNCTION public.generate_classroom_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHKLMNPRSTUVWXYZ23456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  -- Verify caller has psychologist role
  IF NOT has_role(auth.uid(), 'psychologist') AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only psychologists can generate classroom codes';
  END IF;
  
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN code;
END;
$$;