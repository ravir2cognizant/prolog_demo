# A-04 -- Frontend Developer
# Skills File
# Version: 0.2
# Status: Active
# Related: A-04-frontend-developer-definition.md

---

## SINGLE RESPONSIBILITY
See A-04-frontend-developer-definition.md.

---

## SECTION 1 -- UNIVERSAL PROTOCOLS
Refer to Agentic Delivery Core KB -- Section 4. A-04 follows all four universal
protocols. Agent-specific protocol behaviour is in A-04-frontend-developer-definition.md.

---

## SECTION 2 -- DOMAIN KNOWLEDGE

- React 18: functional components only; hooks; suspense boundaries where
  loaders return promises; React.StrictMode in dev.
- React Router 7: data router with `createBrowserRouter`; loaders for reads,
  actions for writes; `Form` element submits to the matching action; nested
  routes via the layout `<Outlet/>` pattern.
- Tailwind CSS 3.3: `theme.extend` for tokens (never invent one-off hex
  values); `@apply` only inside `@layer components`; `clsx` for conditional
  classes.
- Primitives: Radix UI / React Aria / Headless UI for anything that needs
  WCAG AA. Never roll your own combobox / dialog / menu.
- Forms: `react-hook-form` with `zodResolver`; the schema is the single source
  of truth for both validation and (where helpful) form types.
- API calls: `openapi-fetch`. The dev token is read from
  `import.meta.env.VITE_DEV_TOKEN` and injected into the Authorization header.
  `postMultipart` is the ONLY allowed raw `fetch` (for multipart bodies).
- i18n: every user-facing string MUST go through `t(key)`. Keys live in
  `src/locales/en.json`.
- Testing: Vitest + Testing Library + MSW. JSdom environment via
  `vitest.config.ts`.
- MSW: handlers in `src/api/msw-handlers.ts`. Gated by `VITE_USE_MSW=1` so
  dev can flip between mocks and a real backend without code changes.
- See SKILL: Runtime Route Introspection (a frontend equivalent of the BFF's
  `/api-docs`).

---

## SECTION 3 -- OUTPUT FORMAT SPECIFICATION

Top-level outputs in `app/frontend/`:

1. **Code** -- React 18 + Vite + Tailwind app.
   - Config: `package.json`, `tsconfig.json`, `tsconfig.node.json`,
     `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`,
     `index.html`, `project.json`, `README.md`, `.gitignore`, `.env.example`.
   - Entry: `src/main.tsx`, `src/routes.tsx`, `src/i18n.ts`,
     `src/styles/globals.css`.
   - API: `src/api/client.ts`, `src/api/types.ts`, `src/api/msw-handlers.ts`.
   - Layout: `src/layouts/AdminShell.tsx`.
   - Reusable components: `src/components/{Button,Field,DataTable,
     StatusBadge,Modal,PageHeader,RichTextEditor,HtmlSourceEditor,
     ComingSoonPage}.tsx`.
   - Features: `src/features/<area>/<PageName>.tsx` -- one folder per CI.
   - Dev introspection: `src/dev/{route-inventory.ts,RoutesPage.tsx}`
     (see SKILL).
   - Locales: `src/locales/en.json` -- every visible string keyed.
   - Tests: `src/test/{setup.ts,*.test.tsx}` -- 4+ Vitest specs.
   - Public: `public/favicon.svg`.
   - `.sprint-##.input-hash` -- idempotency marker.

2. **Runtime route inventory** -- a `/dev/routes` page (see SKILL below).

---

## SECTION 4 -- QUALITY STANDARDS AND CONSTRAINTS

Good output:
- Every CI page is implemented OR routed to a `ComingSoonPage` stub so the
  router resolves cleanly.
- Every form uses `react-hook-form` + `zodResolver`; validation errors are
  shown via the `Field` component's `error` slot with `role="alert"`.
- All BFF calls go through `apiClient` (openapi-fetch wrapper). The only
  raw `fetch` allowed is `postMultipart` for file uploads.
- Tailwind classes use design-token names from `tailwind.theme.json`. No raw
  hex colours, no magic spacing values.
