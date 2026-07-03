# agentic-pipeline/agents/ -- CLAUDE.md files
# One file per agent:
#   CLAUDE-A-00-orchestrator.md   Orchestrator
#   CLAUDE-A-SM-sprint-manager.md   Sprint Manager
#   CLAUDE-A-01-requirement-analyst.md   Requirement Analyst (producer)
#   CLAUDE-A-01r-requirement-resolver.md  Requirement Resolver       (NEW -- R2 SRP split, resolver mode)
#   CLAUDE-A-02-bff-designer.md   BFF Endpoint Designer
#   CLAUDE-A-03.md   UI Component Designer (DEPRECATED -- split into 03a + 03b)
#   CLAUDE-A-03a-ui-style-compiler.md  UI Style Compiler           (NEW -- SRP split)
#   CLAUDE-A-03b-ui-component-inventory.md  UI Component Inventory      (NEW -- SRP split)
#   CLAUDE-A-04-frontend-developer.md   Frontend Developer
#   CLAUDE-A-05-backend-developer.md   Backend Developer
#   CLAUDE-A-06-code-reviewer.md   Code Reviewer
#   CLAUDE-A-07-frontend-tester.md   FE Test Agent               (NEW)
#   CLAUDE-A-08-bff-tester.md   BFF Test Agent              (NEW)
#   (CLAUDE-A-09.md  Microservice Test Agent -- reserved)
#   (CLAUDE-A-10.md  DB Test Agent           -- reserved)
#
# Path variables all agents use:
#   ROOT     = poc-workspace/
#   PIPELINE = poc-workspace/agentic-pipeline/
#   SPRINTS  = poc-workspace/sprints/
#   APP      = poc-workspace/app/

# ALL AGENTS INHERIT 5 UNIVERSAL PROTOCOLS:
#   Protocol 1 -- Startup           (Section 5 of agentic-delivery-core-kb)
#   Protocol 2 -- Sign-off          (Section 5 of agentic-delivery-core-kb)
#   Protocol 3 -- Clarification     (Section 5 of agentic-delivery-core-kb)
#   Protocol 4 -- Completion        (Section 5 of agentic-delivery-core-kb)
#   Protocol 5 -- Cost Discipline   (Full rules: .claude/kb/cost-optimization-kb.md)

# COST DISCIPLINE -- FIVE MANDATORY RULES (Protocol 5):
#   1. Foreground mode-switch is the default. Sub-agent spawn is the exception.
#      "Activate [agent name]" means: same Claude session becomes that agent.
#   2. Trust NO_CHANGE. Hook authority is absolute.
#   3. Read the persisted briefing. Do not re-derive context from disk history.
#   4. Sub-agent budget: 2 spawns/sprint. Cases A/B/C only. Audit-log justification required.
#   5. /compact proactively after 3-4 mode switches OR > 60% context use.
