# Agentic Delivery Pipeline -- Getting Started

A Claude Code-powered multi-agent delivery pipeline that takes requirements to
working React + BFF code through a structured, protocol-driven workflow.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| [Claude Code CLI](https://claude.ai/code) | latest | Requires Claude Pro/Team subscription |
| Node.js | 18+ | For frontend builds |
| PowerShell | 5.1+ | Already present on Windows; `pwsh` on Mac/Linux |
| draw.io Desktop | optional | To view `agentic-pipeline/agentic-pipeline-flow.drawio` |

---

## Setup (5 steps)

### 1. Copy this folder to your machine

Copy the entire `poc-workspace/` folder to any path on your machine, e.g.:

```
C:\MyWork\poc-workspace\
```

### 2. Configure workspace path

```
cp agentic-pipeline\workspace-config.sample.json  agentic-pipeline\workspace-config.json
```

Open `agentic-pipeline\workspace-config.json` and set `workspaceRoot` to your
absolute folder path:

```json
"workspaceRoot": "C:\\MyWork\\poc-workspace"
```

Mac/Linux: use forward slashes — `"workspaceRoot": "/Users/you/poc-workspace"`

### 3. Configure Claude Code permissions

```
cp .claude\settings.local.json.template  .claude\settings.local.json
```

Open `.claude\settings.local.json` and replace `WORKSPACE_ROOT_PATH` with your
absolute workspace path (same value as `workspaceRoot` above).

### 4. Set PowerShell execution policy (Windows only)

Run once in PowerShell as your user:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### 5. Open workspace in Claude Code

```
cd C:\MyWork\poc-workspace
claude
```

Claude Code will auto-load `.claude\CLAUDE.md` and you'll be in **Co-worker mode**.

---

## Quick Start -- Run Your First Sprint

### Step A: Add your requirements

Create the sprint inputs folder and drop in your requirements:

```
sprints\sprint-01\inputs\
```

Accepted formats: `.png .jpg .pdf .docx .txt .md .xlsx .csv .yaml .json .xml`
or any Agile export (Jira, Azure DevOps, Trello). No specific format required --
the Requirement Analyst reads anything.

### Step B: Start the pipeline

In Claude Code, type these commands in order (each one activates the next agent):

```
Activate Sprint Manager
```

Follow the 27-step pipeline sequence shown in `.claude\CLAUDE.md` under
**PIPELINE RUN ORDER**. Each "Activate [Agent]" command switches Claude into
that agent's role in the same session.

### Step C: Review outputs

Sprint artefacts land in:
```
sprints\sprint-01\
  inputs\          -- your inputs (unchanged)
  requirements\    -- RC-###.md requirement cards (A-01 output)
  designs\         -- ED-###.md endpoint designs, CI-###.md UI inventories
  test-cases\      -- TC-FE-*.md + TC-BFF-*.md test plans
  review-inputs\   -- bundles for code review
  review\          -- review-report.md + summary JSON
  test-results\    -- TR-FE-*.md + TR-BFF-*.md + defect summaries

app\frontend\      -- React 18 + TypeScript UI (all sprints, cumulative)
app\backend\       -- BFF Node.js/Express API  (all sprints, cumulative)
```

---

## Pipeline Architecture

```
Human Operator
    │
    ▼
A-SM  Sprint Manager    ──  validates inputs, registers sprint
A-00  Orchestrator      ──  coordinates all agents, owns manifest
    │
    ├─► A-01  Requirement Analyst  ──  RC cards from any input format
    │         (sign-off gate: 6 agents review RC cards)
    │
    ├─► A-02  BFF Designer         ──  endpoint designs (ED-###.md)
    ├─► A-03a UI Style Compiler    ──  design tokens + theme
    ├─► A-03b UI Component Inv.    ──  component inventory (CI-###.md)
    ├─► A-07  FE Test Agent        ──  FE test cases + test execution
    ├─► A-08  BFF Test Agent       ──  BFF test cases + test execution
    │
    ├─► A-04  Frontend Developer   ──  React 18 UI (app\frontend\)
    ├─► A-05  Backend Developer    ──  BFF API   (app\backend\)
    │
    └─► A-06  Code Reviewer        ──  review report + rework routing
```

Detailed flow: open `agentic-pipeline\agentic-pipeline-flow.drawio` in draw.io.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `agentic-pipeline\orchestrator-manifest.md` | Live pipeline state (A-00 owns this) |
| `agentic-pipeline\NOTIFICATIONS.md` | Human action required -- check when blocked |
| `agentic-pipeline\audit-log.md` | Append-only event log |
| `agentic-pipeline\workspace-config.json` | Your machine path config (gitignored) |
| `.claude\kb\agentic-delivery-core-kb.md` | Agent protocols + DoD definitions |
| `.claude\kb\cost-optimization-kb.md` | Protocol 5 cost rules |

---

## Troubleshooting

**"Hook returned BLOCKED"**
Check `agentic-pipeline\NOTIFICATIONS.md` -- the hook wrote the reason there.

**"Cannot find path workspace-config.json"**
Confirm you completed Setup Step 2 (copy sample + set workspaceRoot).

**Agent produces nothing / seems confused**
Run `/compact` in Claude Code to reduce context bloat, then re-activate the agent.

**PowerShell hook permission denied**
Confirm Setup Step 4 (execution policy) and Step 3 (settings.local.json).

---

## What's NOT Included

These files are NOT in this distribution package (they are machine-specific
or contain proprietary content):

- `.claude\kb\master-arch-coworker.md` -- project-specific knowledge
- `.claude\kb\fiserv-arch-coworker.md` -- project-specific knowledge
- `agentic-pipeline\workspace-config.json` -- your machine path (create from sample)
- `sprints\` -- runtime sprint artefacts
- `app\` -- built application code
