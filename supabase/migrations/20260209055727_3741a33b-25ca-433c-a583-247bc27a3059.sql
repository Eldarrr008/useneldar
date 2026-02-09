-- Fix 1: Restrict psychologists to only view crisis messages from students in their classrooms
DROP POLICY IF EXISTS "Psychologists can view crisis messages" ON public.chat_messages;

CREATE POLICY "Psychologists can view crisis messages from their students"
ON public.chat_messages FOR SELECT
USING (
  (is_crisis = true) AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    (
      has_role(auth.uid(), 'psychologist'::app_role) AND
      EXISTS (
        SELECT 1 FROM student_data sd
        JOIN classrooms c ON c.id = sd.classroom_id
        WHERE sd.user_id = chat_messages.user_id
        AND c.psychologist_id = auth.uid()
      )
    )
  )
);

-- Fix 2: Remove the blocking INSERT policy on crisis_detections
-- The edge function uses service_role key which bypasses RLS, so no INSERT policy is needed
DROP POLICY IF EXISTS "Service role can insert crisis detections" ON public.crisis_detections;

-- Fix 3: Update psychologist_notes INSERT policy to verify classroom relationship
DROP POLICY IF EXISTS "Psychologists can insert notes" ON public.psychologist_notes;

CREATE POLICY "Psychologists can insert notes for their students"
ON public.psychologist_notes FOR INSERT
WITH CHECK (
  (auth.uid() = psychologist_id) AND 
  has_role(auth.uid(), 'psychologist'::app_role) AND
  EXISTS (
    SELECT 1 FROM student_data sd
    JOIN classrooms c ON c.id = sd.classroom_id
    WHERE sd.user_id = psychologist_notes.student_id
    AND c.psychologist_id = auth.uid()
  )
);

-- Fix 4: Update psychologist_notes SELECT policy to also verify classroom relationship
DROP POLICY IF EXISTS "Psychologists can view own notes" ON public.psychologist_notes;

CREATE POLICY "Psychologists can view notes for their students"
ON public.psychologist_notes FOR SELECT
USING (
  (auth.uid() = psychologist_id) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  (
    has_role(auth.uid(), 'psychologist'::app_role) AND
    EXISTS (
      SELECT 1 FROM student_data sd
      JOIN classrooms c ON c.id = sd.classroom_id
      WHERE sd.user_id = psychologist_notes.student_id
      AND c.psychologist_id = auth.uid()
    )
  )
);

-- Fix 5: Update psychologist_notes UPDATE policy to verify classroom relationship
DROP POLICY IF EXISTS "Psychologists can update own notes" ON public.psychologist_notes;

CREATE POLICY "Psychologists can update notes for their students"
ON public.psychologist_notes FOR UPDATE
USING (
  (auth.uid() = psychologist_id) AND
  EXISTS (
    SELECT 1 FROM student_data sd
    JOIN classrooms c ON c.id = sd.classroom_id
    WHERE sd.user_id = psychologist_notes.student_id
    AND c.psychologist_id = auth.uid()
  )
);