- All user-facing strings go through `t(key)`; the key exists in
  `src/locales/en.json`.
- MSW handlers cover every endpoint the app calls; the dev server boots
  fully offline when `VITE_USE_MSW=1`.
- WCAG AA: keyboard nav, focus-visible rings, aria labels, sr-only fallbacks
  for badge text. RC-012 canvas carries a documented exception.

Hard constraints (never do):
- Never use raw `fetch()` outside `postMultipart`. Never use `axios`.
- Never hard-code English strings inside JSX -- always `t(key)`.
- Never invent design tokens -- consume the A-03 output verbatim.
- Never register a route in `routes.tsx` without an entry in
  `ROUTE_INVENTORY` (see SKILL below).
- Never use `console.log` outside `src/test/` and `src/dev/`.

---

## SECTION 5 -- DEFINITION OF DONE CHECKLIST

- [ ] Every CI's primary page either has a real implementation or is wired
      to `ComingSoonPage`.
- [ ] All forms use `react-hook-form` + `zodResolver`.
- [ ] `apiClient` handles all BFF reads/writes; `postMultipart` handles
      uploads only.
- [ ] **`/dev/routes` renders a table of every router route + the BFF
      endpoints it consumes** (see SKILL below).
- [ ] `tailwind.theme.json` from `ui-style-outputs/` is merged into
      `tailwind.config.js`.
- [ ] `src/locales/en.json` has an entry for every string in JSX.
- [ ] MSW handlers cover all called endpoints; `VITE_USE_MSW=1` boots fully
      offline.
- [ ] 4+ Vitest specs pass.
- [ ] `npm install && npm run dev` brings up the app at
      `http://localhost:5173` with no console errors (see SKILL: Ready-to-Run).
- [ ] No raw fetch / axios; no inline English strings; no raw hex colours;
      no `console.log` in source.
- [ ] `.sprint-##.input-hash` produced.

---

## SECTION 6 -- WORKED EXAMPLES

### Good

```tsx
// src/features/promotions/PromotionsListPage.tsx (excerpt)
export async function promotionsListLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? 'all';
  const path = status === 'all'
    ? '/promotions'
    : `/promotions?status=${encodeURIComponent(status)}`;
  const res = (await apiClient.GET(path as never, {})) as { data?: { items: PromotionSummary[] } };
  return { rows: res.data?.items ?? [], status };
}
```

### Bad (do not do)

```tsx
// raw fetch -- bypasses apiClient + auth header
const res = await fetch('/promotions', { headers: { Authorization: token } });

// hard-coded English in JSX
<h1>Promotions</h1>            // BAD
<h1>{t('promotions.title')}</h1>  // GOOD
```

---

## SKILL -- Runtime Route Introspection

### Purpose
Produce a `/dev/routes` page on the frontend that lists every React Router
route, the page component it renders, and the BFF endpoints that page
consumes. This is the frontend equivalent of the BFF's `/api-docs` and is
the single thing a reviewer can visit to see what URLs the SPA exposes and
what backend surface each URL depends on.

### When to produce
- During T-004, alongside the route tree. Every new route added in
  `src/routes.tsx` MUST also be registered in
  `src/dev/route-inventory.ts` in the same change.
- During T-007 Rework, the inventory entry is updated in lock-step.

### Mechanism

1. `src/dev/route-inventory.ts` -- the declarative inventory:

   ```ts
   export interface ConsumedEndpoint {
     method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
     path: string;
     via: 'loader' | 'action' | 'component';
   }

   export interface RouteInventoryEntry {
     path: string;
     component: string;
     auth: 'public' | 'authed';
     status: 'real' | 'stub';
     consumes: ConsumedEndpoint[];
     notes?: string;
   }

   export const ROUTE_INVENTORY: RouteInventoryEntry[] = [
     {
       path: '/marketing/promotions',
       component: 'PromotionsListPage',
       auth: 'authed',
       status: 'real',
       consumes: [
         { method: 'GET',    path: '/promotions',     via: 'loader' },
         { method: 'DELETE', path: '/promotions/:id', via: 'action' },
       ],
     },
     // ... one entry per route in routes.tsx
   ];
   ```

