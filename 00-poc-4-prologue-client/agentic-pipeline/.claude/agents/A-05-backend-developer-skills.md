# A-05 -- Backend Developer
# Skills File
# Version: 0.2
# Status: Active
# Related: A-05-backend-developer-definition.md

---

## SINGLE RESPONSIBILITY
See A-05-backend-developer-definition.md.

---

## SECTION 1 -- UNIVERSAL PROTOCOLS
Refer to Agentic Delivery Core KB -- Section 4. A-05 follows all four universal
protocols. Agent-specific protocol behaviour is in A-05-backend-developer-definition.md.

---

## SECTION 2 -- DOMAIN KNOWLEDGE

- REST + HTTP semantics: idempotency of GET/PUT/PATCH/DELETE, correct status
  codes (200/201/204/400/401/403/404/409/422/500), problem+json (RFC 7807) for
  error bodies.
- BFF patterns: thin orchestration over upstream systems; never expose raw
  upstream payloads; map at the controller boundary.
- Clean Architecture: routes know HTTP, controllers know request/response
  shape + Zod, services know business rules + the store, store knows only
  data. No service imports `express`. No controller calls the store directly.
- Express 4 specifics: avoid `app.use(express.json())` without a size limit;
  always mount `helmet()` early; route ordering matters for `*` catch-all 404.
- Security: validate every input with Zod at the controller; never log
  Authorization headers, cookies, or PII (`email`, `displayName`,
  `textContent`, `htmlContent`); use Pino `redact.paths`.
- Observability: prom-client default + a `http_request_duration_seconds`
  histogram labelled `route`, `method`, `status`. OpenTelemetry init must be a
  safe no-op when no OTLP endpoint is configured.
- POC constraint: in-memory store only -- no SQL/ORM/Redis. Each domain has
  its own `Map<string, T>` in `src/store/memoryStore.ts` and seed fixtures in
  `src/store/seed.ts`.
- Endpoint documentation: see SKILL: Runtime Endpoint Documentation below.

---

## SECTION 3 -- OUTPUT FORMAT SPECIFICATION

Two top-level outputs in `app/backend/`:

1. **Code** -- TypeScript Express 4 service.
   - `src/server.ts` -- bootstrap.
   - `src/app.ts` -- composition (helmet, cors, body parsers, request log,
     metrics middleware, mount routes, 404, error handler).
   - `src/config/{env,logger,otel}.ts`.
   - `src/middleware/{auth,requestLog,metrics,errorHandler}.ts`.
   - `src/routes/<domain>.routes.ts` -- Express Router per domain area.
   - `src/controllers/asyncHandler.ts` -- shared async wrapper that
     auto-JSON-serialises non-undefined return values.
   - `src/services/<domain>.service.ts` -- business logic.
   - `src/store/{memoryStore,seed}.ts` -- in-memory Maps + seed fixtures.
   - `src/domain/{types,schemas}.ts` -- TypeScript types + Zod request schemas.
   - `src/docs/{registry,handler,responses}.ts` -- endpoint metadata registry,
     `/api-docs` handler, and canonical response docs (see SKILL below).
   - `src/util/{errors,ids,paging}.ts` -- shared helpers.
   - `src/test/*.spec.ts` -- 3-4 supertest+Vitest integration tests for
     representative endpoints (health, shell, one CRUD path, auth gate,
     `/api-docs` shape).
   - `package.json` / `tsconfig*.json` / `.env.example` / `README.md` /
     `.gitignore` / `project.json` / `vitest.config.ts`.
   - `.sprint-##.input-hash` -- idempotency marker.

2. **`GET /api-docs`** -- runtime endpoint that returns the introspected
   endpoint inventory as JSON (see SKILL).

---

## SECTION 4 -- QUALITY STANDARDS AND CONSTRAINTS

Good output:
- Every ED-### endpoint is implemented at the same method + path + payload
  shape + status codes + auth requirement.
- Every ED-### endpoint also appears in the `/api-docs` response with the
  same surface.
- Zod schema for every request body / query / path param. Validation errors
  return `400 application/problem+json` with a `field` and `issues[]`.
- All protected routes go through one `authn` middleware. Public routes
  (`/healthz`, `/readyz`, `/metrics`, `/api-docs`) are mounted **before**
  `app.use(authn)`.
- In-memory store seeded with realistic fixtures so the frontend has demo
  data on boot.
- Tests cover: a public endpoint, a protected endpoint with the dev-bypass
  token, a validation-failure path, an auth-rejection path, the `/api-docs`
  endpoint (returns 200 and includes a known route).

Hard constraints (never do):
- Never log `Authorization`, `Cookie`, `email`, `displayName`, `textContent`,
  `htmlContent`. Use Pino `redact.paths`.
- Never use string interpolation in log messages; only named placeholders.
- Never use `console.log`.
- Never introduce a database, ORM, or external cache (POC is in-memory).
- Never let request handlers throw raw `Error`; throw `AppError` from
  `src/util/errors.ts` and let the central error handler serialise it.
