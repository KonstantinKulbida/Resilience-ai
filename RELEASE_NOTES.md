# Release notes

## 2026-09-17 — Buyer / investor demo journey

This release turns the existing prototype shell into a guided buyer/investor demo path without changing the underlying product model.

### Demo home

- Replaced the previous pseudo-login landing screen with an English-first demo home.
- Added two direct entry points:
  - `Take the 3-minute assessment` → `/employee/assessment`
  - `View the People dashboard` → `/hr/dashboard`
- Added clear synthetic-demo disclosure for the People view.
- Starting either core demo path from Home now switches the journey to English for a consistent demo experience.

### Employee demo path

The core employee journey is now intentionally focused on:

`Assessment → Result → Drivers → Personalized insight → Recommended actions`

- Removed secondary product destinations from the main demo navigation without deleting the underlying routes or code.
- Employee navigation now foregrounds only the assessment path.
- Updated the shell copy to `Employee demo` / `Private assessment experience`.
- Replaced logout semantics with `Back to demo home`.
- Kept the result flow progressive so the viewer sees the score first, then drivers, insight and actions.

### Employee → People demo transition

After the full employee result journey is expanded, the demo now shows a clearly separated transition card:

`Continue the demo → View the aggregated People demo`

The transition is explicitly labeled as demo-only and states that employees do not have access to the People dashboard.

This keeps the product model credible while still allowing a buyer or investor to continue directly into the aggregate People view.

### People demo path

- The People route opens directly on `/hr/dashboard`.
- Main demo navigation now foregrounds only `Overview`.
- `Team` and `Reports` remain in the codebase but are hidden from the buyer/investor core journey.
- `Back to demo home` replaces sign-out semantics.
- The core dashboard continues to foreground Team Sustainability, its three drivers, the primary issue, intervention, owner, re-check and outcome loop.

### Mobile and validation

The complete demo journey was checked at 390 px width:

- Home
- Employee assessment and result flow
- Recommendations and privacy sections
- Demo transition card
- People dashboard
- Mobile navigation

Validation completed successfully:

- `npm run build`
- `npx tsc --noEmit`
- VS Code diagnostics: 0 problems
- Production smoke-test on Vercel
- Full production path verified:

`/ → assessment → result → full recommendations → aggregated People demo → /hr/dashboard → demo home`

### Development environment

Added React TypeScript declaration packages for clean editor/type-check support:

- `@types/react`
- `@types/react-dom`

### Commit

- `f156157` — polished buyer demo journey

---

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
