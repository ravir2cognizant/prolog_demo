# A-07 -- Frontend Test Agent -- Skills
# Version: 1.0 (replaces v0.1 stub)

---

## 1. CORE CAPABILITIES (what A-07 must be able to do)

### 1.1 Requirement comprehension
- Read every RC-###.md in `$SPRINTS/sprint-##/req-outputs/` and the cross-sprint-refs.json.
- Identify ambiguous, conflicting, or untestable acceptance criteria.
- Raise clarifications via Orchestrator (Protocol 3) -- never edit RC, never message RA directly.
- Sign off RC at T-GATE only when every `acceptance:` clause is testable and every
  edge case has a clear pass/fail boundary.

### 1.2 UI / look-n-feel comprehension
- Read every CI-###.md in `$SPRINTS/sprint-##/component-inventory/`.
- Read `$SPRINTS/sprint-##/ui-style-outputs/tokens.json`, `theme.json`, and the
  style markdown produced by A-03a.
- Map each RC -> one or more components -> the tokens those components consume.
  This three-way map drives visual and a11y test selection.

### 1.3 Test-case authoring (T-009)
- One TC-FE per (RC x test-type). Test-types:
  `unit | integration | e2e | a11y | visual | nfr`
- Frontmatter on every TC-FE:
  `id`, `rc-ref`, `ci-ref` (when applicable), `type`, `nfr-class`
  (`perf | a11y | security | resilience | compat | i18n | null`),
  `priority` (P1|P2|P3), `automated` (yes|no).
- Given / When / Then body. Test data inline or referenced from
  `tests/fe/fixtures/`. No prose, no rationale -- the RC is the rationale.

### 1.4 UI validation coverage
- Functional: every interactive element in every CI gets at least one TC.
- Form validation: every field-level rule + every cross-field rule.
- Routing: every loader/action + every guarded route + every 401/redirect path.
- State: error, empty, loading, partial, success -- one TC each per stateful view.

