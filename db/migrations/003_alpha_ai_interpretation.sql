BEGIN;

ALTER TABLE alpha_assessments
  ADD COLUMN IF NOT EXISTS ai_insight_en TEXT;

ALTER TABLE alpha_assessments
  ADD COLUMN IF NOT EXISTS ai_insight_ru TEXT;

COMMIT;
