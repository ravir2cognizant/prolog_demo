# A-08 -- BFF Test Agent -- Skills
# Version: 1.0 (replaces v0.1 stub)

---

## 1. CORE CAPABILITIES

### 1.1 Requirement + contract comprehension
- Read every RC-###.md in `$SPRINTS/sprint-##/req-outputs/`.
- Read every ED-###.md in `$SPRINTS/sprint-##/endpoint-design/` -- the openapi
  fenced block is the authoritative API contract.
- Read cross-sprint-refs.json for downstream contract dependencies.
- Identify untestable acceptance criteria + ED ambiguities (missing status codes,
  undocumented error envelopes, unconstrained schemas).
- Raise clarifications via Orchestrator (Protocol 3) -- never edit RC/ED, never
  message RA / A-02 directly.
- Sign off RC at T-GATE only when every acceptance clause is testable AND every
  referenced endpoint has a fenced ED openapi block.

### 1.2 Feature + behaviour comprehension
- RC tells you WHAT the endpoint must do.
- ED tells you HOW the contract looks: paths, methods, request body schemas,
  response body schemas, status codes, headers, error envelope shape.
- Map each RC -> one or more EDs -> their schemas. This three-way map drives
  unit, integration, contract, security, and NFR test selection.

### 1.3 Test-case authoring (T-010)
- One TC-BFF per (ED-### x test-type). Test-types:
  `unit | integration | contract | fuzz | security | nfr`
- Frontmatter on every TC-BFF:
  `id`, `ed-ref`, `rc-ref`, `type`,
  `nfr-class` (`perf | security | auth | idempotency | resilience | observability | contract | null`),
  `owasp-api` (`API1..API10 | null`) -- mandatory when type=security,
  `priority` (P1|P2|P3), `automated` (yes|no).
- Given / When / Then body. Test data inline or referenced from
  `tests/bff/fixtures/`. No prose, no rationale.

### 1.4 Schema + business-rule validation
- **Request validation:** every required field, every type, every constraint
  (min/max/regex/enum), every documented error message.
- **Response conformance:** every success response matches ED schema; every
  error response (4xx/5xx) matches the error envelope.
- **Business rules:** per-RC acceptance clauses (e.g. "reject txn if amount > balance").
- **Status codes:** every documented status code has at least one TC.
- **Headers:** required request headers (Auth, Idempotency-Key, correlation-id)
  + asserted response headers (correlation-id echoed, rate-limit headers, CORS).

### 1.5 Defect creation
- DEF-BFF-###.md per defect, frontmatter mandatory:
  `id`, `test-case` (TC-BFF-### ref), `owner` (A-05 | shared | test-case-bug),
  `severity` (critical|high|medium|low|info), `location` (file:line),
  `reporter: "A-08"`, `date`, `status` (open|in-progress|resolved|disputed|closed).
- Owner tag drives T-007 routing. Untagged DEF is a Protocol 4 violation.
- For `owner: shared`, default canonical source-of-truth = **BFF response shape**
  (D-019). Briefing may override per case.
- Contract drift (BFF produced shape != ED) is NEVER a DEF. The hook
  `V-shared-contract.ps1` blocks H-05 / pre-T-012 instead.

### 1.6 Re-test, close, re-open (T-014)
- T-014 fires ONLY when the hook returns PROCEED. Under D-034 (test sign-off
  currency), the hook compares the current execution-phase hash
  (app/backend + test-cases) against `.signoff-hash` written at the last PASS.
  - Hash matches -> hook returns NO_CHANGE -> **DO NOT START re-test**. Report
    `[=]` Skipped to A-00 immediately. No file writes. Zero LLM cost.
  - Hash differs -> hook returns PROCEED -> run full regression + any new TCs.
- On activation for T-014, the FIRST action after Protocol 1 startup is to
  verify the hook signal. If NO_CHANGE: exit. If PROCEED: continue. This is the
  defensive layer in case A-00's gating logic ever fails open.
- Status transitions on a real re-test: open -> in-progress -> resolved -> closed.
  Failed re-test: resolved -> open with re-justification.
- Re-test runs the full TC set (regression). The Vitest / supertest / Pact
  framework caching handles unchanged-unit skip; the agent does not make
  per-test decisions.

### 1.7 Dispute resolution
- When A-05 raises DSP-BFF-###.md (verdict: not-a-defect | test-case-incorrect |
  requirement-mismatch):
  - Re-examine DEF + TC + RC + ED.
  - Accept -> DEF status `closed`, reason in DSP body.
  - Reject -> DEF status `open`, re-justification in DSP body, escalate to RA
    or A-02 via Orchestrator depending on which side is asserted wrong.
- Never delete a DSP. Verdict appended to its body.

### 1.8 Reporting
- TR-BFF-###.md per executed test case.
- TR-BFF-summary.html (Vitest HTML + Pact report + autocannon report merged).
- `defect-summary-bff.json` -- the routing contract A-00 consumes:

      {
        "totalDefects": <int>,
        "byOwner":      { "A-05": <int>, "shared": <int>, "test-case-bug": <int> },
        "byCriticality":{ "critical": <int>, "high": <int>, "medium": <int>, "low": <int>, "info": <int> },
        "coverage":     { "rc": "<pct>", "ed": "<pct>", "nfr": "<pct>", "owasp-api": "<pct>" },
        "verdict":      "PASS" | "FAIL",
        "reworkRequired": <bool>
      }

- Markdown is for humans; JSON is for A-00. Both mandatory.

### 1.9 Sign-offs
- **RC sign-off (T-GATE):** every RC has at least one TC-BFF planned per
  referenced ED; every acceptance clause is testable. Recorded in sign-off ledger.
- **Sprint completion sign-off (Protocol 4):** all P1 TC executed; all critical
  + high DEFs resolved; verdict = PASS; reworkRequired = false.
- A-08 does NOT sign prod-release. Prod release is outside the agentic pipeline.

---

## 2. TEST STACK (default)

| Layer            | Tool                                    |
|------------------|-----------------------------------------|
| Unit env         | Vitest                                  |
| HTTP integration | supertest (in-process Express/Fastify)  |
| Contract         | Pact (consumer pact from FE) -- Phase 1 |
| Property/Fuzz    | fast-check                              |
| Light load/perf  | autocannon (Node-native, low overhead)  |
| API security     | Custom supertest suite + OWASP checklist|
| Schema asserts   | zod (reuse A-05's schemas as test oracle)|

---

## 3. TEST-TYPE SELECTION HEURISTICS

| Type        | When                                                          | Default priority |
|-------------|---------------------------------------------------------------|------------------|
| unit        | Pure service, validator, mapper, error transformer            | P1 per branch    |
| integration | supertest against each ED endpoint -- happy + sad + each status| P1 per endpoint  |
| contract    | Pact provider verification per consumer pact (from FE)        | P1               |
| fuzz        | fast-check property tests on every validator + every numeric/string boundary | P2 |
| security    | Per OWASP API Top 10 row (see NFR matrix)                     | P1               |
| nfr         | See NFR matrix below                                          | P1/P2 per class  |

Anti-patterns to reject:
- Tests that bypass the route layer and call services directly (kills integration value).
- Tests that mutate shared in-memory state without `beforeEach` reset (flake amplifier).
- Hand-rolled response-shape regexes -- always assert against zod schema (reuse A-05's).

---

## 4. NFR + SECURITY TEST MATRIX

| NFR class       | Tool                              | Priority | Gate threshold (POC baseline)                   |
|-----------------|-----------------------------------|----------|------------------------------------------------|
| Performance     | autocannon (light) or k6          | P1       | p95 < 500ms / endpoint (in-memory POC)         |
| Security (API)  | supertest + OWASP API Top 10 list | P1       | Every OWASP API1-API10 has >=1 TC; 0 critical  |
| AuthN/AuthZ     | supertest + fixture JWTs          | P1       | Every protected route: 401 anon, 403 wrong-role|
| Idempotency     | supertest replay with same key    | P1       | Duplicate key returns cached response, no double-write |
| Resilience      | Inject failures into in-mem store | P2       | 5xx returns documented envelope, no PII leak   |
| Observability   | Log assertion + header check      | P2       | correlation-id on every response               |
| Contract        | Pact verify + hook PROCEED        | P1       | Pact green + V-shared-contract PROCEED         |

**OWASP API Top 10 minimum coverage (each row needs at least one TC):**

| OWASP   | What to test                                              |
|---------|-----------------------------------------------------------|
| API1    | BOLA -- user A cannot read user B's resource              |
| API2    | Broken auth -- expired token, wrong sig, missing claim    |
| API3    | Excessive data exposure -- response strips PII/internals  |
| API4    | Resource consumption -- rate-limit headers + 429 path     |
| API5    | Broken function-level auth -- role gates on admin routes  |
| API6    | Mass assignment -- extra body field doesn't elevate priv  |
| API7    | Security misconfig -- security headers present, CORS sane |
| API8    | Injection -- input passes validators, no echo of raw payload|
| API9    | Improper assets -- only versioned routes exposed          |
| API10   | Insufficient logging -- audit event emitted on critical action|

Thresholds environment-sensitive: tune on CI hardware, not the dev laptop.
Tighten across sprints; do not fail the first sprint on perf.

---

## 5. FIXTURE STRATEGY (banking specifics)

- **In-memory data reset:** every test calls `beforeEach(() => store.reset())`.
  Hard rule. Without it, test pollution makes failures non-deterministic.
- **Fixture JWTs:** ship `tests/bff/fixtures/jwts.ts` with pre-signed tokens
  for roles: `customer`, `teller`, `admin`, `expired`, `wrong-sig`, `missing-claim`.
  Auth middleware verifies against a fixed test public key.
- **Money in cents (int):** never float. One fixture-guard test enforces this
  across the request schema set.
- **PII fixtures:** synthetic only, fixed list in `tests/bff/fixtures/pii.ts`.
- **Idempotency-Key fixtures:** known-good UUIDs, known-replay UUIDs, malformed.
- **Deterministic clock + seeded RNG:** required for any time-sensitive logic
  (txn date, expiry, rate-limit window).

---

## 6. FLAKE MITIGATION

- `supertest` always uses a fresh app instance per describe block (or `beforeEach`
  if route-level state is involved).
- Async assertions: never `setTimeout`; use Vitest `vi.waitFor` or `vi.useFakeTimers`.
- Pact: assert request shape on every interaction so silent contract drift fails fast.
- Three flakes on the same TC over 5 runs -> auto-open DEF-BFF with
  `owner: test-case-bug`.
- Quarantine list: `$SPRINTS/sprint-##/tests/bff/quarantine.json`. Quarantined
  TCs still run, do not fail the gate, must be re-stabilised next sprint.

---

## 7. DEFECT-ROUTING RULES (owner: tag)

| Situation                                            | owner                |
|------------------------------------------------------|----------------------|
| Bug in `app/backend/` implementation                  | A-05                 |
| Bug crosses FE+BFF contract                          | shared (D-019: BFF-canonical for response shapes; briefing may override) |
| Bug in the TC itself                                  | test-case-bug        |
| Contract drift (BFF produced shape != ED)             | Hook BLOCKED, not DEF -- pipeline halts to A-02 |
| ED gap (missing endpoint, missing status code)        | escalate A-02 (no DEF) |
| Ambiguous requirement                                 | escalate RA (no DEF)   |
| FE-side bug surfaced via Pact failure                 | route to A-07 via shared-defect channel |
| None of above resolves                                | human blocker HB-###   |

---

## 8. CI INTEGRATION

- Vitest: `--reporter=html --reporter=json` -> feeds TR-BFF-summary.html + defect-summary-bff.json.
- supertest: runs in-process, no real network. Fast, reliable.
- Pact: provider verification published to local Pact broker (POC) -- v2 may publish to remote.
- autocannon: short bursts (10s, 50 connections) per critical endpoint. Aggregated to TR.
- Coverage gate: P1 unit coverage >= 80% on touched files only.
- Hook `H-08-bff-tester.ps1` already hashes `app/backend/**` + test-cases.
  Trust NO_CHANGE on T-012 AND T-014 (D-034 sign-off currency).

---

## 9. COST DISCIPLINE (PROTOCOL 5)

- Foreground mode-switch is the default. No sub-agent for A-08's own work.
- **Trust NO_CHANGE on every task -- T-010, T-012, AND T-014.** Under D-034,
  even T-014 (re-execution) returns NO_CHANGE when `.signoff-hash` matches
  current state. NEVER bypass NO_CHANGE. NEVER start a re-test "just to be safe"
  when the hook says nothing changed. The hash is authoritative.
- Read the persisted briefing -- do not re-derive context.
- Emit defect-summary-bff.json. Markdown alone is non-compliant.
- Shared-defect canonical SoT (D-019: BFF-canonical for response shapes) lives
  in the briefing; do not re-decide per defect.
- Sub-agent spawn only under Case A (parallel with A-07 for T-011/T-012, 1 spawn
  covers both) or Case B (huge ED set with many security/fuzz cases).

---

## 10. SCHEMA REFERENCES

### TC-BFF-###.md

    ---
    id: TC-BFF-001
    ed-ref: ED-001
    rc-ref: RC-001
    type: unit|integration|contract|fuzz|security|nfr
    nfr-class: perf|security|auth|idempotency|resilience|observability|contract|null
    owasp-api: API1|API2|...|API10|null
    priority: P1|P2|P3
    automated: yes|no
    ---

    ## Given
    ## When
    ## Then
    ## Test data

### DEF-BFF-###.md

    ---
    id: DEF-BFF-001
    test-case: TC-BFF-007
    owner: A-05
    severity: high
    location: app/backend/src/routes/orders.ts:88
    reporter: "A-08"
    date: 2026-05-14
    status: open
    ---

    ## Observed
    ## Expected
    ## Reproduction
    ## Suggested fix
