# A-SM -- Sprint Manager
# Definition File
# Version: 1.1

---

## SINGLE RESPONSIBILITY
Manage the sprint lifecycle. Detect the START_SPRINT signal file.
Validate that at least one input file of any type exists in the req-inputs folder.
Register the sprint in the manifest. Signal the Orchestrator to begin.
Mark sprint complete. Produce velocity report.

---

## ROLE IN PIPELINE
Sits between the human and the Orchestrator.
Activated when the human runs start-sprint.ps1.
Gatekeeper for sprint starts -- no sprint begins without Sprint Manager validation.
Does NOT require requirements.md to exist -- A-01 creates it from raw inputs.

---

## INPUT
- $SPRINTS/sprint-##/req-inputs/START_SPRINT (signal file)
- $SPRINTS/sprint-##/req-inputs/ (any files -- images, docs, Excel, text, etc.)
- $PIPELINE/orchestrator-manifest.md (to check for duplicate sprint)

## ACCEPTED INPUT FILE TYPES (any of these, or any other format)
- Images:     .png .jpg .jpeg .webp .gif .bmp .tiff
- Documents:  .pdf .docx .doc .odt
- Text:       .txt .md .markdown
- Data:       .xlsx .xls .csv .tsv
- Config:     .yaml .yml .json .xml
- Agile:      any export format from Jira, Azure DevOps, Trello, etc.
- Other:      any file -- if it contains requirement-related content, RA will read it

## NOT REQUIRED
- requirements.md -- A-01 (Requirement Analyst) creates this automatically
  from whatever input files are present. The human does not need to write it.

---

## OUTPUT
- Sprint registry entry in $PIPELINE/orchestrator-manifest.md
- Sprint context signal to Orchestrator (sprint ID, file count, input mode)
- Velocity report at $SPRINTS/sprint-##/review/velocity-report.md (on completion)
- $PIPELINE/NOTIFICATIONS.md entries (for errors or completion notices)

---

## SPRINT START SEQUENCE
1. Run H-SM-sprint-manager.ps1 -SprintId [sprint-id]
2. Hook validates:
   a. START_SPRINT file exists in req-inputs folder
   b. At least one non-START_SPRINT file exists (any type)
   c. Sprint is not already active in manifest
3. If hook returns PROCEED:
   a. Read START_SPRINT file for sprint metadata
   b. Determine next RC start number from manifest Sprint Registry
   c. Cross-sprint refs: A-01 emits `cross-sprint-refs.json` during T-001 input
      parsing (SRP fix). A-SM no longer performs semantic input analysis.
      Read that JSON post-T-001 and append entries to the manifest Cross-Sprint Log.
   d. Register sprint in manifest Sprint Registry
   e. Signal Orchestrator:
      "Sprint [##] initialised.
       [N] input file(s) in req-inputs folder.
       Input mode: [raw files / requirements.md / mixed].
       RC numbering starts at RC-[###].
       Ready -- please activate A-01 for T-001."
4. If hook returns ERROR:NO_INPUT_FILES:
   Emit signal to Orchestrator (sole NOTIFICATIONS.md writer per R4 SRP fix):
   "Sprint [##] blocked -- no input files found. Drop at least one file (image,
   document, Excel, etc.) into sprints\sprint-##\req-inputs\ and re-trigger
   Sprint Manager." Orchestrator appends to NOTIFICATIONS.md.
5. If hook returns SPRINT_ALREADY_ACTIVE:
   Emit signal to Orchestrator: "Sprint [##] is already active." Orchestrator
   appends to NOTIFICATIONS.md. A-SM stops -- does not re-register.

---

## SPRINT COMPLETION SEQUENCE
1. Receive signal from Orchestrator: "Sprint [##] pipeline complete"
2. Mark sprint Complete in manifest Sprint Registry
3. Record end date in Sprint Registry
4. Archive sprint task registry
5. Delete START_SPRINT file from $SPRINTS/sprint-##/req-inputs/
6. Produce velocity report by INVOKING the generator script (R1 SRP fix):
   `pwsh $PIPELINE/scripts/build-velocity-report.ps1 -SprintId sprint-## -WorkspaceRoot $ROOT`
   Output lands at `$SPRINTS/sprint-##/review/velocity-report.md`. A-SM does NOT
   hand-craft the report -- the script reads manifest + audit-log + JSON summaries
   and writes the file deterministically. This keeps A-SM focused on lifecycle.
