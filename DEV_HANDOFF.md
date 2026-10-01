# Resilience.ai Development Handoff

## 2026-10-01 Alpha cloud state — canonical for `alpha-v0-cloud`

- Working Alpha branch: `alpha-v0-cloud`; keep `main` untouched until explicit acceptance/merge.
- Vercel preview alias: `https://resilience-ai-git-alpha-v0-cloud-montenyou-4106.vercel.app`.
- Production demo on `main` remains separate.
- Neon project `cold-field-19715020`, main branch `br-snowy-credit-b2daavmq`, database `neondb`.
- Real Alpha hierarchy is now `Organization → Department → Participant → Assessment`.
- Initial organization: `pilot-company-01` / `Pilot Company 01`.
- Active real employee invite batch: 20 links total, 10 Development + 10 Sales.
- Manager roles:
  - `department_manager`: one department only, aggregate only.
  - `org_admin`: all eligible department aggregates inside one organization.
- Manager route: `/alpha/manager#<secret-token>`.
- Privacy threshold is enforced server-side at n >= 5 for scores and factor aggregates.
- Manager view now exposes rollout progress before aggregate unlock: active links issued, valid links opened, completed baselines, and progress to n=5. Scores remain suppressed below n=5.
- No individual employee rows, raw answers, individual scores, participant IDs, or tokens are returned to manager views.
- Employee Alpha uses deterministic server-side scoring. Gemini is only a constrained qualitative interpretation layer; it cannot change score/status or invent actions. Gemini has deterministic fallback.
- Employee sandbox remains at `/employee/assessment`, requires no invite, and writes no Alpha data.
- Employee sandbox no longer links to the People/HR dashboard after completion; People demo access remains on the start screen.
- Release notes: `RELEASE_NOTES_ALPHA_2026-10-01.md`.
- Latest live acceptance diagnostic passed employee baseline, Gemini interpretation, department-manager scope, org-admin scope, and n<5 suppression. Diagnostic endpoint and test rows were removed afterward.


## Repository and deployment

- Local repository: `/Users/konstantin_me/Developer/Resilience-ai`
- Current branch: `main`
- GitHub: `KonstantinKulbida/Resilience-ai`
- Production: https://resilience-ai-eta.vercel.app
- Latest deployed commit: `71575d7` (`feat: polish core investor journey`)
- Previous deployed logic fix: `3428dbe` (`fix: stabilize assessment guidance and demo flow`)

GitHub `main` is the canonical deployed source. This file is the canonical development handoff between chats.

## Current uncommitted fix

- Fixed the production mobile assessment regression where moving between questionnaire steps left the viewport near the bottom of the card.
- `scrollToSection` now uses the document viewport when mobile `<main>` expands with its content, while retaining the existing fixed-height `<main>` scroll behavior on desktop.
- Back / Continue behavior, answers, missing-answer focus, result-stage scrolling, scoring, copy, layout, API behavior, and People screens are unchanged.
- Validated at 390 px for steps 1 → 2 → 3 → 4 and Back 4 → 3, including answer persistence and missing-answer validation; desktop assessment and result scrolling were also verified.
- This fix is not committed or pushed yet.

## Current shipped state

- The old sidebar has been replaced by one shared Employee/People shell. Its geometry, navigation, and behavior are accepted.
- The assessment is four steps of three questions with semantic answer labels, answer-count progress, missing-answer validation, answer-preserving navigation, and a real-request-backed processing state.
- The demo home, employee journey, Employee-to-People transition, and People dashboard use the accepted neutral enterprise glass treatment.
- Preserve the current `App.tsx` structure and shell geometry unless a future task explicitly asks to revise them.
- Local safety backups remain excluded through `.git/info/exclude` and are not part of the repository:
  - `.resilience-codex-backup/App.before-codex.tsx`
  - `.resilience-codex-backup/App.before-codex.patch`
- Do not reset, stash, checkout, restore, commit, or push the current work without explicit approval.

## Completed milestones

- Work Sustainability assessment implemented with 12 questions and three weighted factors:
  - Workload balance: 40%
  - Recovery: 40%
  - Control & clarity: 20%
- Score bands implemented:
  - 80–100: Green
  - 65–79: Stable
  - 45–64: Needs attention
  - 0–44: At risk
- Guidance modes implemented and validated: Perfect, Protect, Watch, and Pressure.
- Healthy profiles are not framed as having a pressure problem.
- Employee journey implemented: Result → Drivers → Personalized insight → Actions → Privacy → People demo.
- People dashboard implemented: Team Sustainability → drivers → primary issue → intervention → owner → re-check → outcome.
- Employee individual data remains private; the People experience uses aggregated synthetic demo data with a minimum of five responses.
- Logic bug pass completed and production smoke-tested.

## Completed visual-polish release

1. Removed the old sidebar and introduced one shared Employee/People shell.
2. Changed the assessment presentation from 12 questions on one screen to four steps of three questions, with answer-count progress, per-question missing-answer feedback, and answer-preserving Back/Continue navigation.
3. Replaced visible numeric 1–5 choices with bilingual semantic answer labels while preserving internal 1–5 scoring.
4. Added a real-request-backed result-processing screen with an approximately 800 ms minimum display, lightweight factor indicators, and no fake numeric progress.
5. Replaced the pastel/rainbow wellbeing aesthetic across the core investor journey with neutral enterprise glass, restrained solid-indigo actions and progress, consistent neutral People cards, and a premium neutral Employee-to-People transition.
6. Validated the complete treatment on desktop and at 390 px across demo home, assessment, processing, employee result, transition, and People dashboard.
7. Documented the release in `RELEASE_NOTES.md` and published it to `main` after validation.

## Validation protocol

After each implementation task, run:

```bash
npx tsc --noEmit
npm run build
git diff --check
```

Also summarize all changed files and the result of each validation command. For visual work, validate both desktop and a 390 px mobile viewport before release.

## Do not change

- Do not overwrite or discard any existing uncommitted changes.
- Do not alter the current `App.tsx` visual-polish work unless explicitly asked.
- Do not modify assessment scoring, weighting, score bands, guidance-mode logic, or other model logic unless explicitly asked.
- Do not weaken the rule that healthy profiles must never be described as having a pressure problem.
- Do not expose employee-level private data; People views must remain aggregated synthetic demo data with a minimum of five responses.
- Do not reset, stash, checkout, restore, commit, or push unless explicitly authorized.
- Prefer minimal, targeted changes over rewrites.
- Before implementation, inspect `git status`, inspect the relevant files, and explain the planned change.

## Next implementation step

After the mobile assessment scroll fix is reviewed, commit, push, and production-smoke-test it only with explicit approval. Then create a dedicated corporate visual system and document it in `DESIGN_SYSTEM.md`. Treat that as a separate brand-system task: preserve the shipped shell geometry, questionnaire flow, result journey, assessment/model logic, API contracts, privacy rules, and People data unless that task explicitly expands scope.
