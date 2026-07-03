# workspace-ref.md -- Workspace Reference KB
# Moved from CLAUDE.md 2026-05-21 (Sprint-01 cost improvement item 10).
# Read on demand; not injected every turn.

---

## WORKSPACE QUICK REFERENCE

Structure (lazy-creation rule -- a fresh workspace shows ONLY agentic-pipeline/):
  agentic-pipeline\   Agent infrastructure -- manifest, hooks, agents, scripts. Always present.
  sprints\sprint-##\  Sprint artefacts. Folder created on first .\start-sprint.ps1 run.
  app\frontend\       Frontend code -- NOT sprint-scoped. Created on first A-04 activation by H-04.
  app\backend\        Backend code  -- NOT sprint-scoped. Created on first A-05 activation by H-05.

Key files:
  agentic-pipeline\orchestrator-manifest.md          Pipeline state -- check for current status
  agentic-pipeline\NOTIFICATIONS.md                  Human blockers and alerts
  agentic-pipeline\audit-log.md                      Append-only event log (archived at sprint close)
  agentic-pipeline\briefings\current-sprint-state.md Sprint snapshot -- read on session resume

Path variables:
  $ROOT     = POC-WORKSPACE\
  $APP      = app\
  $SPRINTS  = sprints\
  $PIPELINE = agentic-pipeline\

---

## PIPELINE RUN ORDER

Step 1:  Activate Sprint Manager       -- validates inputs, registers sprint
Step 2:  Activate Orchestrator         -- initialises manifest, activates A-01
Step 3:  Activate Requirement Analyst  -- reads ALL input files, produces RC cards + cross-sprint-refs.json
Step 4:  Activate Orchestrator         -- opens sign-off gate

  [SIGN-OFF GATE -- PREFERRED: batch mode]
  Orchestrator reads all RC cards once and cycles through all 6 signing-agent perspectives
  (A-02 → A-03b → A-04 → A-05 → A-07 → A-08) in one foreground pass. Use individual
  agent activation only when a CNC concern requires that agent's clarification loop.

Step 5:  Activate BFF Designer         -- reviews RC cards (READ-ONLY), signs off       [skip if batch-signed]
Step 6:  Activate UI Component Inv.    -- reviews RC cards (READ-ONLY), signs off (03b) [skip if batch-signed]
Step 7:  Activate Frontend Dev         -- reviews RC cards (READ-ONLY), signs off        [skip if batch-signed]
Step 8:  Activate Backend Dev          -- reviews RC cards (READ-ONLY), signs off        [skip if batch-signed]
Step 9:  Activate FE Test Agent        -- reviews RC cards (READ-ONLY), signs off        [skip if batch-signed]
Step 10: Activate BFF Test Agent       -- reviews RC cards (READ-ONLY), signs off        [skip if batch-signed]
Step 11: Activate Orchestrator         -- gate open, activates A-02 + A-03a + A-07 + A-08
         /compact [COMPACT-1 -- post-gate, pre-design -- A-00 issues before activating design agents]
Step 12: Activate UI Style Compiler    -- produces ui-style-outputs (tokens, theme, MD)
Step 13: Activate BFF Designer         -- produces ED-###.md endpoint designs
Step 14: Activate FE Test Agent        -- T-009: produces TC-FE-*.md + t009.spec.ts draft
Step 15: Activate BFF Test Agent       -- T-010: produces TC-BFF-*.md + t010.spec.ts draft (+ schema self-validation)
Step 16: Activate UI Component Inv.    -- produces CI-###.md component inventories (after 03a)
         /compact [COMPACT-2 -- post-design, pre-impl -- A-00 issues after T-003b + T-010 complete]

  [IMPLEMENTATION -- MANDATORY Case A parallel spawn]
  A-00 spawns A-04 + A-05 as parallel sub-agents (direct-disk-write). No sequential run.
  Both count as 1 of the 2-spawn budget for the sprint.

Step 17: Activate Orchestrator         -- pre-authorises Write/Edit; spawns A-04 + A-05 as Case A parallel
Step 18: (parallel) Activate Backend Dev   -- T-005: implements BFF in app\backend\   [sub-agent, direct-disk-write]
Step 19: (parallel) Activate Frontend Dev  -- T-004: implements React 18 UI in app\frontend\ [sub-agent, direct-disk-write]
Step 20: Activate Orchestrator         -- awaits both; proceeds after both complete
         /compact [COMPACT-3 -- post-impl, pre-review -- A-00 issues after T-005 complete]
Step 21: Activate Code Reviewer        -- T-006: review-report.md + review-summary.json
Step 22: Activate FE Test Agent        -- T-011: failures-fe.md + defect-summary-fe.json
Step 23: Activate BFF Test Agent       -- T-012: failures-bff.md + defect-summary-bff.json
         [NOTE: T-011 + T-012 run as Case A parallel sub-agents for Playwright/large suites (>30 TCs);
          sequential foreground is acceptable for fast vitest suites]
Step 24: Activate Orchestrator         -- if rework needed: route CRs + DEFs to A-04/05 (T-007)
         [ALSO: scan defects for in-session fix candidates (severity ≤ medium, fix ≤ 20 lines)]
Step 25: Activate Code Reviewer        -- T-008 re-review
Step 26: Activate FE Test Agent        -- T-013: re-execute FE tests
Step 27: Activate BFF Test Agent       -- T-014: re-execute BFF tests
Step 28: Activate Orchestrator         -- sprint complete, archive audit log + manifest, signals Sprint Manager

---

## INPUT FILES (Requirement Analyst accepts ANY format)

Drop any files into sprints\sprint-##\inputs\ -- no requirements.md needed upfront.
A-01 reads everything and auto-produces requirements.md from whatever is there.

Accepted: .png .jpg .jpeg .webp .pdf .docx .txt .md .xlsx .xls .csv
          .yaml .yml .json .xml or any Agile export (Jira, Azure DevOps, Trello)