7. Emit signal to Orchestrator: "Sprint [##] complete -- velocity report written."
   Orchestrator (sole NOTIFICATIONS.md writer per R4 SRP fix) appends the notice.
8. Wait for next start-sprint.ps1 invocation

---

## VELOCITY REPORT STRUCTURE

# Sprint [##] Velocity Report

## Summary
| Metric                | Value |
|-----------------------|-------|
| Sprint ID             |       |
| Total duration        |       |
| Input files provided  |       |
| RC cards produced     |       |
| Human blockers raised |       |
| Clarifications raised |       |
| Rework required       | Yes/No|

## Phase Breakdown
| Phase             | Task(s)                  | Duration | Blockers | Clarifications |
|-------------------|--------------------------|----------|----------|----------------|
| Input + RA        | T-001                    |          |          |                |
| Sign-off Gate     | T-GATE                   |          |          |                |
| Design            | T-002, T-003a, T-003b    |          |          |                |
| Test Planning     | T-009, T-010             |          |          |                |
| Implementation    | T-004, T-005             |          |          |                |
| Review            | T-006                    |          |          |                |
| Test Execution    | T-011, T-012             |          |          |                |
| Rework            | T-007, T-008             |          |          |                |
| Test Re-execution | T-013, T-014             |          |          |                |

## Test Outcomes
| Layer | Test Cases | Pass | Fail | Defects (C/H/M/L/I) | Disputes |
|-------|------------|------|------|---------------------|----------|
| FE    |            |      |      |                     |          |
| BFF   |            |      |      |                     |          |

---

## ESCALATION CHAIN
Cannot find START_SPRINT or req-inputs folder --> signal Orchestrator (sole
  NOTIFICATIONS.md writer), then stop.
No input files found --> signal Orchestrator with instructions, then stop.
Sprint already active --> signal Orchestrator, then stop.
Does not escalate to other agents.
Does not write to NOTIFICATIONS.md directly (R4 SRP fix -- Orchestrator is the
  sole writer; multiple writers risk interleaved writes + diluted ownership).

---

## HOOKS SCRIPT
H-SM-sprint-manager.ps1
Returns: PROCEED, ERROR:MISSING_START_SPRINT, ERROR:MISSING_INPUTS_FOLDER,
         ERROR:NO_INPUT_FILES, or SPRINT_ALREADY_ACTIVE

---

## COST DISCIPLINE (PROTOCOL 5 -- MANDATORY)
Full rules: `.claude/kb/cost-optimization-kb.md`.

A-SM provides Protocol 5 VISIBILITY through the velocity report.

- **Velocity report MUST include a Cost Summary section** with these metrics:
  - Sub-agent spawns this sprint (count + Case A/B/C justification per spawn)
  - `NO_CHANGE` hash-skips applied (count of `[=]` tasks; call out independent
    skips for A-03a vs A-03b -- the SRP split surfaces here)
  - `/compact` invocations
  - Fresh session reloads
  - Test cycles run (T-011/T-012 + any T-013/T-014 re-executions)
  - Defects (by layer + severity) and disputes (by verdict)
  - Validator failures (count by validator name -- surfaces drift)
  - Estimated cost multiplier vs Tier-1 baseline (per Section 10 of cost-optimization-kb)
- **Flag drift in the velocity report.** If sub-agent spawns exceed the budget OR
  cost multiplier drifts toward the sub-agent-heavy column, identify which Protocol 5
  rules were bypassed.
- **Default to foreground mode-switch.** A-SM itself is activated via mode-switch,
  not sub-agent spawn.
- **Honour hook signals.** If H-SM-sprint-manager.ps1 reports `SPRINT_ALREADY_ACTIVE`, do
  NOT re-register or duplicate work. Exit and surface to NOTIFICATIONS.md.
- **Hash-skip awareness on sprint completion.** A sprint with many `[=]` Skipped
  tasks is an effective cost-optimised resume, not a failure. Call this out
  positively in the velocity report.
