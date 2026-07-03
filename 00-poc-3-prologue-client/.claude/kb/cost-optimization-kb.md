# cost-optimization-kb -- Knowledge Base
# Version: 1.0 -- 2026-05-14
# Scope: MANDATORY cost-discipline rules for all agents in this pipeline
# Status: Hard rules. Exceptions are explicitly enumerated (see Section 4).

---

## 0. WHO READS THIS

- Co-worker mode (Claude reading `.claude/CLAUDE.md`)
- All 8 pipeline agents (A-00, A-SM, A-01..A-06)
- Any future agent added to the pipeline (D-002 single responsibility still applies)
- Any human operator deciding when to spawn sub-agents

This KB is referenced from `.claude/CLAUDE.md` and from every `A-##-{fullname}-definition.md`.
Every agent inherits **Protocol 5 -- Cost Discipline** alongside the existing four protocols.

---

## 1. THE COST PRINCIPLE

Every token spent on coordination is a token not spent on delivery. The pipeline's value comes from
its specialist agents producing artefacts -- not from spawning, briefing, re-spawning, or
re-explaining context that already exists on disk.

**The cost hierarchy (cheapest to most expensive):**

| Tier | Mechanism                                          | Relative cost  |
|------|----------------------------------------------------|----------------|
| T0   | Hash-skip (`NO_CHANGE`) -- hook exits, no LLM run  | ~0             |
| T1   | Foreground mode-switch -- same session, new role   | 1x baseline    |
| T2   | Foreground with `/compact` -- recover window       | 1.1x baseline  |
| T3   | Fresh session, state reloaded from disk            | 1.2x baseline  |
| T4   | Sub-agent spawn (justified)                        | 3-5x baseline  |
| T5   | Sub-agent with inline-return doubling              | 5-8x baseline  |
| T6   | Sub-agent re-spawn after truncation                | 8-12x baseline |

**Rule**: always operate at the lowest tier that achieves the outcome. Moving up a tier requires
explicit justification under Section 4.

---

## 2. PROTOCOL 5 -- COST DISCIPLINE (MANDATORY FOR ALL AGENTS)

Every agent follows Protocol 5 in addition to Protocols 1-4. Protocol 5 has five rules.

### Rule 5.1 -- Default to foreground mode-switch

When the human says "Activate [agent name]", the receiving Claude session **becomes** that agent
by reading its definition + skills + briefing. It does NOT spawn a sub-agent for the agent's own
work. State persists in files on disk (manifest, briefings, audit log) between mode switches.

Sub-agent spawn is the exception, not the default. See Section 4 for the only permitted cases.

### Rule 5.2 -- Trust the hook's NO_CHANGE signal

If a hook returns `NO_CHANGE`, the agent MUST exit immediately, report `[=]` Skipped, and not
re-read inputs, not re-load KBs, not regenerate output. The hook is authoritative. Bypassing
`NO_CHANGE` is a Protocol 5 violation and wastes Tier-1 cost for zero outcome.

### Rule 5.3 -- Read briefings, do not re-derive context

Context briefings are persisted in `agentic-pipeline/briefings/T-###-A-##-{fullname}-briefing.md`. An agent
MUST read its briefing once and treat it as authoritative. It MUST NOT:
- Re-read the full audit log to reconstruct state
- Re-read every prior RC card to "refresh" context already in the briefing
- Ask the Orchestrator to re-summarize the briefing

If the briefing is missing or stale, raise a Protocol 3 clarification rather than guessing.

### Rule 5.4 -- Respect the sub-agent budget

The default sprint sub-agent budget is **2 spawns per sprint** (typically T-007 A-04 + A-05
parallel rework). Any additional spawn requires the activating agent to:
1. Document the justification in the audit log against one of the three permitted cases (Section 4).
2. Use the cost-reduction tactics from Section 5.

If the budget is exceeded without documented justification, the Orchestrator raises a non-blocking
HB to the human for review.

