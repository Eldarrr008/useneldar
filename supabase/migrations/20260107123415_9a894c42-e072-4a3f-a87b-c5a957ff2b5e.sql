-- Create student_data table for storing student risk levels and survey info
CREATE TABLE public.student_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  risk_level TEXT DEFAULT 'LOW',
  last_survey_date TIMESTAMP WITH TIME ZONE,
  grade INTEGER,
  class TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create survey_responses table
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  survey_id TEXT NOT NULL,
  survey_type TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  phq9_score INTEGER,
  gad7_score INTEGER,
  burnout_score INTEGER,
  overall_risk TEXT,
  ai_analysis JSONB,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table for AI chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  is_crisis BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table for psychologist notifications
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create psychologist_notes table
CREATE TABLE public.psychologist_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  psychologist_id UUID NOT NULL,
  student_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.student_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologist_notes ENABLE ROW LEVEL SECURITY;

-- student_data policies
CREATE POLICY "Users can view own student data"
  ON public.student_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own student data"
  ON public.student_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own student data"
  ON public.student_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Psychologists can view all student data"
  ON public.student_data FOR SELECT
  USING (has_role(auth.uid(), 'psychologist') OR has_role(auth.uid(), 'admin'));

-- survey_responses policies
CREATE POLICY "Users can view own survey responses"
  ON public.survey_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own survey responses"
  ON public.survey_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Psychologists can view all survey responses"
  ON public.survey_responses FOR SELECT
  USING (has_role(auth.uid(), 'psychologist') OR has_role(auth.uid(), 'admin'));

-- chat_messages policies
CREATE POLICY "Users can view own chat messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Psychologists can view crisis messages"
  ON public.chat_messages FOR SELECT
  USING ((has_role(auth.uid(), 'psychologist') OR has_role(auth.uid(), 'admin')) AND is_crisis = true);

-- alerts policies
CREATE POLICY "Psychologists can view alerts"
  ON public.alerts FOR SELECT
  USING (has_role(auth.uid(), 'psychologist') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Psychologists can update alerts"
  ON public.alerts FOR UPDATE
  USING (has_role(auth.uid(), 'psychologist') OR has_role(auth.uid(), 'admin'));

-- psychologist_notes policies
CREATE POLICY "Psychologists can view own notes"
  ON public.psychologist_notes FOR SELECT
  USING (auth.uid() = psychologist_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Psychologists can insert notes"
  ON public.psychologist_notes FOR INSERT
  WITH CHECK (auth.uid() = psychologist_id AND has_role(auth.uid(), 'psychologist'));

CREATE POLICY "Psychologists can update own notes"
  ON public.psychologist_notes FOR UPDATE
  USING (auth.uid() = psychologist_id);

-- Create trigger for student_data updated_at
CREATE TRIGGER update_student_data_updated_at
  BEFORE UPDATE ON public.student_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create student_data on new user
CREATE OR REPLACE FUNCTION public.handle_new_student_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.student_data (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created_student_data
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_student_data();