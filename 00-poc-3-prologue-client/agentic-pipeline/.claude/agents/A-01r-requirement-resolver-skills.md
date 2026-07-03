# A-01r -- Requirement Resolver -- Skills
# Version: 0.1 (STUB -- expand later)

## Resolution flow (per CL/CNC)
1. Read the briefing -- it names the CL/CNC ID, the affected RC, the question text.
2. Read the affected RC -- understand what was already specified.
3. Targeted search in `req-inputs/`: filename keywords > body keywords > screen-print
   captions > image OCR text. Stop at first authoritative source.
4. Verdict assignment:
   - **RESOLVED_FROM_SOURCE** -- the source explicitly answers the question. Quote the
     supporting fragment in the resolution body. RC does NOT need to change because the
     answer was already implicit in the RC + source.
   - **NEEDS_RC_UPDATE** -- the source answers the question, but the answer contradicts
     (or adds to) the current RC text. RC must be bumped to reflect the resolution.
     Body of the resolution states the proposed RC change in plain prose -- A-01
     (producer) will execute the bump.
   - **HUMAN_BLOCKER** -- exhaustive search of source finds no answer; the question
     requires a product/design decision the source material cannot supply.

## What this agent does NOT do
- Does NOT bump RC version (A-01 producer's job)
- Does NOT write RC body changes (A-01 producer's job)
- Does NOT write to req-outputs/ -- writes only to concerns/resolutions/
- Does NOT ask other agents for help (it is the resolver; escalates to HB instead)

## Source citation format
Always include `source-cite:` in resolution frontmatter, pointing to a real file:
- `req-inputs/05-promotion-add-criteria-modal.png` (when the answer is in a screen-print)
- `req-inputs/admin-tool-spec.md#section-promotions` (when the answer is in prose)
- `concerns/resolutions/HB-003-resolution.md` (when the answer was already decided by human)

(Human to expand: keyword-search strategies for image-heavy input sets, OCR fallback,
disambiguation when multiple sources conflict.)