2. `src/dev/RoutesPage.tsx` -- renders the inventory as a table with columns:
   Path, Component, Auth, Status (real / stub), BFF endpoints consumed.
   Plain HTML table; no need for `DataTable` to avoid coupling.

3. `src/routes.tsx` registers the dev page at `/dev/routes` (always reachable;
   no auth check; it is a debug aid, not a security boundary).

4. Drift check: at render time, `RoutesPage` cross-references the inventory
   with the actual route tree exported from `routes.tsx` and surfaces any
   entries present in one but not the other.

### Standard endpoint format
Each `consumes[].path` matches the path A-02 used in the corresponding
ED-### document. Use the same path-param style (`/promotions/:id`, not
`/promotions/{id}`).

### Self-validation before reporting DoD pass
- `/dev/routes` renders without errors.
- The drift check reports zero discrepancies between `ROUTE_INVENTORY` and
  the actual `router.routes`.

### Why not auto-introspect everything?
React Router does not expose loader/action -> endpoint metadata. Instrumenting
`apiClient` calls per loader is fragile and adds runtime overhead. The
declarative inventory is a 30-second-per-route chore that produces a stable,
reviewable artefact.

---

## SKILL -- Ready-to-Run Codebase + Self-Fix Development Issues

### Purpose
The persisted `app/frontend/` directory must be **immediately runnable** after
`npm install` -- no manual edits, no missing dependencies, no broken imports,
no TypeScript errors. A-04 is responsible for fixing any development issue
that appears during verification, iterating until the codebase is clean.

### Verification gates (must all pass before reporting DoD)

1. **Install** -- `npm install` in `app/frontend/` exits 0.
2. **Type-check** -- `npm run lint` (`tsc --noEmit`) reports zero errors.
3. **Tests** -- `npm test` (Vitest) passes every spec.
4. **Dev boot** -- `npm run dev` brings up Vite at `http://localhost:5173`
   within 5 seconds; HMR is active; no console errors on first page load.
5. **Routes sanity** -- `http://localhost:5173/dev/routes` renders the
   inventory table.

### Self-fix loop

If any gate fails, A-04 iterates:
1. Read the failing tool output (`tsc` error, Vite stack, Vitest assertion).
2. Localise to the offending file/line.
3. Patch the smallest change that resolves the root cause -- never silence
   the symptom.
4. Re-run the failing gate. Escalate after 3 failed attempts.

### Common dev issues + how to fix

| Symptom | Likely root cause | Fix |
|---|---|---|
| `Cannot find module '@/X'` | TS path alias missing from `vite.config.ts` `resolve.alias` | Add `'@': path.resolve(__dirname, './src')` |
| `TS2307: Cannot find module` for a dep | Missing from `package.json` | Add to `dependencies` or `devDependencies` |
| Tailwind classes have no effect | `tailwind.config.js` `content[]` does not cover the file | Ensure `./src/**/*.{ts,tsx}` is listed |
| Hydration mismatch in React | Locale string lookup before i18n init | Import `./i18n` at the top of `main.tsx` |
| `Module not found: @headlessui/react` | Modal imports without the dep installed | Add to `package.json` |
| MSW worker not found in dev | `public/mockServiceWorker.js` missing | `npx msw init public/ --save` OR include the file in the persist |
| Vitest cannot resolve `@/...` | `vite.config.ts` `test.alias` not inheriting `resolve.alias` | Confirm vitest config inherits or duplicate the alias |
| Routes do not match | Trailing slashes mismatch / nested under wrong layout | Confirm shape against `src/routes.tsx`; match the `:id` style |

### Hard rules
- Never disable a TS rule with `// @ts-ignore` or `// @ts-expect-error` to
  make a build pass. Fix the type.
- Never delete a failing test to make `npm test` green.
- When in doubt about a version, prefer the latest stable -- never invent a
  version that does not exist on npm.

### Self-validation contract

Before A-04 reports task complete, the final lines of its return MUST
include a verification report:

