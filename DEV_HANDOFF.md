# Resilience.ai Development Handoff

## 2026-10-01 Alpha cloud state — canonical for `alpha-v0-cloud`

- Working Alpha branch: `alpha-v0-cloud`; do not merge Alpha implementation into `main` without a separate product decision.
- Production demo: https://resilience-ai-eta.vercel.app
- Alpha preview alias: https://resilience-ai-git-alpha-v0-cloud-montenyou-4106.vercel.app
- GitHub: `KonstantinKulbida/Resilience-ai`
- Neon project: `cold-field-19715020`; branch `br-snowy-credit-b2daavmq`; database `neondb`.
- Real Alpha hierarchy: `Organization → Department / org_unit → Participant → Assessment`.
- Initial organization: `pilot-company-01` / `Pilot Company 01`.
- Active real employee invite batch: 20 links total, 10 Development + 10 Sales.
- Employee route: `/alpha#<secret-token>`.
- Manager route: `/alpha/manager#<secret-token>`.
- Manager roles:
  - `department_manager`: aggregate data for one department only.
  - `org_admin`: eligible department aggregates for the assigned company.
- Privacy threshold is enforced server-side at n >= 5 completed baseline responses.
- Below n=5 managers may see rollout counts (links issued, valid links opened, completed baselines, progress to threshold), but not scores, factors, identities, raw answers, participant IDs, or invite tokens.
- Employee Alpha uses deterministic server-side scoring as source of truth. Gemini is a constrained qualitative layer and cannot change score/status or invent actions.
- Gemini guidance is expanded to a 4–6 sentence evidence-bound interpretation plus rationale for each curated action; 3.8 Flash retries and falls back to 3.5 Flash, then deterministic copy.
- Employee sandbox remains at `/employee/assessment`, requires no invite, supports retake, and writes no Alpha data.
- People demo access is only from the start page; the employee result does not transition into the HR/People dashboard.

## Current source state

Latest UI source commits before this docs-only handoff refresh:

- `main`: `2537d9649dd38bd742b0319f0e6cdb85121204b6` — `chore(result): publish final UI polish`
- `alpha-v0-cloud`: `46bc346834787ebc044c07b4ce8f93840000f3fb` — `chore(result): publish final UI polish`

The shared result component is synchronized between branches: `components/AssessmentViewV1.tsx` has the same blob SHA (`e58e52dac41ac87eb39e4e5b0c5c510fb45ab2bd`) on `main` and `alpha-v0-cloud`.

The buyer landing component is also synchronized between branches: `components/LoginPage.tsx` has the same blob SHA (`e1edbf4b600b96474781207bd710979511f2d042`).

## Result UI cleanup now present in source

- Result flow is four stages only:
  1. overall result;
  2. factors;
  3. personalized insight;
  4. recommendations.
- There is no fifth privacy stage and no final reveal button used only to reach privacy.
- All staged reveal controls use the same `RESULT_REVEAL_BUTTON_CLASS`: full-width on mobile, fixed width on `sm+`, same minimum height, padding, typography, indigo treatment, and down-arrow.
- Reveal controls are placed in right-aligned rows on desktop.
- Russian result copy no longer shows the visible English label “Work Sustainability”; the factor explainer uses “общий показатель устойчивости рабочего режима”.
- Factor cards use equal-height flex layout, compact “Главный фактор” marking, nowrap status chips, and bottom-aligned descriptions.
- Recommendation cards are equal-height and use distinct icons for Today / This week / support/protect/watch.
- Every recommendation card always includes “Почему это подходит сейчас” / “Why this fits now”; if Gemini rationale is absent, deterministic contextual rationale is rendered.
- Privacy is a compact inline block after recommendations with an expandable “Политика конфиденциальности” / “Privacy policy” disclosure.
- The buyer landing page uses the compact desktop/mobile layout and buyer-first CTA hierarchy documented in `RELEASE_NOTES.md`.

## Deployment status — objective blocker

The latest source commits are not live yet because Vercel rejected both head builds with the account-level status:

`build-rate-limit`

GitHub/Vercel status was checked directly for both latest UI commits and reports `failure` pointing to the Vercel build-rate-limit upgrade page.

Latest READY deployments currently serving the aliases:

- Production `main`: `e528c3e98219d9d8196b2f9bc51287f8c2abf204` — `refactor(result): unify staged controls and result flow`
- Alpha preview: `3c34b968bd42c73a62244e682f8171e50b68e655` — `refactor(result): unify staged controls and result flow`

Live bundle inspection confirms those aliases are still on the older result UI: the final UI marker `data-result-ui="2026-10-01-polish"` is absent, and the older standalone privacy-stage copy is still present.

The available Vercel deployment-write connector is currently unavailable server-side (`deploy_to_vercel not found`), so there is no authenticated manual redeploy path from this chat while the Git integration is rate-limited.

## Runtime status of currently live deployments

- Production and Alpha aliases return HTTP 200.
- Production runtime logs for the last hour show successful 200 responses and no 5xx response group.
- A Gemini 503/high-demand error was logged for assessment personalization; this is the transient condition covered by the implemented retry / 3.5 Flash / deterministic fallback chain.

## Validation status

Source-level verification completed against GitHub for the latest heads:

- result-flow stages and reveal-button layout;
- Russian terminology;
- factor-card structure;
- personalized-insight CTA alignment;
- expanded recommendation cards and fallback rationale;
- compact privacy disclosure;
- synchronized shared UI files across `main` and `alpha-v0-cloud`;
- compact buyer landing source on both branches.

A fresh local `npm run build` / `npx tsc --noEmit` could not be executed from this chat runtime because the container has no network access to clone the GitHub repository. Do not record those checks as passed for the latest heads until they are actually run in an environment with repository access.

Live visual acceptance of the final UI at desktop and ~390 px is still pending because the final source commits have not reached Vercel.

## Release notes

- Public/demo release notes: `RELEASE_NOTES.md`
- Alpha release notes: `RELEASE_NOTES_ALPHA_2026-10-01.md`

Both already document the 2026-10-01 result UI cleanup, richer recommendation rationale, privacy simplification, and landing-page compaction.

## Do not change

- Do not modify the locked assessment scoring model, weights, reverse items, status bands, or primary-factor rule without a separate product decision.
- Do not let Gemini recalculate scores/statuses or invent action IDs.
- Do not expose individual employee data in manager views.
- Do not weaken the n >= 5 privacy threshold.
- Do not merge Alpha implementation into `main` without a separate decision.
- Prefer targeted changes over rewrites.

## Next step

First re-check Vercel build availability. When a new build is accepted:

1. deploy the current `main` and `alpha-v0-cloud` heads;
2. confirm both deployments reach READY;
3. verify production and Alpha live bundles contain `data-result-ui="2026-10-01-polish"`;
4. run desktop and ~390 px visual acceptance for landing, result reveal buttons, factor cards, Russian copy, personalized insight, expanded recommendations, icons, and compact privacy disclosure;
5. scan runtime/build errors and update this handoff only with verified live facts.

No additional product/UI code change is currently identified from source inspection; the remaining blocker is deployment availability.
