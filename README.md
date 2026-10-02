# Resilience.ai

**AI-enabled B2B HRTech prototype for work sustainability and workforce resilience.**

**Live demo:** https://resilience-ai-eta.vercel.app

**Release notes:** [RELEASE_NOTES.md](RELEASE_NOTES.md)

Resilience.ai turns a short private employee assessment into two connected outputs:

**Employee:** a clear explanation of the current work-sustainability pattern and practical next steps.

**People / management:** privacy-safe team signals that help identify the primary pressure point, choose an intervention, and re-check what changed.

The repository contains two deliberately separated product surfaces:

- **main** — public portfolio / buyer demo. The People data is synthetic.
- **alpha-v0-cloud** — real Alpha flow with anonymous invite tokens, Neon Postgres persistence, department scoping, manager access, and privacy-threshold enforcement.

> **Product note:** the assessment is a custom, non-clinical Work Sustainability check. It is not a medical diagnostic tool.

## Current product flows

### Employee demo

The core public path is:

**12-question assessment → result → three factors → personalized insight → three actions → privacy**

- Four assessment steps, three questions each.
- Three factors: **Workload balance, Recovery, Control & clarity**.
- Deterministic 0–100 scoring with fixed **40 / 40 / 20** weights.
- Progressive result reveal instead of a single dense dashboard.
- Pressure-mode personalization grounded in the employee's actual response pattern.
- Three practical action slots: **Today, This week, Get support**.
- A slow-response state explains when personalization is taking longer than usual instead of forcing an early short fallback.
- If generative AI remains unavailable, the product returns a richer deterministic insight and action guidance rather than failing the assessment.

### People demo

The public People view demonstrates the management decision loop with synthetic team data:

**Team Sustainability → 3 drivers → primary issue → intervention → owner → re-check → outcome**

It includes:

- privacy-safe aggregate Team Sustainability;
- Workload balance / Recovery / Control & clarity drivers;
- participation and a minimum 5-response privacy threshold;
- deterministic primary issue;
- recommended intervention and owner;
- 10–14 day re-check framing;
- before / after descriptive outcome.

Synthetic outcomes illustrate the product loop only. They are not evidence of causal impact.

### Real Alpha

The Alpha branch is intentionally isolated from the public demo.

Employee route:

~~~text
/alpha#<secret-token>
~~~

Manager route:

~~~text
/alpha/manager#<secret-token>
~~~

Current Alpha behavior:

- one anonymous participant per secret token;
- department is embedded in the invite and cannot be selected by the employee;
- one baseline assessment per participant;
- saved result can be reopened with the same token;
- feedback persists;
- Neon stores token hashes rather than plaintext invite tokens;
- department managers see only their department;
- org admins see eligible aggregates across their company;
- individual identities, raw answers, individual scores, participant IDs, and invite tokens are never shown to managers;
- aggregate factor scores unlock only after **5+ completed baseline responses** in that department;
- before the threshold, managers see only rollout counts: issued → opened → completed.

The real Alpha re-check loop is the next product stage; the public People demo already illustrates what that loop is intended to become.

## UI

The interface is under active product iteration. The live demo is the current visual source of truth:

**https://resilience-ai-eta.vercel.app**

The older pastel / “marshmallow” screenshots were removed from this README so the repository does not present an obsolete version of the product.

## AI design

The core assessment deliberately separates **deterministic product logic** from **generative personalization**.

~~~mermaid
flowchart LR
    A[React / Vite frontend] --> B[Vercel /api/assessment]
    B --> C[Validate 12 answers]
    C --> D[Deterministic scoring]
    D --> E{Guidance mode}

    E -->|Perfect / Protect / Watch| F[Deterministic insight + curated actions]
    E -->|Pressure| G[Gemini 3.8 Flash]

    G -->|Transient retry / model fallback| H[Gemini 3.5 Flash]
    G --> I[Validate structured output + allowed action IDs]
    H --> I

    H -. unavailable .-> F
    I --> J[Personalized insight + curated actions]

    F --> K[Result]
    J --> K
    K --> A
~~~

### Why this split matters

The LLM is **not used as a calculator**.

Assessment scores, factor scores, status bands, and the primary pressure factor are calculated by fixed rules first. Gemini receives the already-calculated result and can only add qualitative interpretation and choose from allowed curated action IDs.

The assessment API validates the structured AI response before using it. If the model is unavailable or returns an invalid payload, deterministic scoring remains authoritative and the result still completes with deterministic guidance.

Non-pressure states do not need generative AI at all: **Perfect, Protect, and Watch** use deterministic guidance directly. Gemini personalization is reserved for **Pressure** states, where additional interpretation is most useful.