### Rule 5.5 -- Use `/compact` before context bloat forces a fresh session

A foreground session can mode-switch through 3-5 agent activations cheaply. After that, the
conversation overhead starts costing more than a fresh session reload. The activating agent
SHOULD invoke `/compact` after every 3-4 mode switches. The Orchestrator MAY suggest `/compact`
in its activation message when it detects deep history.

---

## 3. THE COST LEVERS BY TIER

### Tier 0 -- Zero-LLM mechanisms (highest ROI)

These mechanisms execute outside the LLM and cost essentially nothing:

| Lever                  | Owned by         | What it saves                                  |
|------------------------|------------------|------------------------------------------------|
| `NO_CHANGE` hash skip          | All hook scripts | 100% of agent run when input unchanged         |
| `PARTIAL_RECOVERY`             | All hook scripts | Re-running on dirty state                      |
| Dependency check               | All hook scripts | Invalid activation costs                       |
| Path resolution                | All hook scripts | LLM does not compute paths                     |
| Secret loading                 | All hook scripts | LLM does not handle credentials                |
| Sign-off currency re-evaluation| H-07 / H-08      | Detects stale test sign-offs via hash compare; NO_CHANGE on stable code; ~100ms per check (D-034) |

**Enforcement**: every hook MUST implement hash-skip. If a hook does not have hash-skip wired up,
that is a defect to be fixed -- not a Protocol 5 exception.

### Tier 1 -- File-based state (the foreground multiplier)

The pipeline's design assumes state lives in files, not in agent memory. This is what makes
foreground mode-switching cheap:

| Artefact                        | Path                                              | Role                                       |
|---------------------------------|---------------------------------------------------|--------------------------------------------|
| Manifest                        | `agentic-pipeline/orchestrator-manifest.md`       | Single source of truth for all state       |
| Briefings                       | `agentic-pipeline/briefings/T-###-A-##-{fullname}-briefing.md`      | Per-activation context handoff             |
| Audit log                       | `agentic-pipeline/audit-log.md`                   | Append-only event history                  |
| RC cards (versioned)            | `sprints/sprint-##/req-outputs/RC-###.md`         | Requirement state                          |
| Hash files                      | `<output-folder>/.input-hash`                     | Hash-skip enablement                       |
| Sprint-scoped hash files        | `app/.input-hash-sprint-##`                       | Cross-sprint isolation for `app/`          |
| Sign-off currency hash files    | `sprints/sprint-##/tests/<layer>/test-results/.signoff-hash` | Records app-code+test-case hash at the moment of test PASS verdict; drives re-test trigger (D-034) |
| Resolution documents            | `sprints/sprint-##/concerns/resolutions/*.md`     | Clarification audit trail                  |

**Rule**: if a piece of state could live in a file, it MUST live in a file. Holding state in agent
memory across sessions multiplies cost by the re-load factor at every mode switch.

### Tier 2-3 -- Foreground execution patterns

| Pattern                              | When to use                                                |
|--------------------------------------|------------------------------------------------------------|
| Mode-switch via "Activate [agent]"   | Default for ALL agent activations                          |
| `/compact` mid-session               | After 3-4 mode switches, OR > 60% context used             |
| Fresh session reload                 | When `/compact` is not enough (e.g. after 8+ mode switches)|
| Selective KB section reads           | Read only KB sections the current agent needs              |

---

## 4. WHEN SUB-AGENT SPAWN IS PERMITTED (THE ONLY EXCEPTIONS)

Sub-agent spawn is **mandatorily disallowed** outside these three cases:

### Case A -- True parallelism

Two or more agents must run **simultaneously** because their work is independent and sequencing
them would idle one for hours. The canonical example is T-007 rework: A-04 frontend and A-05
backend fixing review findings in parallel.

**Justification format in audit log:**
```
| <timestamp> | A-00 | Sub-agent spawn (Case A) | T-007 parallel rework: A-04 + A-05 |
```

