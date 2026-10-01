BEGIN;

ALTER TABLE alpha_participants
  ADD COLUMN IF NOT EXISTS first_opened_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS alpha_participants_org_opened_idx
  ON alpha_participants(org_unit_id, first_opened_at);

COMMIT;