- Never register a route without a corresponding `documented(...)` metadata
  entry (see SKILL). The `/api-docs` page is a contract, not an afterthought.

---

## SECTION 5 -- DEFINITION OF DONE CHECKLIST

- [ ] Every ED-### endpoint is implemented (method + path + request validation
      + response shape + status codes + auth).
- [ ] **`GET /api-docs` returns 200 `text/html`** -- a self-contained HTML
      page listing every ED-### endpoint grouped by tag, with method, path,
      auth, summary, request body / query / path-param schemas (JSON Schema
      pretty-printed), and response status codes + descriptions. `/api-docs`
      itself does NOT appear in the listing.
- [ ] Helmet, CORS (configurable allow-list), JSON body parser with size
      limit, Pino request log, prom-client metrics, OpenTelemetry init, and
      central error handler emitting RFC 7807 problem+json are all wired.
- [ ] All routes except `/healthz`, `/readyz`, `/metrics`, `/api-docs` are
      behind Bearer JWT via `jose`. `AUTH_DEV_BYPASS=1` skip mode works in
      dev.
- [ ] In-memory store seeded; frontend has demo data on boot.
- [ ] 3-4 supertest + Vitest tests pass (including one for `/api-docs`).
- [ ] README documents how to run / test / build, environment variables, the
      in-memory POC caveat, and "visit `http://localhost:4000/api-docs` to see
      the endpoint inventory".
- [ ] No `console.log`, no PII in logs, no string-interpolated log messages.
- [ ] No open clarification requests outstanding.
- [ ] `.sprint-##.input-hash` produced.
- [ ] **Env Bootstrap (SKILL)** executed: `app/backend/.env` created from `.env.example`
      if absent; `ENV_CREATED_HB` block present in completion report if `.env` was new.

---

## SECTION 6 -- WORKED EXAMPLES

### Good

```ts
// src/routes/promotions.routes.ts (excerpt)
import { documented } from '../docs/registry.js';
import { unauthorised, validationFailure } from '../docs/responses.js';

documented({
  method: 'post',
  path: '/promotions',
  tag: 'promotions',
  summary: 'Create a promotion',
  auth: 'bearer',
  requestBody: CreatePromotionBody,
  responses: {
    201: { description: 'Promotion created', schema: PromotionCreatedResponse },
    400: validationFailure,
    401: unauthorised,
  },
});

r.post('/promotions', ah((req, res) => {
  const body = CreatePromotionBody.parse(req.body);
  res.status(201);
  return createPromotion(body, principal(req));
}));
```

```bash
# Reviewer / frontend dev:
curl -s http://localhost:4000/api-docs | jq '.endpoints[] | {method, path, auth, tag}'
```

### Bad (do not do)

```ts
// throws raw Error -- bypasses problem+json + Pino
app.post('/promotions', async (req, res) => {
  if (!req.body.name) throw new Error('Name required');
  // ...
});

// route registered without documented() metadata -- invisible in /api-docs
r.post('/secret-thing', ah((req) => secretThing(principal(req))));
```

---

## SKILL -- Runtime Endpoint Documentation

### Purpose
Produce a public `GET /api-docs` endpoint on the BFF that **returns an HTML
page** rendering the inventory of every mounted route -- its auth requirement,
tag, summary, request body / query / path parameter schemas (converted from
Zod to JSON Schema), and response status codes with descriptions. The page
is self-contained (inline CSS, no external assets) and is the single URL a
reviewer can open in a browser to see what the BFF exposes.

The endpoint is **reflected from the actual code** -- there is no separate
spec file to keep in sync. If a route is registered without its `documented`
metadata, the DoD self-check will fail.

**Exclusion rule:** `/api-docs` MUST NOT appear in its own listing. Do not
register it with `documented(...)` AND defensively filter any entry whose
path equals `/api-docs` in the handler.

### When to produce
- During T-005, alongside the Express code. Every new route added under
  `src/routes/` MUST be registered with `documented(...)` in the same file.
- During T-007 Rework, the `documented` block is updated in lock-step with
  the route. Because the metadata lives next to the route, drift is much
  less likely than with a separate YAML file.

### Mechanism

A small in-process registry at `src/docs/registry.ts`:

```ts
import type { ZodTypeAny } from 'zod';

export type AuthMode = 'public' | 'bearer';
export type HttpMethod = 'get' | 'post' | 'patch' | 'put' | 'delete';

export interface ResponseDoc {
  description: string;
  schema?: ZodTypeAny;     // optional -- 204 has no body
  example?: unknown;
}

export interface EndpointDoc {
  method: HttpMethod;
  path: string;            // e.g. '/promotions/:id'
  tag: string;             // domain grouping: 'shell' | 'campaigns' | ...
  summary: string;         // one short sentence
  auth: AuthMode;
  requestBody?: ZodTypeAny;
  query?: ZodTypeAny;
  pathParams?: Record<string, { description?: string }>;  // names of :params
  responses: Record<number, ResponseDoc>;
}

const registry: EndpointDoc[] = [];

export function documented(doc: EndpointDoc): void {
  registry.push(doc);
}

export function listEndpoints(): EndpointDoc[] {
  return registry;
}
```

