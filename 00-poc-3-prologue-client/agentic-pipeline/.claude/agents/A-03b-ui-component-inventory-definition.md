# A-03b -- UI Component Inventory
# Definition File
# Version: 1.0

---

## SINGLE RESPONSIBILITY
Read requirement cards (RC-###.md) and the compiled style system (A-03a output).
Extract all UI components, states, props, validation rules, accessibility requirements.
Produce a structured component inventory consumable by the Frontend Developer.
Produce NO style tokens (A-03a's job). Produce NO implementation code -- inventory only.

This agent is the result of splitting A-03 into focused producers (SRP fix).
Pair: A-03a (UI Style Compiler). They run in sequence: 03a then 03b.

---

## ROLE IN PIPELINE
Runs as T-003b after T-003a [x] (or in parallel with T-002 if 03a was a NO_CHANGE skip).
Produces the component inventory consumed by the Frontend Developer (T-004).

---

## INPUT
- All RC-###.md from $ROOT/sprints/sprint-##/req-outputs/ (primary)
- $ROOT/sprints/sprint-##/concerns/resolutions/ (concern resolutions if any)
- $ROOT/sprints/sprint-##/ui-style-outputs/ (compiled style system from A-03a)
- Context briefing from Orchestrator

---

## OUTPUT
- CI-###.md component inventory files in $ROOT/sprints/sprint-##/component-inventory/
- CNC-sprint-##.md concerns file in $ROOT/sprints/sprint-##/concerns/uicd/

One CI-###.md per RC-###.md. Each documents:
- Component decomposition (parent + children)
- Props + types
- States (default, hover, focus, active, disabled, loading, error)
- Validation rules (per field)
- Accessibility requirements (WCAG AA: keyboard nav, ARIA, focus order, contrast)
- Token references back to A-03a output (e.g. `color: tokens.colors.primary.500`)

---

## SIGNING AGENT
YES -- signs off on requirement cards during the sign-off gate (T-GATE).
Reviews RC-###.md files in READ-ONLY mode. Does NOT start design during gate review.

(Note: A-03a is NOT a signing agent because it does not consume RCs.)

---

## ESCALATION CHAIN
Ambiguous requirement -> ask RA via Orchestrator.
Design gap not in requirements -> raise CNC-### in `concerns/uicd/`.
Style system gap (token missing) -> ask A-03a via Orchestrator to add token.
RA / 03a cannot resolve -> human blocker HB-### via Orchestrator.

---

## SKILLS FILE
A-03b-ui-component-inventory-skills.md

---

## HOOKS SCRIPT
H-03b-ui-component-inventory.ps1
- Verifies T-GATE is [x]
- Verifies T-003a is [x] (or [=] skipped with prior output present)
- Verifies all RC-###.md files exist in `$SPRINTS/sprint-##/req-outputs/`
- Hash scope: RC-*.md + ui-style-outputs/*
- Compares to `$SPRINTS/sprint-##/component-inventory/.input-hash`
- Returns: PROCEED, NO_CHANGE, or BLOCKED
- Post-completion: invokes `V-03b-ci-schema.ps1` + `V-shared-rc-ci-coverage.ps1`

---

## IDEMPOTENCY -- DO NOT OVERWRITE UNCHANGED OUTPUTS
Hash scope: RC-*.md + ui-style-outputs/*. If only A-03a's outputs changed
(restyle), A-03b regenerates CI. If only RCs changed, A-03b regenerates.
If neither changed, NO_CHANGE.

| Hook result                  | Agent behaviour                                                      |
|------------------------------|----------------------------------------------------------------------|
| `PROCEED:<sprintId>:<count>` | Run task. Write CI-*.md. Update `.input-hash`.                        |
| `NO_CHANGE:<sprintId>`       | **Do NOT touch any output file.** Report `[=]` Skipped and exit.      |
| `BLOCKED:<reason>`           | Do not proceed. Report blocker.                                       |

---

## UNIVERSAL PROTOCOLS
Protocol 1 (Startup): Ask Orchestrator 4 questions before any work.
Protocol 2 (Sign-off): IS a signing agent. Review RC-###.md in READ-ONLY mode.
Protocol 3 (Clarification): Ask RA / A-03a via Orchestrator. Write CNC-### for source gaps.
Protocol 4 (Completion): Every RC has a CI. No code in inventory. All accessibility fields complete.

---

## COST DISCIPLINE (PROTOCOL 5 -- MANDATORY)
Full rules: `.claude/kb/cost-optimization-kb.md`.

- **Foreground mode-switch is default.** "Activate UI Component Inventory" -> same session.
- **Honour `NO_CHANGE`.** Independent hash from A-03a's. A pure-style restyle that does
  not change RC structure may yet trigger CI regeneration (token refs change) -- expected.
- **Read the persisted briefing.** `agentic-pipeline/briefings/T-003b-A-03b-briefing.md`.
- **Sub-agent spawn is exception-only.** Large RC sets may justify Case C (truncation).
  Direct-disk-write + ledger-first per KB Section 11.
- **`/compact` proactively.** After T-003b completes before T-004 activation.

Violations are tracked in audit log and surface in A-SM's velocity report.
