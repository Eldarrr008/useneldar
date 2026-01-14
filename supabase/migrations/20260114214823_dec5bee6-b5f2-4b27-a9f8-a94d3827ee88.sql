-- Fix 1: student_data - Remove overly permissive policy for psychologists
DROP POLICY IF EXISTS "Psychologists can view all student data" ON public.student_data;

-- Keep the scoped policy: "Psychologists can view students from their classrooms"
-- Add admin-only policy for full access
CREATE POLICY "Admins can view all student data"
  ON public.student_data FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: profiles - Replace "Users can view all profiles" with scoped policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Students can view profiles of psychologists in their classrooms
CREATE POLICY "Students can view classroom psychologists"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classroom_members cm
      JOIN classrooms c ON c.id = cm.classroom_id
      WHERE cm.student_id = auth.uid()
      AND c.psychologist_id = profiles.id
    )
  );

-- Psychologists can view students in their classrooms
CREATE POLICY "Psychologists can view classroom students"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classroom_members cm
      JOIN classrooms c ON c.id = cm.classroom_id
      WHERE c.psychologist_id = auth.uid()
      AND cm.student_id = profiles.id
    )
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 3: survey_responses - Replace broad psychologist access with classroom-scoped access
DROP POLICY IF EXISTS "Psychologists can view all survey responses" ON public.survey_responses;

-- Psychologists can only view responses from students in their classrooms
CREATE POLICY "Psychologists can view classroom student responses"
  ON public.survey_responses FOR SELECT
  USING (
    (has_role(auth.uid(), 'psychologist'::app_role) AND
    EXISTS (
      SELECT 1 FROM student_data sd
      JOIN classrooms c ON c.id = sd.classroom_id
      WHERE sd.user_id = survey_responses.user_id
      AND c.psychologist_id = auth.uid()
    ))
    OR has_role(auth.uid(), 'admin'::app_role)
  );