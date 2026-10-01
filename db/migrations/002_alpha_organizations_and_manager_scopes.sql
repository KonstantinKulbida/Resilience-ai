BEGIN;

CREATE TABLE IF NOT EXISTS alpha_organizations (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO alpha_organizations (slug, display_name, active)
VALUES ('pilot-company-01', 'Pilot Company 01', TRUE)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE alpha_org_units
  ADD COLUMN IF NOT EXISTS organization_id BIGINT;

UPDATE alpha_org_units
SET organization_id = (
  SELECT id
  FROM alpha_organizations
  WHERE slug = 'pilot-company-01'
)
WHERE organization_id IS NULL;

ALTER TABLE alpha_org_units
  ALTER COLUMN organization_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'alpha_org_units_organization_id_fkey'
  ) THEN
    ALTER TABLE alpha_org_units
      ADD CONSTRAINT alpha_org_units_organization_id_fkey
      FOREIGN KEY (organization_id)
      REFERENCES alpha_organizations(id);
  END IF;
END
$$;

ALTER TABLE alpha_org_units
  DROP CONSTRAINT IF EXISTS alpha_org_units_slug_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'alpha_org_units_organization_slug_key'
  ) THEN
    ALTER TABLE alpha_org_units
      ADD CONSTRAINT alpha_org_units_organization_slug_key
      UNIQUE (organization_id, slug);
  END IF;
END
$$;

ALTER TABLE alpha_manager_access
  ADD COLUMN IF NOT EXISTS organization_id BIGINT;

UPDATE alpha_manager_access ma
SET organization_id = ou.organization_id
FROM alpha_org_units ou
WHERE ma.org_unit_id = ou.id
  AND ma.organization_id IS NULL;

UPDATE alpha_manager_access
SET organization_id = (
  SELECT id
  FROM alpha_organizations
  WHERE slug = 'pilot-company-01'
)
WHERE organization_id IS NULL;

ALTER TABLE alpha_manager_access
  ALTER COLUMN organization_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'alpha_manager_access_organization_id_fkey'
  ) THEN
    ALTER TABLE alpha_manager_access
      ADD CONSTRAINT alpha_manager_access_organization_id_fkey
      FOREIGN KEY (organization_id)
      REFERENCES alpha_organizations(id);
  END IF;
END
$$;

ALTER TABLE alpha_manager_access
  DROP CONSTRAINT IF EXISTS alpha_manager_access_check;

ALTER TABLE alpha_manager_access
  ADD CONSTRAINT alpha_manager_access_scope_check CHECK (
    (role = 'department_manager' AND org_unit_id IS NOT NULL)
    OR
    (role = 'org_admin' AND org_unit_id IS NULL)
  );

CREATE INDEX IF NOT EXISTS alpha_org_units_organization_idx
  ON alpha_org_units(organization_id);

CREATE INDEX IF NOT EXISTS alpha_manager_access_organization_idx
  ON alpha_manager_access(organization_id);

COMMIT;