### Case B -- Heavy context isolation

Output exploration would blow up the foreground context. Canonical example: the `Explore` agent
searching across 100+ files where returning all matches inline would exceed the foreground
working budget.

**Required mitigation**: specify exploration breadth ("quick" / "medium" / "very thorough") so the
sub-agent matches its own context use to the task size.

### Case C -- Truncation-risk payload

Single inline emission would exceed the ~80 KB transcript ceiling and cause silent tail truncation
(KB Section 11.5 in agentic-delivery-core-kb). Canonical example: a sub-agent producing the full
scaffold + 23 RC cards + tests in one response.

**Required mitigation**: split into 2-3 focused parallel sub-agents (Recovery-A scaffold,
Recovery-B features, Recovery-C tests) AND emit ledger-first AND prefer direct-disk-write.

### Anti-pattern: spawning for any other reason

The following are NOT valid justifications and constitute Protocol 5 violations:

- "It feels cleaner to delegate this"
- "The foreground agent is busy" (it isn't -- it's the same session)
- "The sub-agent has a tuned prompt for this" (mode-switch achieves the same)
- "I want to keep the main context tidy" (use `/compact` instead)
- "This task has 2-3 tool calls and I'd rather isolate it" (foreground tool calls are cheaper)

---

## 5. SUB-AGENT COST-REDUCTION TACTICS (WHEN SPAWN IS JUSTIFIED)

Even when Case A/B/C justifies a spawn, apply these tactics to minimize the cost premium:

| Tactic                              | Saving                                                          | Reference          |
|-------------------------------------|-----------------------------------------------------------------|--------------------|
| Direct-disk-write (pre-auth)        | Skips inline-return doubling. The sub-agent writes to disk and  | KB 11.4            |
|                                     | returns a concise summary instead of file content.              |                    |
| Ledger-first emission               | Per-agent ledger JSON is the FIRST artefact in the response.    | KB 11.5, 6.5       |
|                                     | Survives truncation; prevents re-spawn cost.                    |                    |
| Focused split                       | 2-3 narrow-scope sub-agents instead of one wide-scope.          | KB 11.5            |
|                                     | Each fits under the truncation ceiling.                         |                    |
| Canonical source-of-truth pre-set   | For `shared`-owned findings, activating agent pre-decides       | KB 6.5             |
|                                     | which side is authoritative BEFORE spawning. Prevents T-007b.   |                    |
| Owner-tag routing                   | Each finding file carries `owner:` tag. Sub-agents filter their | KB 6.5             |
|                                     | inbox; do not process out-of-scope findings.                    |                    |
| Verification gates                  | Sub-agent runs `npm run lint` + `npm test` BEFORE reporting     | KB 6.5             |
|                                     | complete. Green gates are a precondition.                       |                    |

**Required**: pre-authorise `Write` and `Edit` for the workspace path in
`.claude/settings.local.json` BEFORE launching any sub-agent. This enables direct-disk-write and
sidesteps the foreground-write doubling cost.

---

## 6. PIPELINE EFFICIENCY PATTERNS (BATCH AND DEFER)

These patterns reduce the total number of agent activations needed per sprint:

| Pattern                              | Saving                                                         |
|--------------------------------------|----------------------------------------------------------------|
| Composite human blockers             | Bundle N related decisions into one HB; resolve once;          |
| (KB Section 9.4)                     | cascade RC version bumps in a single batch.                    |
| Batch RC version bumps               | When one resolution affects multiple cards, bump all in        |
| (KB Section 4.4)                     | a single batch and notify signing agents once, not N times.    |
| Partial gate opening                 | Open gate per-card when that card is fully signed off.         |
| (KB Section 6.2)                     | Downstream agents start on cleared cards while others clarify. |
| Documented exceptions                | When a constraint cannot be met, document it. Prevents endless |
| (KB Section 8.4)                     | clarification loops on already-decided trade-offs.             |
| Mid-sprint deferral                  | Eject doomed cards before paying design/impl tokens.           |
| (KB Section 7.5)                     | Defer to next sprint with version bump.                        |
| Cross-output alignment check         | Orchestrator asks consuming agent (READ-ONLY) "do inputs       |
| (KB Section 8.3)                     | align?" before expensive implementation begins.                |

