# SCAFFOLD-PIPELINE.md — Setup Guide

`SCAFFOLD-PIPELINE.md` is a single-file bootstrap for the Agentic Delivery Pipeline.
It contains every pipeline file (agents, hooks, scripts, config, KBs) embedded inside it.
One file. One command. Full pipeline in ~30 seconds.

---

## What you need before starting

| Requirement | Version | Where to get it |
|-------------|---------|-----------------|
| Claude Code CLI | latest | https://claude.ai/code (requires Claude Pro or Team) |
| Node.js | 22+ | https://nodejs.org |
| PowerShell | 5.1+ | Pre-installed on Windows; `winget install Microsoft.PowerShell` for PS 7 |

Set PowerShell execution policy once (Windows only):
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## Setup in 4 steps

### Step 1 — Create a fresh workspace folder

Create an empty folder anywhere on your machine:

```
C:\MyWork\my-project\
```

### Step 2 — Drop the bootstrap file in

Copy `SCAFFOLD-PIPELINE.md` into the folder root:

```
C:\MyWork\my-project\
  SCAFFOLD-PIPELINE.md       ← this file
```

No other files needed. The folder should be otherwise empty.

### Step 3 — Open Claude Code

Open a terminal in your new folder and launch Claude Code:

```
cd C:\MyWork\my-project
claude
```