```
Verification:
 npm install:        PASS / FAIL (<reason>)
 tsc --noEmit:       PASS / FAIL (<error count>)
 vitest:             PASS / FAIL (<failures>)
 dev boot:           PASS / FAIL (<stderr>)
 /dev/routes:        PASS / FAIL (<route count>)
 first-load console: PASS / FAIL (<errors>)
```

If running in the background-sub-agent contract, A-04 instead documents
the verification commands the main agent should run post-persist, and notes
the fixes it would apply if a gate fails.

---

## SKILL -- Dev-Default Env Config with Upper-Env Comments

### Purpose
`.env.example` must produce a working dev experience with zero edits, while
clearly documenting what each variable should be in staging/prod.

### Structure rules

Every variable follows this pattern:

```
# Short description of what this controls
VAR_NAME=<dev-default-that-just-works>
# For staging/prod: <upper-env override>
```

### What "dev-default" means

- Localhost-friendly: `VITE_API_BASE_URL=http://localhost:4000`.
- MSW on by default so the SPA boots without a backend: `VITE_USE_MSW=1`.
- Dev-only token: `VITE_DEV_TOKEN=dev-token` -- only valid against the BFF
  in `AUTH_DEV_BYPASS=1` mode.

### What "upper-env comment" means

- `# For staging/prod: e.g. https://api.admin.staging.example.com`
- `# For staging/prod: VITE_USE_MSW=0 (always hit the real BFF)`
- `# For staging/prod: remove this; the SPA must obtain a real token from the auth provider`

### Where the defaults live

- Vite's `import.meta.env.<VAR>` reads from `.env.local` -> `.env` -> defaults
  in code (`api/client.ts` falls back to `http://localhost:4000`).
- `.env.example` -- ships in repo; users copy to `.env.local` to override.
- `.env.local` -- gitignored.
- README.md -- documents the env model in one short section.

---

## SKILL -- Review Comment Implementation

### Purpose
Consume review comments (code-review + arch-review) filed against the
frontend, implement each comment in `app/frontend/`, and emit a comprehensive
Excel report showing which comments were implemented (with summary), which
were not (with reason), grouped by category and severity. Activated during
T-007 Rework.

### Inputs
The Orchestrator briefing names the input + output paths. Defaults:
- **Input root**: `sprints/<sprintId>/review-inputs/`
  - `code-review/` -- code-review `.md` files (one per comment, frontmatter +
    body). Authored by humans or A-06.
  - `arch-review/` -- architecture-review `.md` files (same format).
- **Output root**: `sprints/<sprintId>/review-outputs/`

Comment file format (frontmatter):
```
---
id: CR-001                             # or AR-001 (arch)
category: code-review                  # or arch-review
owner: A-04                          # A-04 | A-05 | shared | other (see "Ownership routing")
severity: critical|high|medium|low|info
location: app/frontend/src/features/promotions/PromotionEditorPage.tsx:142
reviewer: "Jane Doe"
date: 2026-05-13
---

## Comment
The comment text (markdown).

## Suggested fix (optional)
```

A-04 also accepts loose formats if the briefing names them: a single
`.csv` / `.xlsx` / `.json` in the folder, an inline list in the briefing,
or a GitHub-PR-comment dump. Convert to the canonical frontmatter format
on ingest.

The frontmatter also accepts an explicit `owner:` field used for routing
between A-04 and A-05 (see "Ownership routing" below).

### Ownership routing -- how A-04 decides which comments are its

A-04 walks the entire `review-inputs/` tree (both `code-review/` and
`arch-review/`) and decides per file:

1. **Explicit `owner` field takes precedence:**
   - `owner: A-04`        -> include; this is mine.
   - `owner: shared`        -> include; implement the frontend portion only,
                                cross-reference any backend portion to A-05
                                in the `implementation` text.
   - `owner: A-05`        -> log as `not-applicable` (route to A-05).
   - `owner: A-06`/other  -> log as `not-applicable` (not a code-agent
                                deliverable; flag follow-up).

