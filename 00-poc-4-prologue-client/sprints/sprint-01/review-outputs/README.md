# Review Outputs -- sprint-01

A-04 and A-05 write their rework deliverables here at the end of a
T-007 Rework cycle (after consuming comments from
sprints\sprint-01\review-inputs\).

## Expected contents per agent (after a rework run)
- A-04-ledger.json         -- machine-readable status ledger.
- A-04-rework-report.xlsx  -- human-readable Excel report from the ledger.
- A-05-ledger.json         -- backend-side ledger.
- A-05-rework-report.xlsx  -- backend-side Excel report.

## How the xlsx is produced
The agent emits the ledger JSON. Generate the xlsx via:
  cd agentic-pipeline\scripts
  npm install                                  # first-time only
  npm run review-report -- --sprint sprint-01 --agent A-04
  npm run review-report -- --sprint sprint-01 --agent A-05

The script reads the *-ledger.json and emits the matching *-rework-report.xlsx
in this folder.

## Read-only contract for downstream
Canonical record of what was implemented from a review cycle and what was
not (with reasons). A-06 (Code Reviewer) and humans READ; they do not write.
