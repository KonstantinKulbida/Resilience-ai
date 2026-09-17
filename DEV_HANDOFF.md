# Resilience.ai Development Handoff

## Repository and deployment

- Local repository: `/Users/konstantin_me/Developer/Resilience-ai`
- Current branch: `main`
- GitHub: `KonstantinKulbida/Resilience-ai`
- Production: https://resilience-ai-eta.vercel.app
- Deployed baseline before the visual-polish release: `848d3de` (`docs: document assessment guidance fixes`)
- Previous deployed logic fix: `3428dbe` (`fix: stabilize assessment guidance and demo flow`)

GitHub `main` is the canonical deployed source. This file is the canonical development handoff between chats.

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

Create a dedicated corporate visual system and document it in `DESIGN_SYSTEM.md`. Treat that as a separate brand-system task: preserve the shipped shell geometry, questionnaire flow, result journey, assessment/model logic, API contracts, privacy rules, and People data unless that task explicitly expands scope.