---

## 7. ANTI-PATTERNS -- ACTIVE COST WASTE

These are explicit cost violations. Each is to be treated as a defect:

| Anti-pattern                                        | Why it wastes cost                                |
|-----------------------------------------------------|---------------------------------------------------|
| Spawning sub-agent for sequential dependent work    | Pure duplication, no parallelism benefit          |
| Sub-agent for tasks under 3 tool calls              | Spawn overhead exceeds the work itself            |
| Re-loading KBs in the same session                  | KBs are already in context; re-reading is waste   |
| Skipping or bypassing `NO_CHANGE` hash-skip         | Re-running unchanged work                         |
| Long inline returns when pre-auth + DDW would work  | Pays for output content twice                     |
| Re-explaining context already in the briefing       | Briefing IS the context handoff; trust it         |
| Mode-switching 6+ times without `/compact`          | Context bloat costs more than a fresh session     |
| Multiple HBs for decisions that emerged together    | Use a composite HB instead                        |
| RC version bump per individual change in a batch    | Use a batch bump and single re-notification       |
| Re-running an agent because briefing felt thin      | Strengthen the briefing, not the run count        |
| Generating output the hook would have skipped       | Hook authority is absolute                        |

---

## 8. AUDIT TRAIL FOR COST DECISIONS

The audit log records every cost-relevant event so post-sprint analysis can quantify discipline:

| Event                                  | Logged as                                                          |
|----------------------------------------|--------------------------------------------------------------------|
| Hash-skip applied                      | `[=]` row in Task Registry; `NO_CHANGE` line in audit log          |
| Sub-agent spawn (with justification)   | Audit line tagged `Sub-agent spawn (Case A/B/C)`                   |
| Sub-agent budget overrun               | Non-blocking HB raised; audit line tagged `Budget overrun`         |
| Truncation observed                    | Audit line tagged `Truncation recovery`                            |
| `/compact` invoked                     | Audit line tagged `Compact`                                        |
| Fresh session reload                   | Audit line tagged `Session reload`                                 |

The velocity report (produced by A-SM at sprint end) MUST include a Cost Summary section:
- Sub-agent spawns this sprint (count + Case justification per spawn)
- `NO_CHANGE` skips this sprint (count)
- Compact invocations
- Estimated cost multiplier vs Tier-1 baseline

---

## 9. ESCALATION FOR PROTOCOL 5

If an agent believes a Protocol 5 violation is necessary (e.g. a fourth sub-agent spawn in a
single sprint), it raises a Protocol 3 clarification to the Orchestrator. The Orchestrator either:
- Approves with explicit justification logged to the audit trail, or
- Escalates to the human as a non-blocking HB.

Protocol 5 is enforced like the other protocols. No agent silently exceeds the budget.

---

## 10. PROJECTED COST PROFILE BY SPRINT TYPE

For planning and post-sprint comparison, the expected cost multipliers vs Tier-1 baseline:

| Sprint scenario                              | Foreground + hash-skip | Sub-agent-heavy alternative |
|----------------------------------------------|------------------------|-----------------------------|
| Clean sprint (no rework, 50% hash-skip)      | ~1.0x                  | ~4.5x                       |
| Sprint with one rework cycle                 | ~1.4x                  | ~6.0x                       |
| Sprint with iterative rework (T-007b)        | ~1.8x                  | ~9.0x                       |
| Resumed sprint (5-day pause, briefings used) | ~1.05x                 | ~5.0x                       |

The pipeline's design target is the left column. If a sprint drifts toward the right column, the
velocity report MUST flag the drift and identify which Protocol 5 rules were bypassed.

