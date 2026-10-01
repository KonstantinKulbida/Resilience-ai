BEGIN;

ALTER TABLE alpha_assessments
  ADD COLUMN IF NOT EXISTS ai_action_rationales_en JSONB;

ALTER TABLE alpha_assessments
  ADD COLUMN IF NOT EXISTS ai_action_rationales_ru JSONB;

COMMIT;