## Assessment logic

The 12-item Work Sustainability assessment measures three factors on a 0–100 scale:

- **Workload balance** — 4 questions, 40% of overall score
- **Recovery** — 4 questions, 40%
- **Control & clarity** — 4 questions, 20%

The prompt asks employees to think about the previous two weeks.

Responses use a 1–5 scale. Standard normalization is:

~~~text
1 → 0
2 → 25
3 → 50
4 → 75
5 → 100
~~~

Reverse-coded items first use:

~~~text
effective = 6 - answer
~~~

and then the same normalization.

Overall Work Sustainability:

~~~text
0.4 × Workload balance
+ 0.4 × Recovery
+ 0.2 × Control & clarity
~~~

Higher is better.

Status bands:

- **80–100** — Green zone
- **65–79** — Stable
- **45–64** — Needs attention
- **0–44** — At risk

The primary pressure factor is selected by **largest weighted drag on the overall score**, not simply by the lowest raw factor score.

## Reliability and fallback behavior

For pressure-mode personalization the server currently uses:

1. **Gemini 3.8 Flash**
2. retry on transient capacity errors
3. **Gemini 3.5 Flash** as model fallback
4. deterministic insight + curated actions if AI personalization still fails

The browser does not abandon the request after eight seconds. Instead, the processing screen tells the employee that the calculation is taking longer than usual and continues waiting for the server result.

Scoring rules are unchanged by this fallback chain.

## Privacy model

A few product choices are intentional:

- employee assessment results are private;
- managers receive aggregates, not individual results;
- department aggregates require at least **5 completed responses**;
- public People/demo history is explicitly synthetic;
- the assessment is framed as work sustainability, not diagnosis;
- Alpha invite tokens are secret capabilities and only their hashes are stored in Neon;
- department-manager and org-admin scopes are enforced separately.

## Secure API architecture

Gemini is called only from the serverless layer.

- No Gemini API key is shipped in the browser bundle.
- GEMINI_API_KEY is stored as a server-side environment variable.
- Assessment inputs are validated server-side.
- Generative outputs are validated against the expected structured schema.
- AI-selected action IDs must belong to the deterministic allow-list for the relevant factor and action slot.
- Deterministic scoring remains the source of truth.

The public assessment path calls:

~~~text
POST /api/assessment
~~~

The Alpha branch adds dedicated session, assessment, feedback, and manager APIs backed by Neon.

## Tech stack

- React 19
- TypeScript
- Vite 6
- Vercel Serverless Functions
- Google Gemini API — Gemini 3.8 Flash primary, Gemini 3.5 Flash fallback
- Neon Postgres for the real Alpha
- Recharts
- Tailwind CSS

## Core routes

Public demo:

~~~text
/
/employee/assessment
/hr/dashboard
~~~

Real Alpha branch:

~~~text
/alpha#<secret-token>
/alpha/manager#<secret-token>
~~~

## Run locally

### Prerequisites

- Node.js 20+
- npm
- Vercel account
- Gemini API key

### Install

~~~bash
npm install
~~~

### Link to Vercel

~~~bash
npx vercel link
~~~

### Pull environment variables

Add GEMINI_API_KEY to the Vercel project environment, then:

~~~bash
npx vercel env pull .env.local
~~~

Never commit .env.local or an API key.

### Run the full local app

~~~bash
npx vercel dev
~~~

### Production build check

~~~bash
npm run build
~~~

## Prototype limitations

This is not yet a production HR platform.

- The public People view uses synthetic data.
- The public demo does not write employee assessment results into the Alpha database.
- Real Alpha authentication is capability-token based rather than enterprise SSO.
- The real Alpha re-check workflow is not yet implemented end to end.
- There are no HRIS integrations yet.
- The assessment is custom and non-clinical.

These constraints are deliberate: the current goal is to validate the decision loop, employee value, privacy model, and product behavior before expanding infrastructure.

## What this project demonstrates

Resilience.ai is intended as evidence of hands-on AI product prototyping by a Product Lead / Senior Product Manager:

- translating a product hypothesis into working employee and People workflows;
- separating deterministic decision logic from generative personalization;
- implementing structured and validated AI outputs;
- designing a secure browser → serverless → LLM boundary;
- adding a real privacy-aware Alpha without contaminating the public synthetic demo;
- thinking through employee trust, manager actionability, and re-check loops;
- iterating a working product through live user and buyer feedback.

---

**Resilience.ai** — work sustainability signals turned into privacy-safe employee and management actions.
