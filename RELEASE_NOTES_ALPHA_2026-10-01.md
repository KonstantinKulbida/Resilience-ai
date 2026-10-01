# Resilience Alpha release notes — 2026-10-01

## Release scope

This release is the first real internal Alpha baseline flow on the isolated `alpha-v0-cloud` branch. The existing public investor/demo production on `main` remains unchanged.

## Employee Alpha

- Real anonymous participant links use `/alpha#<secret-token>`.
- Participant tokens are 256-bit random secrets; only SHA-256 hashes are stored in Postgres.
- Each participant is preassigned to a company and department. Employees never select their own department.
- The 12-question Work Sustainability assessment uses server-side deterministic scoring.
- One participant can submit one `baseline` assessment; duplicate submits return the existing result instead of creating another baseline row.
- Results are persisted and reopen from the same invite link.
- Feedback is persisted one row per assessment and retries update the existing row.
- EN/RU locale behavior is preserved.

## Organization tenancy

- Added `alpha_organizations`.
- Hierarchy is now:
  `Organization → Department (org_unit) → Participant → Assessment`.
- Department slugs are unique inside an organization rather than globally.
- The current real Alpha cohort belongs to `pilot-company-01` (`Pilot Company 01`).
- Existing Development and Sales participants were attached to this company without changing their invite links.
- Future companies can have their own Development, Sales, or other departments without mixing aggregates.

## Manager rollout progress

Before department scores are available, manager views now show non-result operational progress so the pilot does not look stalled:

- active invite links issued;
- participants who opened a valid Alpha link;
- completed baseline assessments;
- progress toward the 5-response privacy threshold.

These counts are aggregate operational metadata only. Individual identities, raw answers, individual scores, and invite tokens remain hidden. Department scores and factor aggregates still unlock only at n >= 5.

## Manager access and privacy

Two manager roles are available through secret manager links:

- `department_manager`: sees aggregate results for one assigned department only.
- `org_admin`: company-level manager / super-manager; sees eligible department aggregates across the assigned company.

Privacy rules:

- Manager links never expose employee identity, participant IDs, token hashes, invite tokens, raw answers, or individual scores.
- A department result is exposed only after at least 5 completed baseline responses.
- Below the threshold, the manager view shows only an insufficient-data state and does not expose the exact response count.
- No company-wide rollup combines hidden/suppressed departments.

Manager route: `/alpha/manager#<secret-manager-token>`.

## Gemini interpretation

- Deterministic scoring remains authoritative and unchanged.
- Gemini is now an interpretation layer for real Alpha employee results.
- Gemini receives already-calculated scores, factor scores, weakest factor/signals, and work context.
- It returns a short bilingual qualitative interpretation only.
- It cannot change score/status, diagnose a condition, invent numbers, or invent actions.
- Recommendations remain selected from the curated deterministic Alpha recommendation library.
- EN/RU interpretations are generated in one server-side call and stored with the assessment.
- Transient Gemini 503/high-demand errors are retried automatically.
- If Gemini is still unavailable, Alpha returns the deterministic fallback interpretation and the assessment remains usable.

## Sandbox / public demo

- The free employee sandbox remains available at `/employee/assessment` without an invite token.
- Sandbox assessments continue to use the demo flow and do not write to Alpha tables.
- The sandbox still supports retaking the assessment.
- The post-assessment link from the employee sandbox into the People/HR dashboard was removed.
- The synthetic People/HR demo remains accessible from the start screen as a separate demo role.

## Deployment and infrastructure

- Preview branch: `alpha-v0-cloud`.
- Vercel preview is public for external Alpha participants.
- Neon is the persistent Alpha database.
- The Alpha implementation remains isolated from `main` and has not been merged. Separately, `main` received the requested sandbox/i18n corrections: no employee-to-People post-assessment link, bilingual home, and browser/OS locale detection.

## Acceptance checks completed

Live Vercel + Neon checks passed for:

- employee baseline submission;
- server-side deterministic scoring;
- Gemini interpretation;
- persisted result;
- duplicate-baseline protection;
- feedback persistence;
- reopen/resume;
- department-manager scope;
- org-admin scope;
- privacy suppression below n=5;
- public Alpha page;
- sandbox route availability.

Temporary diagnostic endpoints and rows were removed after acceptance.

## Current access pack

- 20 employee invites: 10 Development + 10 Sales, all assigned to `pilot-company-01`.
- 3 manager links: Development department manager, Sales department manager, and company org admin.

## Deferred from this release

- manager expectation / intervention / owner / recheck editing flow;
- recheck wave for employees;
- matched baseline-vs-recheck descriptive delta;
- production auth/SSO;
- billing;
- HRIS integration;
- production merge.
