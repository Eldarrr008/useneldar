-- Fix infinite recursion between RLS policies on classrooms <-> classroom_members

-- Helper: membership check without invoking RLS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_classroom_member(_classroom_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classroom_members cm
    WHERE cm.classroom_id = _classroom_id
      AND cm.student_id = _user_id
  );
$$;

-- Helper: ownership check without invoking RLS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_classroom_owner(_classroom_id uuid, _psychologist_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classrooms c
    WHERE c.id = _classroom_id
      AND c.psychologist_id = _psychologist_id
  );
$$;

-- Recreate the student classroom visibility policy to avoid referencing classroom_members directly
DROP POLICY IF EXISTS "Students can view their own classrooms" ON public.classrooms;
CREATE POLICY "Students can view their own classrooms"
ON public.classrooms
FOR SELECT
USING (public.is_classroom_member(id, auth.uid()));

-- Recreate classroom_members SELECT policy to avoid referencing classrooms directly
DROP POLICY IF EXISTS "Psychologists can view classroom members" ON public.classroom_members;
CREATE POLICY "Psychologists can view classroom members"
ON public.classroom_members
FOR SELECT
USING (
  public.is_classroom_owner(classroom_id, auth.uid())
  OR student_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);