2. **Fallback inference from `location` when `owner` is absent:**
   - `app/frontend/...`             -> mine.
   - `app/backend/...`              -> not-applicable (route to A-05).
   - `agentic-pipeline/...`         -> not-applicable (pipeline infra;
                                       route to Orchestrator / human).
   - `sprints/...`                  -> not-applicable (artefact, not code).
   - empty / unparseable / unknown  -> not-applicable with
                                       `reason: "owner unclear; reviewer to
                                       add explicit owner: field"` and
                                       `followUp: true`.

3. **Every comment file in `review-inputs/` MUST appear in the ledger** --
   even if A-04 is logging it as `not-applicable`. This is how a reviewer
   can confirm nothing was silently dropped. The "Files modified" column
   stays empty for not-applicable entries; the "Reason" column cites the
   ownership-routing rule.

4. **`owner: shared` handshake:** both A-04 and A-05 include the comment
   in their respective ledger. Each agent implements the part it owns and
   cross-references the other agent's expected change in `implementation`
   (e.g. *"Added X-Request-Id header on every apiClient call. A-05 must
   accept + propagate it in src/middleware/requestLog.ts -- see CR-007 in
   A-05 ledger."*). If the other layer hasn't done its part yet at run
   time, status is `partially-implemented` with `followUp: true`.

### Processing rules

For each comment:
1. **Implement** when the comment is in-scope, has a clear fix, and the
   fix does not break a downstream contract (CI-### or HB-003 decisions or
   the route inventory + ED-### endpoint shape consumed by a page).
2. **Partially implement** when the comment has multiple parts and only
   some apply. Document the implemented parts in `implementation`; document
   the skipped parts in `reason`.
3. **Defer** when the comment is in-scope but blocked by missing input
   (HB-### needed) or by a downstream task (e.g. a new BFF endpoint A-05
   has not exposed yet).
4. **Reject** when the comment conflicts with HB-003 decisions (e.g. asks
   to swap TipTap for Lexical), a CI-### component spec, or the i18n /
   tokens / accessibility rules in `style-system.md`.
5. **Not applicable** when the comment targets code A-04 does not own
   (e.g. a `code-review/` comment that targets `app/backend/...`).

After each implementation, run the Ready-to-Run gates (lint + test +
`npm run dev`) before moving on. A comment is not "implemented" until those
still pass. If a fix breaks them, either correct the fix or downgrade the
status to "partially-implemented" with a follow-up flag.

### Outputs

1. **Code changes** in `app/frontend/` (and possibly
   `agentic-pipeline/scripts/` if a comment touches shared utilities).

2. **`sprints/<sprintId>/review-outputs/A-04-ledger.json`** -- the machine-
   readable status ledger:
   ```json
   {
     "agent": "A-04",
     "sprint": "sprint-01",
     "generatedAt": "2026-05-13T...",
     "summary": {
       "total": 18,
       "implemented": 12,
       "partially": 2,
       "deferred": 2,
       "rejected": 1,
       "notApplicable": 1
     },
     "comments": [
       {
         "id": "CR-007",
         "category": "code-review",
         "severity": "medium",
         "location": "app/frontend/src/features/promotions/PromotionEditorPage.tsx:142",
         "reviewer": "Jane Doe",
         "date": "2026-05-13",
         "comment": "Empty-state copy hard-coded; should go through t()",
         "status": "implemented",
         "implementation": "Replaced inline string with t('promotions.editor.empty') + added key to src/locales/en.json",
         "filesModified": [
           "app/frontend/src/features/promotions/PromotionEditorPage.tsx",
           "app/frontend/src/locales/en.json"
         ],
         "reason": null,
         "followUp": false
       }
     ]
   }
   ```

3. **`sprints/<sprintId>/review-outputs/A-04-rework-report.xlsx`** --
   human-readable Excel report, produced by the shared utility:
   ```
   cd agentic-pipeline/scripts
   npm install                                   # first-time only
   npm run review-report -- --sprint <sprintId> --agent A-04
   ```
   Two sheets:
   - **Summary** -- agent, sprint, generated-at, totals, per-category
     breakdown (implemented / total), per-severity breakdown.
   - **Comments** -- one row per comment with colour-coded category /
     severity / status badges, location, reviewer, date, comment, what
     was implemented, files modified, reason (if not done), follow-up flag.

### Decision rules cheat-sheet

| Situation | Status |
|---|---|
| Clear actionable nit; fix doesn't touch contract | implemented |
| Multi-part comment; most fixed, one deferred | partially-implemented |
| Needs upstream decision (HB) or a new BFF endpoint | deferred + raise HB or cross-ref A-05 |
| Asks to drop a CI-### acceptance criterion | rejected (cite CI) |
| Asks to drop a HB-003 decision (e.g. swap TipTap for another editor) | rejected (cite HB-003) |
| Asks to invent a design token / one-off colour | rejected (cite style-system.md) |
| Filed in `code-review/` but targets `app/backend/...` | not-applicable (route to A-05) |
| Same root cause as another comment in this batch | implemented once; cross-link via `implementation` |

### Self-validation before reporting DoD pass

- Every file in `review-inputs/code-review/` and `review-inputs/arch-review/`
  has a matching entry in the ledger.
- `summary` totals match the per-status counts in `comments[]`.
- The xlsx was generated and opens cleanly (script exit 0, file exists,
  `endsWith('.xlsx')`).
- All Ready-to-Run gates still pass on the modified `app/frontend/`.
- For every `deferred` entry, the reason cites a specific HB-### or a
  downstream task (e.g. an A-05 endpoint ticket).
- For every `rejected` entry, the reason cites a specific CI-###, HB-###,
  or `style-system.md` rule.

---

## SKILL -- Defect Dispute Authoring (DSP-FE)

### Purpose
When A-04 receives a DEF-FE-### from A-07 (frontend tester) during T-007 rework and
believes the defect is NOT a frontend code bug, A-04 authors a DSP-FE-### dispute
rather than silently rejecting or "fixing" something that should not change. The
originating test agent (A-07) re-judges and writes the final verdict back to the
DSP body. The escalation path for a `requirement-mismatch` verdict is A-01r via
Orchestrator.

### Decision logic -- fix or dispute?

For each DEF-FE-### in `$SPRINTS/sprint-##/tests/fe/test-results/defects/` whose
`owner:` is `A-04` or `shared`:

| Situation | Action |
|---|---|
| Real bug in `app/frontend/` (logic, types, accessibility miss, race) | **Fix** -- update code; do NOT author a DSP |
| Test asserts behaviour that contradicts the RC acceptance criterion | **Dispute** with `verdict: requirement-mismatch` (escalates to A-01r) |
| Test case has its own bug (selector wrong, fixture wrong, env assumption) | **Dispute** with `verdict: test-case-incorrect` |
| Reported "defect" is the documented design (CI-### spec, HB-### decision, style-system rule) | **Dispute** with `verdict: not-a-defect` (cite the artefact + ID) |
| Defect is real but is owned by A-05 (BFF / contract / data shape) | Do not dispute -- log as `not-applicable` in the A-04 ledger and route to A-05 |
| Defect is genuinely a bug AFTER re-reading the RC + CI | **Fix** -- the rebuttal would be `valid-defect`; do not waste a DSP cycle |

If in any doubt, fix it. Disputes are the exception, not the default escape valve.

### DSP-FE-###.md schema

Path: `$SPRINTS/sprint-##/tests/fe/test-results/disputes/DSP-FE-###.md`

Frontmatter (validated by `V-shared-dispute-schema.ps1 -Layer fe` -- all keys are
required; missing or invalid values FAIL Tier-1 schema check):

```
---
id: DSP-FE-001
defect-ref: DEF-FE-014                   # must match /^DEF-FE-\d+/
disputer: A-04
verdict: not-a-defect                    # one of: not-a-defect | test-case-incorrect | requirement-mismatch | valid-defect
date: 2026-05-15
---

## Disputed defect
DEF-FE-014 reported that the empty-state copy on `/promotions` is missing an
"Add promotion" CTA.

## Why this is not a frontend bug
CI-007 §3 ("Empty states") explicitly omits a CTA on read-only roles. The test
fixture used the admin role but asserted the read-only empty state. Acceptance
criterion RC-012 #2 confirms this.

## Recommended action
A-07 to amend TC-FE-022 to assert the role-specific empty state.

<!-- A-07 fills the section below on re-judgement -->
## A-07 verdict
(to be written by A-07 after re-examining DEF + TC + RC)
```

### dispute-summary.json -- routing contract emitted by A-04

A-04 writes ONE summary file per sprint at:
`$SPRINTS/sprint-##/tests/fe/test-results/dispute-summary.json`

Shape (consumed by A-00 and `build-velocity-report.ps1`):

```json
[
  { "id": "DSP-FE-001", "verdict": "not-a-defect",       "defectRef": "DEF-FE-014", "disputer": "A-04" },
  { "id": "DSP-FE-002", "verdict": "requirement-mismatch","defectRef": "DEF-FE-023", "disputer": "A-04" }
]
```

The verdict in the summary is the ORIGINATING verdict A-04 asserted. The final
verdict (after A-07 re-judges) lives in the DSP body, not in this summary.

### Lifecycle -- who does what

1. A-07 emits DEF-FE-### with `owner: A-04` or `shared` and a `defect-summary-fe.json` entry.
2. A-04 (this agent) decides per the table above:
   - **Fix path**: edit code, re-run Ready-to-Run gates, update DEF status -> `resolved`.
   - **Dispute path**: write DSP-FE-###.md, append to dispute-summary.json, leave DEF
     status `open` with `dispute: DSP-FE-###` cross-reference in the ledger.
3. Orchestrator routes each DSP back to A-07 for re-judgement.
4. A-07 reads + re-judges:
   - Accept dispute -> DEF status `closed`, reason written into DSP body.
   - Reject dispute -> DEF status stays `open`, re-justification in DSP body.
5. If A-04's dispute verdict is `requirement-mismatch`, Orchestrator additionally
   escalates to A-01r (requirement resolver) regardless of A-07's verdict.

### Hard rules
- Never delete a DSP-FE-###.md. The full thread (A-04 assertion + A-07 verdict)
  is the audit trail.
- Never write a DSP without `defect-ref` -- the validator rejects it and the
  Orchestrator cannot route it.
- Never write a DSP with `verdict: valid-defect` -- that means "fix it", not "dispute it".
  Use the fix path instead.
- Both DSP files and `dispute-summary.json` are emitted in the SAME T-007 cycle.
  The summary file is what A-00 watches for; missing it stalls the routing loop.

### Self-validation before reporting DoD pass
- For every DEF-FE A-04 chose to dispute, a DSP-FE-###.md exists with all five
  required frontmatter keys and a body explaining the assertion.
- `dispute-summary.json` contains exactly one entry per DSP-FE file authored
  this sprint; verdicts match the frontmatter verdicts.
- `V-shared-dispute-schema.ps1 -Layer fe` exits 0 (no Tier-1 schema violations).
- The A-04 ledger cross-references each disputed DEF-FE with `dispute: DSP-FE-###`
  so the rework report shows which defects A-04 disputed vs fixed vs deferred.

---

## VERSION HISTORY
| Version | Date       | Author            | Changes                                                                                          |
|---------|------------|-------------------|--------------------------------------------------------------------------------------------------|
| 0.1     | 2026-05-13 | Architecture Lead | Skeleton created                                                                                 |
| 0.2     | 2026-05-13 | Architecture Lead | Filled in Sections 2-6 from sprint-01 frontend implementation; added SKILL: Runtime Route Introspection; SKILL: Ready-to-Run Codebase + Self-Fix Development Issues; SKILL: Dev-Default Env Config with Upper-Env Comments |
| 0.3     | 2026-05-13 | Architecture Lead | Added SKILL: Review Comment Implementation (consume `review-inputs/`, emit ledger JSON + Excel report at `review-outputs/`). Workspace folder renamed from `pipeline/` to `agentic-pipeline/`. |
| 0.4     | 2026-05-15 | Architecture Lead | Added SKILL: Defect Dispute Authoring (DSP-FE) -- DSP decision logic, DSP-FE-###.md frontmatter schema, `dispute-summary.json` shape, A-07 re-judgement handshake, escalation to A-01r on `requirement-mismatch`. |