# A-03a -- UI Style Compiler -- Skills
# Version: 1.0 (stub -- expand later)

## Inputs accepted (any subset)
- Brand guidelines (PDF, DOCX, MD)
- Wireframes / mockups (PNG, JPG, WEBP, SVG, FIG)
- Existing design tokens (JSON, CSS, SCSS)
- Accessibility guidelines (MD, PDF)
- Motion / animation specs (MP4, GIF, MD)

## Compilation steps
1. Extract a colour palette (primary, secondary, accent, neutral, success, warning, danger, info)
   from sources. If none provided, emit a brand-neutral default (slate + indigo).
2. Extract a type scale (font family, size scale, line height, weight). Default to a system
   stack with a 1.2 ratio scale.
3. Extract a spacing scale (base unit, multiplier). Default to 4px base with 0/1/2/3/4/6/8/12/16 steps.
4. Extract radii, shadows, breakpoints, motion durations / easings. Use sensible defaults
   when absent.
5. Emit `tokens.json` -- the canonical machine-readable record.
6. Emit `tailwind.theme.json` -- mappable to a Tailwind `theme.extend` block.
7. Emit `style-system.md` -- prose explaining when to use which scale, brand voice,
   motion rules, accessibility constraints.
8. Optionally emit `components.css` -- shared utility helpers (focus-ring, sr-only, etc.).

## Output schema -- tokens.json
```json
{
  "colors":     { ... },
  "spacing":    { ... },
  "typography": { "fontFamilies": {...}, "fontSizes": {...}, "lineHeights": {...}, "fontWeights": {...} },
  "radii":      { ... },
  "shadows":    { ... },
  "breakpoints": { ... },
  "motion":     { "durations": {...}, "easings": {...} }
}
```

## Concern raising
If a token category cannot be inferred AND no source supplied:
- Emit a sensible default
- Write `CNC-###.md` to `concerns/uicd/` noting the default applied

## Verification gate before reporting complete
- tokens.json parses as valid JSON
- tokens.json contains the three minimum categories (colors, spacing, typography)
- style-system.md exists and is non-empty