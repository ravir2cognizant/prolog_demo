# Tests -- sprint-01

Test agents write to this tree:
- `fe\`           -- A-07 (FE Test Agent)  -- Vitest + Playwright + MSW
- `bff\`          -- A-08 (BFF Test Agent) -- Vitest + supertest + Pact
- `microservice\` -- reserved for A-09 (microservice test agent, future)
- `db\`           -- reserved for A-10 (DB test agent, future)

## Per-layer folder layout
- `<layer>\test-cases\`                  -- TC-*.md test-case specs
- `<layer>\test-results\`                -- TR-*.md per-case results + TR-summary.html
- `<layer>\test-results\defects\`        -- DEF-*.md defect files (routed by `owner:` tag)
- `<layer>\test-results\disputes\`       -- DSP-*.md dispute files written by dev agents

## JSON routing contracts (emitted with the Markdown)
- `fe\test-results\defect-summary-fe.json`   -- routing summary for A-00
- `bff\test-results\defect-summary-bff.json` -- routing summary for A-00
- Dev agents emit `dispute-summary.json` in their layer folder when raising DSPs

## Read-only contract
Test agents write here. Dev agents (A-04, A-05) READ defects, WRITE disputes only.
Orchestrator reads JSON summaries only (not Markdown content) for routing.