The `/api-docs` handler at `src/docs/handler.ts` renders **HTML**:

```ts
import type { Request, Response } from 'express';
import zodToJsonSchema from 'zod-to-json-schema';
import { listEndpoints } from './registry.js';

const SELF = '/api-docs';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function pre(value: unknown): string {
  return `<pre>${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
}

const METHOD_COLOURS: Record<string, string> = {
  GET: '#1F7A3F', POST: '#2D4A8A', PATCH: '#9C5A00', PUT: '#9C5A00', DELETE: '#B42318',
};

export function apiDocsHandler(_req: Request, res: Response): void {
  const entries = listEndpoints()
    .filter((d) => d.path !== SELF)
    .map((d) => ({
      method: d.method.toUpperCase(),
      path: d.path,
      tag: d.tag,
      summary: d.summary,
      auth: d.auth,
      pathParams: d.pathParams,
      requestBody: d.requestBody ? zodToJsonSchema(d.requestBody, { target: 'jsonSchema7' }) : undefined,
      query:       d.query       ? zodToJsonSchema(d.query,       { target: 'jsonSchema7' }) : undefined,
      responses: Object.fromEntries(
        Object.entries(d.responses).map(([code, r]) => [code, {
          description: r.description,
          schema: r.schema ? zodToJsonSchema(r.schema, { target: 'jsonSchema7' }) : undefined,
          example: r.example,
        }]),
      ),
    }))
    .sort((a, b) => a.tag.localeCompare(b.tag) || a.path.localeCompare(b.path));

  const byTag = entries.reduce<Record<string, typeof entries>>((acc, e) => {
    (acc[e.tag] ||= []).push(e); return acc;
  }, {});

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Admin Tool BFF -- API docs</title>
<style>
  body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; background: #F4F5F7; color: #1A2233; }
  header { background: #2D4A8A; color: #fff; padding: 16px 24px; }
  header h1 { margin: 0; font-size: 18px; }
  header .meta { font-size: 12px; opacity: 0.85; margin-top: 4px; }
  main { max-width: 1100px; margin: 0 auto; padding: 24px; }
  h2 { margin-top: 32px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #4A5568; border-bottom: 1px solid #D7DCE3; padding-bottom: 6px; }
  details { background: #fff; border: 1px solid #E6E9EE; border-radius: 6px; margin: 8px 0; }
  summary { padding: 10px 14px; cursor: pointer; display: flex; align-items: center; gap: 12px; }
  summary::-webkit-details-marker { display: none; }
  .method { display: inline-block; min-width: 64px; padding: 2px 8px; border-radius: 4px; color: #fff; font-weight: 600; font-size: 12px; text-align: center; }
  .path { font-family: ui-monospace, Menlo, Consolas, monospace; font-weight: 600; }
  .auth { font-size: 11px; padding: 2px 6px; border-radius: 9999px; }
  .auth.bearer { background: #FCEFD9; color: #9C5A00; }
  .auth.public { background: #E5F1EA; color: #196333; }
  .summary-text { margin-left: auto; color: #4A5568; font-size: 13px; }
  .body { padding: 0 14px 14px; border-top: 1px solid #E6E9EE; }
  .row { margin: 12px 0; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #4A5568; margin-bottom: 4px; }
  pre { background: #F4F5F7; border: 1px solid #E6E9EE; border-radius: 4px; padding: 10px; overflow-x: auto; font-size: 12px; margin: 0; }
  .status { display: inline-block; min-width: 38px; padding: 1px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #fff; margin-right: 8px; }
  .status.s2 { background: #1F7A3F; }
  .status.s4 { background: #B42318; }
  .status.s5 { background: #4A5568; }
  .empty { color: #8A93A6; font-style: italic; }
  .toc { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 24px; }
  .toc a { background: #fff; border: 1px solid #D7DCE3; padding: 4px 10px; border-radius: 9999px; color: #2D4A8A; text-decoration: none; font-size: 12px; }
  .toc a:hover { background: #E6ECF5; }
</style></head>
<body>
  <header>
    <h1>Admin Tool BFF -- API endpoints</h1>
    <div class="meta">${entries.length} endpoints &middot; generated ${new Date().toISOString()} &middot; <code>/api-docs</code> not listed here</div>
  </header>
  <main>
    <div class="toc">
      ${Object.keys(byTag).sort().map((t) => `<a href="#${escapeHtml(t)}">${escapeHtml(t)} <small>(${byTag[t].length})</small></a>`).join('')}
    </div>
    ${Object.keys(byTag).sort().map((tag) => {
      const list = byTag[tag];
      return `<section id="${escapeHtml(tag)}"><h2>${escapeHtml(tag)}</h2>${list.map((e) => `
        <details>
          <summary>
            <span class="method" style="background:${METHOD_COLOURS[e.method] ?? '#4A5568'}">${e.method}</span>
            <span class="path">${escapeHtml(e.path)}</span>
            <span class="auth ${e.auth}">${e.auth}</span>
            <span class="summary-text">${escapeHtml(e.summary)}</span>
          </summary>
          <div class="body">
            ${e.pathParams ? `<div class="row"><div class="label">Path params</div>${pre(e.pathParams)}</div>` : ''}
            ${e.query ? `<div class="row"><div class="label">Query</div>${pre(e.query)}</div>` : ''}
            ${e.requestBody ? `<div class="row"><div class="label">Request body</div>${pre(e.requestBody)}</div>` : ''}
            <div class="row"><div class="label">Responses</div>
              ${Object.entries(e.responses).map(([code, r]) => {
                const cls = `s${code[0]}`;
                return `<div style="margin: 8px 0;">
                  <span class="status ${cls}">${code}</span><strong>${escapeHtml(r.description)}</strong>
                  ${r.schema ? pre(r.schema) : '<div class="empty">No body</div>'}
                </div>`;
              }).join('')}
            </div>
          </div>
        </details>`).join('')}</section>`;
    }).join('')}
  </main>
</body></html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}
```

Mount it as a public route in `src/routes/index.ts`, BEFORE `app.use(authn)`,
and do NOT register it with `documented(...)`:

```ts
app.get('/api-docs', apiDocsHandler);   // public, self-excluded
```

`package.json` dependency to add:
- `zod-to-json-schema` (^3.x)

### Standard responses (define once, reuse)

A helper module exports canonical response docs so each `documented` call
does not have to redeclare them:

```ts
// src/docs/responses.ts
import { z } from 'zod';

export const ProblemSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number(),
  detail: z.string().optional(),
  field: z.string().optional(),
  issues: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  references: z.array(z.object({ type: z.string(), id: z.string() })).optional(),
}).describe('RFC 7807 problem+json');

export const validationFailure = { description: 'Validation failure', schema: ProblemSchema };
export const unauthorised      = { description: 'Unauthorised',       schema: ProblemSchema };
export const forbidden         = { description: 'Forbidden',          schema: ProblemSchema };
export const notFound          = { description: 'Not found',          schema: ProblemSchema };
export const conflict          = { description: 'Conflict',           schema: ProblemSchema };
export const serverError       = { description: 'Internal server error', schema: ProblemSchema };
```

### Page layout (what the reviewer sees in a browser)

- **Header bar** (Fiserv-blue): "Admin Tool BFF -- API endpoints", endpoint
  count, generation timestamp, and a note that `/api-docs` itself is not
  listed.
- **Tag chips** (TOC): clickable pills linking to each tag section
  (`shell`, `campaigns`, `promotions`, `content`, `segments`, `criteria`,
  `journeys`, `ops`).
- **Grouped sections**: one `<section>` per tag, with collapsible
  `<details>` rows per endpoint. Each row shows:
  - Coloured `METHOD` badge (GET green, POST blue, PATCH/PUT orange, DELETE red)
  - Path in monospace
  - Auth pill (`bearer` warm / `public` green)
  - One-line summary
- **Expanded body** shows path params, query schema, request body schema,
  and a per-status-code response list with schema preview (status badge is
  green for 2xx, red for 4xx, grey for 5xx).
- Self-contained: inline `<style>`, no external CSS or JS. Renders in any
  browser, no build step needed.
- `/api-docs` is filtered out so it never appears in its own page.

### Self-validation before reporting DoD pass

A-05 self-checks:
- For every route mounted in `src/routes/*.routes.ts`, a matching
  `documented(...)` call exists in the same file.
- Tag values are one of: `shell`, `campaigns`, `promotions`, `content`,
  `segments`, `criteria`, `journeys`, `ops`.
- Every `auth: 'bearer'` route is mounted after `app.use(authn)`. Every
  `auth: 'public'` route is mounted before.
- A supertest+Vitest spec hits `GET /api-docs` and asserts:
  (a) status 200; (b) `endpoints[]` is non-empty; (c) a known route
  (e.g. `POST /promotions`) is present with `auth: 'bearer'` and the
  expected `tag`.

### Why not OpenAPI YAML?

Tradeoff snapshot (chosen approach in **bold**):
- Static `openapi.yaml`: standard format, drifts from code.
- **Runtime `/api-docs` endpoint: lighter, single source of truth, drift-proof.**
- Auto-generated OpenAPI via `zod-to-openapi`: same benefits, more wiring;
  acceptable upgrade path if Swagger UI compatibility becomes needed later.

If a downstream consumer needs Swagger UI rendering, a small wrapper can
reshape the `/api-docs` response into OpenAPI 3.1 -- but that is a future
concern, not a sprint-01 deliverable.

---

## SKILL -- Ready-to-Run Codebase + Self-Fix Development Issues

### Purpose
The persisted `app/backend/` directory must be **immediately runnable** after
`npm install` -- no manual edits, no missing dependencies, no broken imports,
no TypeScript errors. A-05 is responsible for fixing any development issue
that appears during verification, iterating until the codebase is clean.

### Verification gates (must all pass before reporting DoD)

1. **Install** -- `npm install` in `app/backend/` exits 0.
2. **Type-check** -- `npm run lint` (`tsc --noEmit -p tsconfig.json`) reports
   zero errors.
3. **Tests** -- `npm test` (Vitest) passes every spec.
4. **Smoke boot** -- `npm run dev` boots within 5 seconds and logs the
   "BFF listening" message without throwing.
5. **Endpoint sanity** -- `curl -s http://localhost:4000/healthz` returns
   `{"status":"ok"}`; `curl -s http://localhost:4000/api-docs | jq '.total'`
   returns a positive integer.

### Self-fix loop

If any gate fails, A-05 iterates:
1. Read the failing tool output (`tsc` error, Vitest assertion, Node stack).
2. Localise to the offending file/line.
3. Patch the smallest change that resolves the root cause -- never silence
   the symptom.
4. Re-run the failing gate. Escalate after 3 failed attempts.

### Common dev issues + how to fix

| Symptom | Likely root cause | Fix |
|---|---|---|
| `Cannot find module '@/...'` at runtime | TS path alias not honoured by Node | Use `.js` relative imports OR add `tsconfig-paths` runtime hook |
| `TS2307: Cannot find module` for a dep | Missing from `package.json` | Add to `dependencies` (runtime) or `devDependencies` (test/types) |
| `ERR_REQUIRE_ESM` | CJS importing ESM-only package | Add `"type": "module"` to `package.json` and use `.js` extensions in imports |
| `EADDRINUSE :::4000` | Port collision | Tell the user; do NOT change the default silently |
| `Cannot read properties of undefined (reading 'X')` on boot | Env var unset, Zod parsed it to `undefined` | Add a Zod default in `src/config/env.ts` and a dev value in `.env.example` |
| Express 404 for a known route | Route ordering -- catch-all `*` mounted before route | Move catch-all to last |
| Pino "ERR_INVALID_ARG_TYPE" on boot | Logger constructed before env parsed | Import `env` above the logger init |
| Test fails with "Cannot find module './setup'" | Vitest `setupFiles` path wrong | Match `vitest.config.ts` path to actual file location |

### Hard rules

- Never disable a TypeScript rule with `// @ts-ignore` or `// @ts-expect-error`
  to make a build pass. Fix the type.
- Never delete a failing test to make `npm test` green. Fix the code.
- Never pin a dep version to a beta/rc to bypass a real bug.
- When in doubt about a version, prefer the latest LTS at sprint time -- never
  invent a version that does not exist on npm.

### Self-validation contract

Before A-05 reports task complete, the final lines of its return MUST
include a verification report:

```
Verification:
 npm install:   PASS / FAIL (<reason>)
 tsc --noEmit:  PASS / FAIL (<error count>)
 vitest:        PASS / FAIL (<failures>)
 dev boot:      PASS / FAIL (<stderr>)
 /healthz:      PASS / FAIL (<status>)
 /api-docs:     PASS / FAIL (<endpoints count>)
```

If running in the background-sub-agent contract (no tool execution after
return), A-05 instead documents the verification commands the main agent
should run post-persist, and notes the fixes it would apply if a gate fails.

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
# For staging/prod: <upper-env override or 'remove this'>
```

### What "dev-default" means

- Localhost-friendly: `PORT=4000`, `CORS_ORIGIN=http://localhost:5173`.
- Permissive in development only: `AUTH_DEV_BYPASS=1`, `LOG_LEVEL=info`,
  `ENABLE_API_DOCS=1`.
- Observability disabled by default: `OTEL_EXPORTER_OTLP_ENDPOINT=` (empty --
  skips OTel init via the existing safe-no-op path).
- Empty for secrets: never ship a real key. Set `JWKS_URI=` and rely on
  `AUTH_DEV_BYPASS=1` for dev.

### What "upper-env comment" means

For each variable, the comment after states the production override in a
single line. Examples:
- `# For staging/prod: AUTH_DEV_BYPASS=0 and configure JWKS_URI`
- `# For staging/prod: e.g. https://otel-collector:4317`
- `# For staging/prod: set to your frontend domain(s), comma-separated`
- `# For staging/prod: ENABLE_API_DOCS=0 (or omit) to disable the inventory endpoint`

### Where the defaults live

- `src/config/env.ts` Zod schema -- defaults match the dev values in
  `.env.example`. So even with no `.env` file present, the service boots
  in safe dev mode.
- `.env.example` -- ships in the repo; users copy to `.env` and override.
- `.env` -- gitignored.
- `README.md` -- documents the env model in one short section.

---

## SKILL -- Review Comment Implementation

### Purpose
Consume review comments (code-review + arch-review) filed against the
backend, implement each comment in `app/backend/`, and emit a comprehensive
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
owner: A-05                          # A-04 | A-05 | shared | other (see "Ownership routing")
severity: critical|high|medium|low|info
location: app/backend/src/middleware/auth.ts:43
reviewer: "Jane Doe"
date: 2026-05-13
---

## Comment
The comment text (markdown).

## Suggested fix (optional)
```

A-05 also accepts loose formats if the briefing names them: a single
`.csv` / `.xlsx` / `.json` in the folder, an inline list in the briefing
text, or a GitHub-PR-comment dump. Convert to the canonical frontmatter
format on ingest.

The frontmatter also accepts an explicit `owner:` field used for routing
between A-04 and A-05 (see "Ownership routing" below).

### Ownership routing -- how A-05 decides which comments are its

A-05 walks the entire `review-inputs/` tree (both `code-review/` and
`arch-review/`) and decides per file:

1. **Explicit `owner` field takes precedence:**
   - `owner: A-05`        -> include; this is mine.
   - `owner: shared`        -> include; implement the backend portion only,
                                cross-reference any frontend portion to A-04
                                in the `implementation` text.
   - `owner: A-04`        -> log as `not-applicable` (route to A-04).
   - `owner: A-06`/other  -> log as `not-applicable` (not a code-agent
                                deliverable; flag follow-up).

2. **Fallback inference from `location` when `owner` is absent:**
   - `app/backend/...`              -> mine.
   - `app/frontend/...`             -> not-applicable (route to A-04).
   - `agentic-pipeline/...`         -> not-applicable (pipeline infra;
                                       route to Orchestrator / human).
   - `sprints/...`                  -> not-applicable (artefact, not code).
   - empty / unparseable / unknown  -> not-applicable with
                                       `reason: "owner unclear; reviewer to
                                       add explicit owner: field"` and
                                       `followUp: true`.

3. **Every comment file in `review-inputs/` MUST appear in the ledger** --
   even if A-05 is logging it as `not-applicable`. This is how a reviewer
   can confirm nothing was silently dropped. The "Files modified" column
   stays empty for not-applicable entries; the "Reason" column cites the
   ownership-routing rule.

4. **`owner: shared` handshake:** both A-04 and A-05 include the comment
   in their respective ledger. Each agent implements the part it owns and
   cross-references the other agent's expected change in `implementation`
   (e.g. *"Added X-Request-Id propagation in src/middleware/requestLog.ts.
   A-04 must add a matching X-Request-Id header on outbound apiClient
   calls -- see CR-007 in A-04 ledger."*). If the other layer hasn't
   done its part yet at run time, status is `partially-implemented` with
   `followUp: true`.

### Processing rules

For each comment:
1. **Implement** when the comment is in-scope, has a clear fix, and the
   fix does not break a downstream contract (ED-### or HB-003 decisions).
2. **Partially implement** when the comment has multiple parts and only some
   apply. Document the implemented parts in `implementation`; document the
   skipped parts in `reason`.
3. **Defer** when the comment is in-scope but blocked by missing input
   (HB-### needed) or by a downstream task. Record the blocker.
4. **Reject** when the comment conflicts with HB-003 decisions, an RC-###
   acceptance criterion, or the BFF in-memory POC constraint. Cite the
   conflict.
5. **Not applicable** when the comment targets code A-05 does not own
   (e.g. a comment on `app/frontend/` filed in the backend folder).

After each implementation, run the Ready-to-Run gates (lint + test + dev
boot) before moving on -- a comment is not "implemented" until those still
pass. If a fix breaks them, either correct the fix or downgrade the status
to "partially-implemented" with a follow-up flag.

### Outputs

1. **Code changes** in `app/backend/` (and possibly `agentic-pipeline/scripts/`
   if a comment touches shared utilities).

2. **`sprints/<sprintId>/review-outputs/A-05-ledger.json`** -- the machine-
   readable status ledger:
   ```json
   {
     "agent": "A-05",
     "sprint": "sprint-01",
     "generatedAt": "2026-05-13T...",
     "summary": {
       "total": 25,
       "implemented": 18,
       "partially": 3,
       "deferred": 2,
       "rejected": 1,
       "notApplicable": 1
     },
     "comments": [
       {
         "id": "CR-001",
         "category": "code-review",
         "severity": "high",
         "location": "app/backend/src/middleware/auth.ts:43",
         "reviewer": "Jane Doe",
         "date": "2026-05-13",
         "comment": "Dev bypass should refuse to start in production",
         "status": "implemented",
         "implementation": "Added NODE_ENV check in src/config/env.ts; throws if AUTH_DEV_BYPASS=1 && NODE_ENV=production",
         "filesModified": ["app/backend/src/config/env.ts", "app/backend/src/middleware/auth.ts"],
         "reason": null,
         "followUp": false
       }
     ]
   }
   ```

3. **`sprints/<sprintId>/review-outputs/A-05-rework-report.xlsx`** --
   human-readable Excel report, produced by the shared utility:
   ```
   cd agentic-pipeline/scripts
   npm install                                    # first-time only
   npm run review-report -- --sprint <sprintId> --agent A-05
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
| Needs upstream decision (HB) before we can act | deferred + raise HB |
| Asks to remove an RC-### acceptance criterion | rejected (cite RC) |
| Asks to drop a HB-003 decision (e.g. switch off `userMatchCriteria: string[]`) | rejected (cite HB-003) |
| Filed in `code-review/` but targets `app/frontend/...` | not-applicable (route to A-04) |
| Same root cause as another comment in this batch | implemented once; cross-link via `implementation` |

### Self-validation before reporting DoD pass

- Every file in `review-inputs/code-review/` and `review-inputs/arch-review/`
  has a matching entry in the ledger.
- `summary` totals match the per-status counts in `comments[]`.
- The xlsx was generated and opens cleanly (script exit 0, file exists,
  `endsWith('.xlsx')`).
- All Ready-to-Run gates still pass on the modified `app/backend/`.
- For every `deferred` entry, the reason cites a specific HB-### or a
  downstream task; vague reasons ("complex", "out of scope") are rejected
  by the DoD check.
- For every `rejected` entry, the reason cites a specific RC-### or HB-###
  decision.

---

## SKILL -- Defect Dispute Authoring (DSP-BFF)

### Purpose
When A-05 receives a DEF-BFF-### from A-08 (BFF tester) during T-007 rework and
believes the defect is NOT a BFF code bug, A-05 authors a DSP-BFF-### dispute
rather than silently rejecting or "fixing" something that should not change. The
originating test agent (A-08) re-judges and writes the final verdict back to the
DSP body. The escalation path for a `requirement-mismatch` verdict is A-01r via
Orchestrator.

### Decision logic -- fix or dispute?

For each DEF-BFF-### in `$SPRINTS/sprint-##/tests/bff/test-results/defects/` whose
`owner:` is `A-05` or `shared`:

| Situation | Action |
|---|---|
| Real bug in `app/backend/` (logic, validation, status code, auth gate, logging) | **Fix** -- update code; do NOT author a DSP |
| Test asserts behaviour that contradicts the RC / ED contract | **Dispute** with `verdict: requirement-mismatch` (escalates to A-01r) |
| Test case has its own bug (request shape wrong, fixture wrong, env assumption) | **Dispute** with `verdict: test-case-incorrect` |
| Reported "defect" is the documented design (ED-### spec, HB-### decision, in-memory POC constraint) | **Dispute** with `verdict: not-a-defect` (cite the artefact + ID) |
| Defect is real but is owned by A-04 (UI rendering / client validation / route wiring) | Do not dispute -- log as `not-applicable` in the A-05 ledger and route to A-04 |
| Defect is genuinely a BFF bug AFTER re-reading the RC + ED | **Fix** -- the rebuttal would be `valid-defect`; do not waste a DSP cycle |

If in any doubt, fix it. Disputes are the exception, not the default escape valve.

### DSP-BFF-###.md schema

Path: `$SPRINTS/sprint-##/tests/bff/test-results/disputes/DSP-BFF-###.md`

Frontmatter (validated by `V-shared-dispute-schema.ps1 -Layer bff` -- all keys are
required; missing or invalid values FAIL Tier-1 schema check):

```
---
id: DSP-BFF-001
defect-ref: DEF-BFF-021                  # must match /^DEF-BFF-\d+/
disputer: A-05
verdict: not-a-defect                    # one of: not-a-defect | test-case-incorrect | requirement-mismatch | valid-defect
date: 2026-05-15
---

## Disputed defect
DEF-BFF-021 reported that `POST /promotions` returns 400 when `endDate` is
omitted, claiming it should default to 30 days from `startDate`.

## Why this is not a BFF bug
ED-007 §RequestBody marks `endDate` as REQUIRED. HB-003 records the team
decision to reject promotions without an explicit end date. The validation
behaviour matches the contract.

## Recommended action
A-08 to amend TC-BFF-034 to assert the 400 response on missing `endDate`,
not the absent default.

<!-- A-08 fills the section below on re-judgement -->
## A-08 verdict
(to be written by A-08 after re-examining DEF + TC + RC + ED)
```

### dispute-summary.json -- routing contract emitted by A-05

A-05 writes ONE summary file per sprint at:
`$SPRINTS/sprint-##/tests/bff/test-results/dispute-summary.json`

Shape (consumed by A-00 and `build-velocity-report.ps1`):

```json
[
  { "id": "DSP-BFF-001", "verdict": "not-a-defect",        "defectRef": "DEF-BFF-021", "disputer": "A-05" },
  { "id": "DSP-BFF-002", "verdict": "requirement-mismatch","defectRef": "DEF-BFF-037", "disputer": "A-05" }
]
```

The verdict in the summary is the ORIGINATING verdict A-05 asserted. The final
verdict (after A-08 re-judges) lives in the DSP body, not in this summary.

### Lifecycle -- who does what

1. A-08 emits DEF-BFF-### with `owner: A-05` or `shared` and a `defect-summary-bff.json` entry.
2. A-05 (this agent) decides per the table above:
   - **Fix path**: edit code, re-run Ready-to-Run gates, update DEF status -> `resolved`.
   - **Dispute path**: write DSP-BFF-###.md, append to dispute-summary.json, leave DEF
     status `open` with `dispute: DSP-BFF-###` cross-reference in the ledger.
3. Orchestrator routes each DSP back to A-08 for re-judgement.
4. A-08 reads + re-judges:
   - Accept dispute -> DEF status `closed`, reason written into DSP body.
   - Reject dispute -> DEF status stays `open`, re-justification in DSP body.
5. If A-05's dispute verdict is `requirement-mismatch`, Orchestrator additionally
   escalates to A-01r (requirement resolver) regardless of A-08's verdict.

### Hard rules
- Never delete a DSP-BFF-###.md. The full thread (A-05 assertion + A-08 verdict)
  is the audit trail.
- Never write a DSP without `defect-ref` -- the validator rejects it and the
  Orchestrator cannot route it.
- Never write a DSP with `verdict: valid-defect` -- that means "fix it", not "dispute it".
  Use the fix path instead.
- Both DSP files and `dispute-summary.json` are emitted in the SAME T-007 cycle.
  The summary file is what A-00 watches for; missing it stalls the routing loop.

### Self-validation before reporting DoD pass
- For every DEF-BFF A-05 chose to dispute, a DSP-BFF-###.md exists with all five
  required frontmatter keys and a body explaining the assertion.
- `dispute-summary.json` contains exactly one entry per DSP-BFF file authored
  this sprint; verdicts match the frontmatter verdicts.
- `V-shared-dispute-schema.ps1 -Layer bff` exits 0 (no Tier-1 schema violations).
- The A-05 ledger cross-references each disputed DEF-BFF with `dispute: DSP-BFF-###`
  so the rework report shows which defects A-05 disputed vs fixed vs deferred.

---

## SKILL -- Env Bootstrap

### Purpose
Automatically create `app/backend/.env` from `.env.example` if it does not exist, then
signal the Orchestrator to raise a human blocker so the user reviews the file before the
pipeline continues. `.env` is never overwritten once it exists — user edits are preserved.

### When to run
After `.env.example` has been written to `app/backend/` as part of T-005 implementation.

### Steps

1. Check whether `app/backend/.env` exists.
2. **Already exists** → skip entirely. Do not overwrite. No blocker raised.
3. **Does not exist** →
   a. Copy the full content of `app/backend/.env.example` to `app/backend/.env`.
   b. Scan `.env.example` for every variable whose comment line (the line immediately
      before the variable assignment) contains `# For staging/prod:` — these are the
      env-sensitive variables to surface to the user.
   c. Include the following block verbatim in your Protocol 4 completion report:

      ```
      ENV_CREATED_HB: app/backend/.env
      ENV_VARS_TO_REVIEW:
        AUTH_DEV_BYPASS=1                         # For staging/prod: AUTH_DEV_BYPASS=0 and configure JWKS_URI
        CORS_ORIGIN=http://localhost:5173          # For staging/prod: set to your frontend domain(s), comma-separated
        OTEL_EXPORTER_OTLP_ENDPOINT=              # For staging/prod: e.g. https://otel-collector:4317
        ENABLE_API_DOCS=1                         # For staging/prod: ENABLE_API_DOCS=0 (or omit)
        <...any other vars whose preceding line contains "# For staging/prod:"...>
      ```

   d. Do NOT self-declare T-005 complete. Signal `ENV_CREATED_HB` so the Orchestrator
      raises HB-### and holds next-agent activation until the user confirms the `.env`.

### Hard rules
- Never overwrite an existing `.env`. Idempotent by design.
- The `ENV_CREATED_HB` block must list every variable with a `# For staging/prod:` comment
  in `.env.example` — full visibility for the user even when dev defaults are safe.
- If `.env.example` does not yet exist when Env Bootstrap runs, write it first (per
  SKILL: Dev-Default Env Config), then proceed with step 3 above.

---

## VERSION HISTORY
| Version | Date       | Author            | Changes                                                                                          |
|---------|------------|-------------------|--------------------------------------------------------------------------------------------------|
| 0.1     | 2026-05-13 | Architecture Lead | Skeleton created                                                                                 |
| 0.2     | 2026-05-13 | Architecture Lead | Filled in Sections 2-6 from sprint-01 backend implementation; added SKILL: Runtime Endpoint Documentation (zod-to-json-schema served via `GET /api-docs`) |
| 0.3     | 2026-05-13 | Architecture Lead | Added SKILL: Ready-to-Run Codebase + Self-Fix Development Issues; added SKILL: Dev-Default Env Config with Upper-Env Comments |
| 0.4     | 2026-05-13 | Architecture Lead | Added SKILL: Review Comment Implementation (consume `review-inputs/`, emit ledger JSON + Excel report at `review-outputs/`). Workspace folder renamed from `pipeline/` to `agentic-pipeline/`. |
| 0.5     | 2026-05-15 | Architecture Lead | Added SKILL: Defect Dispute Authoring (DSP-BFF) -- DSP decision logic, DSP-BFF-###.md frontmatter schema, `dispute-summary.json` shape, A-08 re-judgement handshake, escalation to A-01r on `requirement-mismatch`. |
| 0.6     | 2026-05-21 | Architecture Lead | Added SKILL: Env Bootstrap -- auto-create app/backend/.env from .env.example on first run; ENV_CREATED_HB blocking signal; DoD checklist item added to Section 5. |
