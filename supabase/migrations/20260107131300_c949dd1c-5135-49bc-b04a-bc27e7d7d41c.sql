-- Таблица классов/групп психолога
CREATE TABLE public.classrooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  join_code TEXT NOT NULL UNIQUE,
  psychologist_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Связь учеников с классами
CREATE TABLE public.classroom_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(classroom_id, student_id)
);

-- Enable RLS
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;

-- Policies для classrooms
CREATE POLICY "Psychologists can create classrooms"
ON public.classrooms FOR INSERT
WITH CHECK (auth.uid() = psychologist_id AND has_role(auth.uid(), 'psychologist'));

CREATE POLICY "Psychologists can view own classrooms"
ON public.classrooms FOR SELECT
USING (psychologist_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Psychologists can update own classrooms"
ON public.classrooms FOR UPDATE
USING (psychologist_id = auth.uid());

CREATE POLICY "Psychologists can delete own classrooms"
ON public.classrooms FOR DELETE
USING (psychologist_id = auth.uid());

-- Policies для classroom_members
CREATE POLICY "Students can join classrooms"
ON public.classroom_members FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Psychologists can view classroom members"
ON public.classroom_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms c 
    WHERE c.id = classroom_id AND c.psychologist_id = auth.uid()
  )
  OR student_id = auth.uid()
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Students can leave classrooms"
ON public.classroom_members FOR DELETE
USING (student_id = auth.uid());

-- Triggers для updated_at
CREATE TRIGGER update_classrooms_updated_at
BEFORE UPDATE ON public.classrooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Добавим classroom_id в student_data для быстрого доступа
ALTER TABLE public.student_data
ADD COLUMN classroom_id UUID REFERENCES public.classrooms(id);

-- Добавим policy для psychologists чтобы видеть данные учеников из их классов
CREATE POLICY "Psychologists can view students from their classrooms"
ON public.student_data FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms c 
    WHERE c.id = student_data.classroom_id AND c.psychologist_id = auth.uid()
  )
);

-- Функция для генерации уникального кода класса
CREATE OR REPLACE FUNCTION public.generate_classroom_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHKLMNPRSTUVWXYZ23456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN code;
END;
$$;