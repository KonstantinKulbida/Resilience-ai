# Release notes

## 2026-10-01 — Expanded Gemini guidance

Employee result guidance was deepened after the original two-sentence interpretation proved too generic.

### Richer interpretation

- Pressure-mode Gemini insight is now 4–6 concise sentences instead of a maximum of two.
- It must ground the interpretation in at least two concrete questionnaire signals.
- It should explain the likely pattern connecting those signals rather than merely restating the weakest factor.
- A relatively stronger factor can be used as a practical resource or contrast.
- Numeric scores are not repeated in prose unless necessary because the user already sees them.
- Work-context mechanisms such as incoming work, sprint commitments, meetings, or deadlines must be framed as hypotheses to test, not facts inferred from the assessment.

### Richer actions

- The three curated actions remain constrained by the product recommendation catalog.
- Gemini now adds a short personalized rationale under each action:
  - why this action fits the current response pattern;
  - what useful signal to watch after trying it;
  - what work constraint the action is intended to test or surface.
- Gemini still cannot invent action IDs or replace the deterministic scoring model.

### Reliability

- Primary model: Gemini 3.8 Flash.
- Transient capacity errors are retried.
- If 3.8 Flash remains unavailable, the assessment falls back to Gemini 3.5 Flash before falling back to deterministic copy.
- A live production diagnostic confirmed an AI-enhanced result with expanded insight and rationales for all three actions.
- Temporary diagnostic endpoints were removed after verification.

---

## 2026-10-01 — Buyer-focused landing page

The public start page was refocused around the primary B2B audience: HR / People leaders, business leaders, buyers, pilot sponsors, and evaluators.

### Value proposition

- The hero now explains the product in buyer terms rather than presenting Employee and People modes as equal destinations.
- New framing: understand where teams are losing resilience, what is creating pressure, what intervention to try, and what changed after a re-check.
- Employee privacy and aggregate-only People analytics remain explicit.

### Primary and secondary journeys

- Primary CTA: `View People analytics` / `Посмотреть People-аналитику`.
- Secondary CTA: `Try the employee check-in` / `Пройти тест как сотрудник`.
- The employee sandbox remains available as a product demo, but it is no longer the dominant story on the landing page.

### How-it-works flow

The previous two-mode explainer was replaced with a compact operating loop:

1. private employee check-in;
2. department-level aggregate after the privacy threshold;
3. one primary issue and one management intervention;
4. re-check after 10–14 days to observe the descriptive change.

The right-hand card now follows content height instead of stretching to match the hero, removing the large empty area.

---

## 2026-10-01 — Demo sandbox separation and locale detection

This follow-up corrects two demo behaviors without changing assessment scoring, recommendation logic, or People data.

### Sandbox separation

- The public employee sandbox remains available at `/employee/assessment` without an invite link.
- Employees can still complete and retake the sandbox assessment.
- The post-assessment transition from the employee sandbox into the People / HR dashboard has been removed.
- The People dashboard remains accessible only from the demo start screen as a separate role choice.

### Language behavior

- The demo home is now fully bilingual EN / RU.
- Initial language follows the browser / operating-system locale (`ru*` → Russian, otherwise English).
- The previous demo-login behavior that forced English has been removed.
- A manual language choice remains available and persists across reloads.
- The language preference storage key was versioned so old values created by the former forced-English flow do not override the new system-language detection.

### Deployment validation

- Production `main` deployed successfully on Vercel.
- Production bundle contains browser locale detection and the Russian home copy.
- The production bundle no longer contains the post-assessment `View the aggregated People demo` transition.
- The start-screen `View the People dashboard` entry remains available.

---

## 2026-09-17 — Mobile assessment step-scroll fix

This follow-up fixes a production mobile regression in the four-step assessment. Moving forward or backward between steps now scrolls to the assessment heading and step progress instead of leaving the viewport near the bottom of the card.

The assessment scroll helper now detects the actual scroll owner: the document viewport on mobile and the fixed-height application `<main>` container on desktop. Answer persistence, Back / Continue behavior, missing-answer focus, result-stage scrolling, scoring, copy, layout, and API behavior are unchanged.

