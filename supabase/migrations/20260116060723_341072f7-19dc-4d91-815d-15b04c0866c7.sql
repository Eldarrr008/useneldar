-- Allow students to view classrooms by join_code for joining purposes
CREATE POLICY "Students can view active classrooms by join code" 
ON public.classrooms 
FOR SELECT 
USING (is_active = true AND has_role(auth.uid(), 'student'::app_role));