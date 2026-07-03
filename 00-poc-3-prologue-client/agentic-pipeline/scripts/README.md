# agentic-pipeline/scripts

Shared one-off scripts for the agentic delivery pipeline. Kept separate from
`app/frontend/` and `app/backend/` so script-only deps (e.g. `exceljs`) do
not pollute the application package files.

## Install

```
cd agentic-pipeline/scripts
npm install
```

## Available scripts

### `build-review-report.mjs`

Reads a review-rework ledger JSON produced by A-04 or A-05 at the end of
a rework cycle, and emits a comprehensive `.xlsx` report.

**Run via the npm script:**

```
npm run review-report -- --sprint sprint-01 --agent A-05
```

**Or invoke directly:**

```
node build-review-report.mjs --sprint sprint-01 --agent A-05
node build-review-report.mjs --ledger path/to/ledger.json --out path/to/report.xlsx
```

**Default paths** (when `--sprint` + `--agent` are used):
- Input:  `sprints/<sprint>/review-outputs/<agent>-ledger.json`
- Output: `sprints/<sprint>/review-outputs/<agent>-rework-report.xlsx`

**Ledger schema** -- see SKILL: Review Comment Implementation in:
- `agentic-pipeline/.claude/agents/A-04-frontend-developer-skills.md`
- `agentic-pipeline/.claude/agents/A-05-backend-developer-skills.md`

**Excel output structure:**
- Sheet 1 -- "Summary": agent, sprint, generated-at, totals, per-category and
  per-severity breakdowns.
- Sheet 2 -- "Comments": one row per review comment with ID, category,
  severity, location, comment text, status, implementation summary, files
  modified, reason (if not implemented), and follow-up flag. Status,
  severity, and category cells are colour-coded badges.