Validated locally at 390 px for steps 1 → 2 → 3 → 4 and Back 4 → 3, including preserved selections and missing-answer validation. The desktop assessment and result transition were also checked for regressions.

---

## 2026-09-17 — Core investor journey visual polish

This release makes the core Resilience.ai demo more focused, operational, and presentation-ready without changing assessment scoring, guidance logic, API contracts, or People data.

### Unified product shell

- Removed the old sidebar from the core demo journey.
- Introduced one shared Employee / People shell while preserving the existing routes and staged journey.
- Kept direct access to the demo home, language control, and role-specific context in a consistent header.

### Guided assessment

- Redesigned the 12-question assessment as four steps with three questions per step.
- Replaced visible numeric 1–5 choices with bilingual semantic answer labels while preserving the same internal numeric values.
- Changed the progress indicator to reflect answered questions across all 12 responses.
- Added per-question missing-answer validation, focus and warning treatment without clearing existing answers.
- Preserved answers when moving Back and Continue between steps.
- Added a dedicated result-processing screen that starts the real analysis request immediately and appears before the result without fake numeric progress.

### Neutral enterprise visual treatment

- Replaced the pastel / rainbow background with a restrained cool-neutral foundation.
- Applied consistent translucent neutral surfaces, subtle borders, restrained shadows, and solid-indigo emphasis across the demo home and employee journey.
- Unified the visual treatment of Team Sustainability, Participation, factor, primary issue, intervention, and outcome cards in the People dashboard.
- Preserved emerald, sky, amber, and rose exclusively for meaningful status communication.
- Reworked the Employee-to-People transition as a premium neutral glass surface.
- Validated the core journey on desktop and at 390 px mobile width.

### Deferred follow-up

A dedicated corporate visual-system and brand pass is intentionally deferred to a separate follow-up task. That work should define and document the long-term system in `DESIGN_SYSTEM.md` rather than expanding the scope of this release.

---

## 2026-09-17 — Assessment guidance and demo-flow fixes

This release fixes assessment interpretation edge cases and stabilizes the staged employee-to-People demo journey.

### Assessment guidance

The deterministic scoring model itself is unchanged.

Fixed an interpretation bug where the system could assign a `MAIN PRESSURE POINT` even when all factors were healthy or perfect.

Assessment guidance now has four explicit modes:

- `Perfect` — all three factors are at 100; no problem is invented and recommendations focus on maintaining what is already working.
- `Protect` — the weakest factor is still in the Green zone; it is shown as `AREA TO PROTECT` with preventive actions.
- `Watch` — the weakest factor is Stable; it is shown as `AREA TO WATCH` with light corrective actions.
- `Pressure` — the weakest factor is in Needs attention or At risk; it is shown as `MAIN PRESSURE POINT` with intervention and support actions.

This prevents healthy profiles from receiving unnecessarily alarming recommendations.

Validated scenarios included:

- perfect profile: `100 / 100 / 100`
- green weakest factor: `88 / 100 / 100`
- stable weakest factor: `75 / 100 / 100`
- at-risk workload profile

### Recommendations

Recommendations now match the actual state of the weakest factor:

- healthy profiles receive maintenance / protection guidance;
- stable profiles receive monitoring and early-adjustment guidance;
- pressure profiles continue to receive intervention-oriented actions;
- Gemini personalization is bypassed for non-pressure profiles so it cannot invent a problem that deterministic scoring does not support.

### Employee result journey

The staged result experience was updated to:

`Result → Drivers → Personalized insight → Actions → Privacy → People demo`

Changes include:

- more predictable staged scrolling;
- route changes reset the application scroll position;
- People dashboard now opens from the top instead of inheriting the employee-result scroll position;
- Privacy and the People demo transition are now revealed as a separate final step;
- added a dedicated `Continue` action after recommendations so the final demo transition no longer appears partially cut off below the viewport.

### Validation

The following were verified locally:

- Perfect guidance
- Protect guidance
- Watch guidance
- Pressure guidance
- staged employee result flow
- Employee → People transition
- People dashboard opens at the top
- `npx tsc --noEmit`
- `npm run build`

---

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
