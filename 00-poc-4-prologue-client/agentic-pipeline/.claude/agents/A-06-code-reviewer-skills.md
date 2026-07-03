# A-06 â€” Code Reviewer
# Skills File â€” SKELETON
# Version: 0.1 â€” Awaiting detailed skill set from Architecture Lead
# Status: Draft
# Related: A-06-code-reviewer-definition.md

---

## SINGLE RESPONSIBILITY
[See A-06-code-reviewer-definition.md]

---

## SECTION 1 â€” UNIVERSAL PROTOCOLS
[Refer to Agentic Delivery Core KB â€” Section 4]
This agent follows all four universal protocols.
Agent-specific protocol behaviour is defined in A-06-code-reviewer-definition.md.

---

## SECTION 2 â€” DOMAIN KNOWLEDGE
<!-- TO BE COMPLETED BY ARCHITECTURE LEAD -->
<!-- Document the domain expertise this agent needs to do its job well.      -->
<!-- Examples: REST API design principles, React patterns, BFF patterns etc. -->

[TBD]

---

## SECTION 3 â€” OUTPUT FORMAT SPECIFICATION
<!-- TO BE COMPLETED BY ARCHITECTURE LEAD -->
<!-- Exact structure of every file this agent produces.                      -->
<!-- Field names, data types, mandatory vs optional, example values.         -->

[TBD â€” see definition file for high-level output description]

---

## SECTION 4 â€” QUALITY STANDARDS AND CONSTRAINTS

### Scan exclusions (hard constraint)
- **Never scan or report findings from `node_modules/`** or any path containing `node_modules`.
- When using Grep or Glob to locate files for review, always exclude `node_modules`:
  - Glob pattern: `app/**/*.{ts,tsx,js,json}` — never `**` from the workspace root without a path guard.
  - Grep: pass `--glob '!**/node_modules/**'` or equivalent exclusion.
- A `.ignore` file at the workspace root already lists `node_modules/` so ripgrep-backed tools
  (Grep, Glob) will skip it automatically. Do not override or remove that exclusion.
- If a finding's file path contains `node_modules`, discard it — it is a false positive.

---

## SECTION 5 â€” DEFINITION OF DONE CHECKLIST
<!-- TO BE COMPLETED BY ARCHITECTURE LEAD -->
<!-- Concrete, binary checklist. Every item must pass before completion.     -->

- [ ] [DoD item 1]
- [ ] [DoD item 2]
- [ ] No open clarification requests outstanding

---

## SECTION 6 â€” WORKED EXAMPLES
<!-- TO BE COMPLETED BY ARCHITECTURE LEAD -->
<!-- Good vs bad output examples for the most common scenarios.              -->

[TBD]

---

## VERSION HISTORY
| Version | Date       | Author           | Changes                    |
|---------|------------|------------------|----------------------------|
| 0.1     | 2026-05-13 | Architecture Lead | Skeleton created |
| 0.2     | 2026-05-22 | Architecture Lead | Section 4: node_modules exclusion rule added |