---

## 11. RULES FOR FUTURE AGENTS

When a new specialist agent is added to the pipeline (per Section 13.1 of agentic-delivery-core-kb):

1. Its `A-##-{fullname}-definition.md` MUST include a "COST DISCIPLINE" section referencing this KB and
   Protocol 5.
2. Its `H-##-{fullname}.ps1` MUST implement `NO_CHANGE` hash-skip following the A-01 pattern.
3. Its activation file `CLAUDE-A-##-{fullname}.md` MUST default to foreground mode-switch; sub-agent spawn
   is documented as exception-only with the Case A/B/C justification framework.
4. Its briefing MUST be persisted before activation; the agent reads the persisted briefing rather
   than relying on prompt-embedded context alone.
5. If the agent owns any output folder, that folder uses an `.input-hash` file for hash-skip.
6. Its activation file MUST include a `## Default model tier` section naming a declared `model:`
   (haiku | sonnet | opus) with rationale. The declared tier governs sub-agent spawn selection
   only; foreground mode-switch inherits the session model.

A new agent that does not meet these six requirements is not pipeline-ready.

---

## 11A. MODEL-TIER POLICY (added 2026-05-14)

### Session model
- Operator picks at session start: `/model sonnet` (recommended default).
- Foreground mode-switch inherits this unconditionally. The agent's declared `model:` is advisory
  in the mode-switch case.

### Declared tier per agent (current state)
| Agent  | Declared | Why                                                                     |
|--------|----------|-------------------------------------------------------------------------|
| A-SM | sonnet   | Sprint lifecycle coordination                                           |
| A-00 | sonnet   | Orchestration, manifest writes, hook invocations                        |
| A-01 | opus     | Vision-heavy RC consolidation; quality compounds downstream             |
| A-01r| haiku    | Single-question resolver; small focused context                         |
| A-02 | sonnet   | API contract design                                                     |
| A-03a| sonnet   | Token extraction + theme generation                                     |
| A-03b| sonnet   | Component decomposition                                                 |
| A-04 | opus     | Production code in app/frontend/; rework cycles cost more than Opus     |
| A-05 | opus     | Production code in app/backend/; mirrors A-04 rationale               |
| A-06 | sonnet   | Code review at Sonnet quality is sufficient                             |
| A-07 | sonnet   | Test planning + result triage                                           |
| A-08 | sonnet   | Test planning + Pact verification                                       |

### Dynamic rule (one rule, full stop)
- A-04 / A-05 with `ReworkCycle >= 2` -> force `opus` regardless of declared tier.
- Rationale: second-pass rework hunts subtle bugs that benefit from stronger reasoning.

Adding a SECOND dynamic rule requires an Architectural Decision Record (ADR). The cost of rule
sprawl is concentration risk on the helper script -- it incrementally turns into Path A.

### Where this is enforced
`agentic-pipeline/scripts/select-model.ps1` -- invoked by A-00 before every sub-agent spawn.
Reads the declared tier from the activation file, applies the one dynamic rule, returns the model
name, and audit-logs the selection with reason.

### Cost impact
With session=Sonnet + declared Opus on three producers + one rework rule, expected sprint cost is
~0.35-0.55x of all-Opus (varies by sprint shape). Compounded with hash-skip (Tier 0) wins on re-runs,
the floor is closer to ~0.15x. See Section 10 for the by-shape table.

---

## 12. SUMMARY -- THE FIVE RULES

1. **Foreground mode-switch is the default.** Sub-agent spawn is the exception.
2. **Trust `NO_CHANGE`.** If the hook says skip, skip.
3. **Read the briefing.** Do not re-derive context that already exists on disk.
4. **Respect the sub-agent budget.** 2 spawns per sprint; exceptions are documented under Case A/B/C.
5. **`/compact` proactively.** Do not let context bloat force expensive recovery.

Every agent inherits these five rules as Protocol 5.