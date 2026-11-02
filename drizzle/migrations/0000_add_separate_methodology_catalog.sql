CREATE TABLE public.methodology_catalog (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 code text NOT NULL UNIQUE,
 title text NOT NULL,
 category text NOT NULL,
 source_url text,
 review_notes text NOT NULL DEFAULT '',
 evidence_notes text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'draft' CHECK (status = 'draft'),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.methodology_catalog TO authenticated;
GRANT ALL ON public.methodology_catalog TO service_role;
ALTER TABLE public.methodology_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read methodology drafts" ON public.methodology_catalog FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins create methodology drafts" ON public.methodology_catalog FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins edit methodology drafts" ON public.methodology_catalog FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
COMMENT ON TABLE public.methodology_catalog IS 'Separate draft-only candidate catalog. Not a validated questionnaire bank or runnable pupil survey. Existing surveys and responses are unchanged.';