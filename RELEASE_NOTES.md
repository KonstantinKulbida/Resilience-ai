# Release notes

## 2026-09-16 — Work Sustainability model + HR decision loop

This release rebuilds the core employee assessment and connects it to a new HR decision loop.

### Employee assessment

- Replaced the old burnout-oriented model with a 12-question Work Sustainability assessment.
- New factors:
  - Workload balance
  - Recovery
  - Control & clarity
- Deterministic scoring:
  - Workload balance: 40%
  - Recovery: 40%
  - Control & clarity: 20%
- Status bands:
  - 80–100 — Green zone
  - 65–79 — Stable
  - 45–64 — Needs attention
  - 0–44 — At risk
- Primary pressure factor is selected by weighted impact on the overall score.
- Gemini does not calculate scores; it only generates qualitative interpretation and selects allowed next-step actions.
- Production API and fallback flows were tested end-to-end.

### HR decision loop

Replaced the previous generic stress/productivity dashboard with:

Team Sustainability → 3 drivers → primary issue → recommended intervention → owner → re-check → outcome

The HR view now includes:

- Team Sustainability
- Workload balance / Recovery / Control & clarity
- participation rate
- minimum 5-response privacy threshold
- deterministic primary issue
- recommended intervention
- intervention owner
- 7–14 day re-check
- before/after outcome

HR data and outcomes in the public demo are synthetic and do not represent measured customer impact.

### UX / validation

- English-first core path reviewed
- Desktop flow tested
- Mobile HR flow tested at 390 px
- Employee assessment tested on production
- HR decision loop smoke-tested on production

### Commits

- `79a1822` — Work Sustainability assessment model
- `7c49126` — HR sustainability decision loop
