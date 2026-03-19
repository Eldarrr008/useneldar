
CREATE TABLE public.custom_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage custom surveys" ON public.custom_surveys
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view active custom surveys" ON public.custom_surveys
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE TRIGGER update_custom_surveys_updated_at
  BEFORE UPDATE ON public.custom_surveys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
