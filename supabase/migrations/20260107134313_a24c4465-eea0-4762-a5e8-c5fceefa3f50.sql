-- Add pss_score column to survey_responses for PSS-10
ALTER TABLE public.survey_responses
ADD COLUMN IF NOT EXISTS pss_score integer;