Claude Code starts in the folder. You will see the `>` prompt (no CLAUDE.md has loaded yet — that's normal).

### Step 4 — Run the scaffold command

At the Claude Code prompt, say:

```
scaffold from SCAFFOLD-PIPELINE.md
```

Claude reads the bootstrap file and creates all pipeline folders and files.
When it finishes, it reports exactly how many files were created and gives you two remaining steps.

---

## What gets created

After scaffolding, your workspace looks like this:

```
C:\MyWork\my-project\
  .ignore                         ← excludes node_modules/ from all code searches (Grep, Glob, A-06 review)
  .claude\
    CLAUDE.md                       ← compact co-worker instructions (auto-loaded by Claude Code)
    settings.local.json.template    ← copy and edit this (Step 5b below)
    settings.json.example           ← Claude Code lifecycle hooks config (copy to settings.json, Step 5c)
    kb\
      agentic-delivery-core-kb.md   ← pipeline protocols + DoD definitions
      cost-optimization-kb.md       ← Protocol 5 cost-discipline rules (Section 11B: hook infra)
      workspace-ref.md              ← pipeline run order + workspace structure
  agentic-pipeline\
    agents\                         ← 12 agent activation files (CLAUDE-A-*.md)
    hooks\                          ← 16 hook scripts (12 agent hooks H-*.ps1 + 4 Claude Code lifecycle hooks)
    telemetry\                      ← session telemetry (sessions/ + rollups.jsonl, created at runtime)
    scripts\
      validators\                   ← 12 Tier-1 validator scripts
      build-test-report.ps1         ← generates TR HTML from vitest JSON
      build-velocity-report.ps1     ← generates sprint velocity report
      build-review-report.mjs       ← generates code-review Excel report
      manifest-writer.ps1           ← writes rows to orchestrator-manifest.md
      build-bootstrap.ps1           ← regenerates SCAFFOLD-PIPELINE.md (for pipeline maintainers)
      workspace-setup.ps1           ← bootstrap workspace structure
      start-sprint.ps1              ← creates sprint folder structure
      select-model.ps1              ← picks agent model tier
      route-defects.ps1             ← routes defects to owning agents
    orchestrator-manifest.md        ← live pipeline state
    audit-log.md                    ← append-only event log
    NOTIFICATIONS.md                ← human action-required alerts
    workspace-config.sample.json    ← copy and edit this (Step 5 below)
    agentic-pipeline-flow.drawio    ← visual pipeline flow diagram
  SCAFFOLD-PIPELINE.md              ← the bootstrap file (kept for reference; not loaded by Claude Code)
```

---

## Two manual steps after scaffolding

Claude Code will remind you of these, but here they are upfront:

### Step 5a — Configure your workspace path

```powershell
cd C:\MyWork\my-project
copy agentic-pipeline\workspace-config.sample.json agentic-pipeline\workspace-config.json
```

Open `agentic-pipeline\workspace-config.json` and set `workspaceRoot` to your folder's absolute path:

```json
{
  "workspaceRoot": "C:\\MyWork\\my-project"
}
```

Mac/Linux: use forward slashes — `"workspaceRoot": "/Users/you/my-project"`

### Step 5b — Configure Claude Code permissions

```powershell
copy .claude\settings.local.json.template .claude\settings.local.json
```

Open `.claude\settings.local.json` and replace `WORKSPACE_ROOT_PATH` with the same absolute path you used above.

### Step 5c — Configure Claude Code session hooks (cost guard + telemetry)

```powershell
copy .claude\settings.json.example .claude\settings.json
```

Open `.claude\settings.json` and replace every `<WORKSPACE_ROOT>` placeholder with your absolute workspace path.
This wires 4 Claude Code lifecycle hooks: `cost-guard` (PreToolUse), `telemetry-log` (PostToolUse),
`trace-rollup` (Stop), and `context-warn` (UserPromptSubmit). All are non-blocking except cost-guard,
which blocks at 300 tool calls/session to prevent runaway cost.

> **Windows PowerShell note:** The hooks use `powershell` (Windows PowerShell 5.1). If you are on
> PowerShell 7 (`pwsh`), replace `powershell` with `pwsh` in the four command strings.

---

## First run — start your first sprint

Once steps 5a and 5b are done, say in Claude Code:

```
Activate Sprint Manager
```

Sprint Manager asks for a sprint ID (e.g. `sprint-01`) and a short name (e.g. `"Account management"`).
It creates `sprints\sprint-01\req-inputs\` and tells you to drop your requirement files in.

**Accepted input formats:** `.png .jpg .pdf .docx .txt .md .xlsx .csv .yaml .json .xml`
or any Agile export (Jira, Azure DevOps, Trello). No specific structure required.

---

## What's NOT included in the bootstrap

These files are intentionally excluded (machine-specific paths or proprietary content):

| File | Why excluded | How to get it |
|------|-------------|---------------|
| `.claude\settings.json` | Machine-specific absolute paths | Created in Step 5c from `settings.json.example` |
| `.claude\kb\master-arch-coworker.md` | Project-specific architecture KB | Obtain from your team's shared repository |
| `.claude\kb\fiserv-arch-coworker.md` | Fiserv platform KB | Obtain from your team's shared repository |

Drop the KB files into `.claude\kb\` manually after scaffolding.
The pipeline runs fully without them — agents use them only for project-specific architecture questions.

---

## Why the bootstrap is a separate file (not `.claude\CLAUDE.md`)

`.claude\CLAUDE.md` is auto-injected by Claude Code on **every** turn. At 626 KB, placing the bootstrap
there would cost thousands of tokens per message for the lifetime of the workspace.

Instead:
- `SCAFFOLD-PIPELINE.md` sits in the workspace root — Claude Code does **not** auto-load it
- It is read exactly **once** (during scaffold)
- The compact 45-line `.claude\CLAUDE.md` is written as the final scaffolding step and takes over for all future sessions
- `SCAFFOLD-PIPELINE.md` stays in the folder as a reference but has zero per-session cost

---

## Pipeline overview

```
A-SM  Sprint Manager         validates inputs, registers sprint
A-00  Orchestrator           coordinates agents, owns the manifest
A-01  Requirement Analyst    produces RC-###.md cards from any input format
      Sign-off gate          6 agents batch-review RC cards in one pass
A-02  BFF Designer           produces ED-###.md endpoint designs
A-03a UI Style Compiler      produces design tokens + Tailwind theme
A-03b UI Component Inv.      produces CI-###.md component inventories
A-07  FE Test Agent          T-009: TC-FE-*.md + t009.spec.ts draft
A-08  BFF Test Agent         T-010: TC-BFF-*.md + t010.spec.ts draft
A-04  Frontend Developer  ┐  T-004: React 18 + TypeScript (app\frontend\)
A-05  Backend Developer   ┘  T-005: Node.js 22 / Express 4 BFF (app\backend\)  ← parallel
A-06  Code Reviewer          T-006: review-report.md + rework routing
A-07  FE Test Agent          T-011: run FE tests, produce failures-fe.md
A-08  BFF Test Agent         T-012: run BFF tests, produce failures-bff.md
```

Full 28-step run order: `.claude\kb\workspace-ref.md` (created by scaffold).
Visual diagram: `agentic-pipeline\agentic-pipeline-flow.drawio` (open in draw.io).

---

## Updating the bootstrap (for pipeline maintainers)

When the pipeline is updated, regenerate `SCAFFOLD-PIPELINE.md` from the source workspace:

```powershell
cd C:\path\to\poc-workspace
powershell -File agentic-pipeline\scripts\build-bootstrap.ps1 -WorkspaceRoot . -OutputPath SCAFFOLD-PIPELINE.md
```

This re-reads all files from `dist\` and writes a fresh `SCAFFOLD-PIPELINE.md`.
Share the regenerated file with your team.

---

## Troubleshooting

**Claude says it cannot find SCAFFOLD-PIPELINE.md**
Make sure you ran `claude` from the folder that contains `SCAFFOLD-PIPELINE.md`, not a subfolder.
Check with: `ls` (Mac/Linux) or `dir` (Windows) — the file should be listed.

**Scaffold completed but `workspace-config.json` is missing**
That file is intentionally not created by scaffold (it is machine-specific). Follow Step 5a above.

**Hook returns `BLOCKED:DEPENDENCY_NOT_COMPLETE`**
A prerequisite task has not been marked complete in `agentic-pipeline\orchestrator-manifest.md`.
Check the manifest Task Registry for the dependency status, or ask the Orchestrator:
`Activate Orchestrator` → it will diagnose the blockage.

**Agent produces nothing / seems confused**
Run `/compact` in Claude Code to clear context bloat, then re-activate the agent.
Three mandatory compact points in the pipeline: after T-GATE, after design phase, after T-005.

**PowerShell permission denied on hooks**
Run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` once (see Prerequisites above).