### 1.5 Defect creation
- DEF-FE-###.md per defect, frontmatter mandatory:
  `id`, `test-case` (TC-FE-### ref), `owner` (A-04 | shared | test-case-bug),
  `severity` (critical|high|medium|low|info), `location` (file:line),
  `reporter: "A-07"`, `date`, `status` (open|in-progress|resolved|disputed|closed).
- Owner tag drives T-007 routing. Untagged DEF is a Protocol 4 violation.
- For `owner: shared`, follow the canonical-source-of-truth decision in the
  briefing (typically ED-###.md) so A-04 and A-05 don't thrash.

### 1.6 Re-test, close, re-open (T-013)
- T-013 fires ONLY when the hook returns PROCEED. Under D-034 (test sign-off
  currency), the hook compares the current execution-phase hash
  (app/frontend + test-cases) against `.signoff-hash` written at the last PASS.
  - Hash matches -> hook returns NO_CHANGE -> **DO NOT START re-test**. Report
    `[=]` Skipped to A-00 immediately. No file writes. Zero LLM cost.
  - Hash differs -> hook returns PROCEED -> run full regression + any new TCs.
- On activation for T-013, the FIRST action after Protocol 1 startup is to
  verify the hook signal. If NO_CHANGE: exit. If PROCEED: continue. This is the
  defensive layer in case A-00's gating logic ever fails open.
- Status transitions on a real re-test: open -> in-progress -> resolved -> closed.
  Failed re-test: resolved -> open with re-justification.
- Re-test runs the full TC set (regression). The Vitest / Playwright framework's
  own caching handles unchanged-unit skip; the agent does not make per-test
  decisions.

### 1.7 Dispute resolution
- When A-04 raises DSP-FE-###.md (verdict: not-a-defect | test-case-incorrect |
  requirement-mismatch):
  - Re-examine DEF + TC + RC.
  - Accept -> DEF status `closed`, reason in DSP body.
  - Reject -> DEF status `open`, re-justification in DSP body, escalate to RA via
    Orchestrator if requirement-mismatch is asserted.
- Never delete a DSP. Verdict is appended to its body.

### 1.8 Reporting
- TR-FE-###.md per executed test case.
- TR-FE-summary.html (Vitest HTML + Playwright HTML merged).
- `defect-summary-fe.json` -- the routing contract A-00 consumes:

      {
        "totalDefects": <int>,
        "byOwner":      { "A-04": <int>, "shared": <int>, "test-case-bug": <int> },
        "byCriticality":{ "critical": <int>, "high": <int>, "medium": <int>, "low": <int>, "info": <int> },
        "coverage":     { "rc": "<pct>", "ci": "<pct>", "nfr": "<pct>" },
        "verdict":      "PASS" | "FAIL",
        "reworkRequired": <bool>
      }

- Markdown is for humans; JSON is for A-00. Both are mandatory.

### 1.9 Sign-offs
- **RC sign-off (T-GATE):** every RC has at least one TC-FE planned; every
  acceptance clause is testable. Recorded in the sign-off ledger.
- **Sprint completion sign-off (Protocol 4):** all P1 TC executed; all critical
  + high DEFs resolved; verdict = PASS; reworkRequired = false.
- A-07 does NOT sign prod-release. Prod release is outside the agentic pipeline.

---

## 2. TEST STACK (default)

| Layer            | Tool                          |
|------------------|-------------------------------|
| Unit + integration env | Vitest + happy-dom      |
| DOM assertions   | @testing-library/react        |
| API mocking      | MSW (handlers derived from ED-###.md) |
| E2E              | Playwright                    |
| Accessibility    | axe-core via Playwright       |
| Visual regression| Playwright snapshots          |
| Performance      | Playwright + Lighthouse CI    |

---

## 3. TEST-TYPE SELECTION HEURISTICS

| Type        | When                                                                | Default priority |
|-------------|---------------------------------------------------------------------|------------------|
| unit        | Pure component, hook, validator, formatter                          | P1 per branch    |
| integration | Loader, action, form submit, MSW-bound flow                         | P1 per flow      |
| e2e         | One happy path per RC + one negative path per acceptance failure    | P1               |
| a11y        | Every page route + every interactive component in CI                | P1 (WCAG AA)     |
| visual      | Only on tokens.json boundaries (color, spacing, type)               | P2               |
| nfr         | See NFR matrix below                                                | P1/P2 per class  |

Anti-patterns to reject:
- Visual snapshots on every component (flake budget explodes).
- DOM / JSON snapshots as a substitute for assertions.
- `page.waitForTimeout` -- always use `expect.poll`.

---

## 4. NFR TEST MATRIX

| NFR class    | Tool                          | Priority | Gate threshold (POC baseline)            |
|--------------|-------------------------------|----------|------------------------------------------|
| Performance  | Playwright + Lighthouse CI    | P1       | LCP < 4s, TBT < 300ms, bundle < N KB     |
| a11y         | axe-core via Playwright       | P1       | 0 critical, 0 serious WCAG AA            |
| Security     | Playwright assertions + CSP   | P1       | No token/PII in storage; CSP violations 0|
| Resilience   | Playwright network throttle   | P1       | Every flow degrades with visible error UI|
| Compatibility| Playwright project matrix     | P2       | Smoke set passes on Chromium/WebKit/FF   |
| i18n         | Playwright + pseudo-locale    | P2       | No truncation, no hard-coded strings     |

Out of A-07 scope (owned by A-08): API latency, BFF throughput, rate-limiting,
server-side auth lifecycle, DB performance.

Thresholds are environment-sensitive -- set them on CI hardware, not the dev
laptop. Tighten across sprints; don't fail the first sprint on perf.

---

## 5. FIXTURE STRATEGY (banking specifics)

- MSW handlers generated from ED-###.md -- single source of truth.
- Deterministic clock + seeded RNG for every date / amount / txn-id field.
- Money in cents (int), never float. One fixture-guard test enforces this.
- PII fixtures: synthetic only, fixed list in `tests/fe/fixtures/pii.ts`.
- Auth: every protected route has a TC for expired-token + 401 redirect.
- Idempotency: every mutating call asserts the idempotency-key header reached MSW.

---

## 6. FLAKE MITIGATION

- Playwright `retries: 1` in CI, `0` locally.
- Three flakes on the same TC over 5 runs -> auto-open DEF-FE with
  `owner: test-case-bug` (A-07 fixes).
- Quarantine list at `$SPRINTS/sprint-##/tests/fe/quarantine.json`. Quarantined
  TCs still run, do not fail the gate, must be re-stabilised next sprint.
- Hard ban: `waitForTimeout`, sleep, race-prone selectors (`nth(0)` of dynamic list).

---

## 7. DEFECT-ROUTING RULES (owner: tag)

| Situation                                       | owner             |
|-------------------------------------------------|-------------------|
| Bug in `app/frontend/` implementation           | A-04              |
| Bug crosses FE+BFF contract                     | shared            |
| Bug in the TC itself                            | test-case-bug     |
| Style-token drift                               | escalate A-03a (no DEF) |
| Component-spec gap in CI                        | escalate A-03b (no DEF) |
| Ambiguous requirement                           | escalate RA (no DEF)    |
| Contract drift (FE consumed shape != ED)        | Hook BLOCKED, not DEF -- pipeline halts to A-02 |
| None of above resolves                          | human blocker HB-###    |

---

## 8. CI INTEGRATION

- Vitest: `--reporter=html --reporter=json` -> feeds TR-FE-summary.html + defect-summary-fe.json.
- Playwright: `--reporter=html,json,github`. HTML merges into TR-FE-summary.html.
- Coverage gate: P1 unit coverage >= 80% on touched files only (not repo-wide).
- Hook `H-07-frontend-tester.ps1` already hashes `app/frontend/**` + test-cases.
  Trust NO_CHANGE on T-011 AND T-013 (D-034 sign-off currency).

---

## 9. COST DISCIPLINE (PROTOCOL 5)

- Foreground mode-switch is the default. No sub-agent for A-07's own work.
- **Trust NO_CHANGE on every task -- T-009, T-011, AND T-013.** Under D-034,
  even T-013 (re-execution) returns NO_CHANGE when `.signoff-hash` matches
  current state. NEVER bypass NO_CHANGE. NEVER start a re-test "just to be safe"
  when the hook says nothing changed. The hash is authoritative.
- Read the persisted briefing -- do not re-derive context.
- Emit defect-summary-fe.json. Markdown alone is non-compliant.
- Sub-agent spawn only under Case A (parallel with A-08 for T-011/T-012, 1 spawn
  covers both) or Case B (100+ components / 200+ TCs justify isolated Explore).

---

## 10. SCHEMA REFERENCES

### TC-FE-###.md

    ---
    id: TC-FE-001
    rc-ref: RC-001
    ci-ref: CI-007
    type: unit|integration|e2e|a11y|visual|nfr
    nfr-class: perf|a11y|security|resilience|compat|i18n|null
    priority: P1|P2|P3
    automated: yes|no
    ---

    ## Given
    ## When
    ## Then
    ## Test data

### DEF-FE-###.md

    ---
    id: DEF-FE-001
    test-case: TC-FE-007
    owner: A-04
    severity: high
    location: app/frontend/src/pages/Cart.tsx:42
    reporter: "A-07"
    date: 2026-05-14
    status: open
    ---

    ## Observed
    ## Expected
    ## Reproduction
    ## Suggested fix
