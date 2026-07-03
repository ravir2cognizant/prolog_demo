# Style System -- Prologue Client (sprint-01)
# Compiled by A-03a | Source: Journal.png + sidebar.png (Fiserv Admin Tool) | 2026-05-21

---

## 1. Brand Overview

The Prologue Client web application follows the **Fiserv Admin Tool** visual language observed in the reference images:

- A deep **Fiserv corporate blue** (`primary.500 = #1B4290`) for structural chrome — the top navigation bar, active states, and interactive focus rings.
- A **forest green** (`accent.500 = #3A7D44`) for primary call-to-action buttons, selection indicators (card borders, checkmarks), and calendar icons.
- A clean **white + light-gray** surface layer for the content area, cards, and the sidebar.
- **Neutral grays** (neutral.100–900) for all secondary text, borders, placeholders, and disabled states.

This is a **professional financial application** for GL accountants and finance managers. The visual tone is calm, structured, high-density, and data-centric. It does not use bold gradients, playful animation, or decorative imagery.

---

## 2. Color Usage

### Primary — Fiserv Blue (#1B4290)

| Role                          | Token                        |
|-------------------------------|------------------------------|
| Top header / chrome bar       | `colors.surface.header`      |
| Active navigation item        | `colors.primary.500`         |
| Active step indicator (circle)| `colors.step.active`         |
| Input focus ring              | `colors.border.focus`        |
| Link text                     | `colors.text.link`           |
| Primary light hover/fill      | `colors.primary.50`          |

### Accent — Forest Green (#3A7D44)

| Role                          | Token                        |
|-------------------------------|------------------------------|
| Primary CTA button (Next, Save, Post) | `colors.accent.500` |
| Selected card border (channel cards) | `colors.border.selected` |
| Checked state (checkbox, toggle)     | `colors.accent.500`     |
| Calendar / date picker icons  | `colors.accent.500`          |
| Success indicators            | `colors.state.success`       |

### Neutral Grays

| Role                       | Token                  |
|----------------------------|------------------------|
| Page background            | `colors.surface.background` = neutral.100 |
| Sidebar background         | `colors.surface.sidebar` = white |
| Card / form background     | `colors.surface.card` = white |
| Input border (default)     | `colors.border.default` = neutral.300 |
| Body text                  | `colors.text.primary` = neutral.900 |
| Secondary / helper text    | `colors.text.secondary` = neutral.600 |
| Placeholder text           | `colors.text.placeholder` = neutral.500 |
| Disabled text              | `colors.text.disabled` = neutral.400 |

### State Colors

Use the semantic state tokens for validation, alerts, and status badges:

| State    | Background token          | Text/icon token         |
|----------|---------------------------|-------------------------|
| Success  | `state.successLight`      | `state.success`         |
| Warning  | `state.warningLight`      | `state.warning`         |
| Error    | `state.errorLight`        | `state.error`           |
| Info     | `state.infoLight`         | `state.info`            |

For the journal entry Difference indicator (RC-003): use `state.error` text on `state.errorLight` background when the Difference is non-zero.

---

## 3. Typography

### Font Stack

Use **Inter** as the primary sans-serif. Fallback to system sans: `Segoe UI → Roboto → Helvetica Neue → Arial → sans-serif`. Never use a serif font in this application.

### Type Scale Usage

| Use case                          | Size token  | Weight  | Color             |
|-----------------------------------|-------------|---------|-------------------|
| Page title (e.g. "Marketing")     | `3xl` (24px)| bold    | text.primary      |
| Section heading (e.g. "Campaign details") | `2xl` (20px) | bold | text.primary |
| Table / grid column headers       | `sm` (12px) | semibold| text.secondary    |
| Form field labels                 | `base` (14px)| medium | text.primary      |
| Body / form input text            | `base` (14px)| regular| text.primary      |
| Helper / optional labels          | `xs` (11px) | regular | text.secondary   |
| Navigation section headers (bold) | `base` (14px)| semibold| text.primary    |
| Navigation sub-items              | `base` (14px)| regular | text.secondary  |
| Breadcrumb text                   | `sm` (12px) | regular | text.secondary   |
| Button text                       | `base` (14px)| semibold| text.inverse (white on dark buttons) |
| Step label (active)               | `sm` (12px) | semibold| primary.500      |
| Step label (inactive)             | `sm` (12px) | regular | text.secondary   |

### Line Height

Default to `normal` (1.5) for body copy and form text. Use `tight` (1.2) for large headings. Use `snug` (1.35) for section titles.

---

## 4. Spacing

The base unit is **4px**. All spacing values are multiples of 4px.

| Context                          | Token             | Pixels |
|----------------------------------|-------------------|--------|
| Sidebar left padding             | `spacing.4`       | 16px   |
| Sidebar item vertical padding    | `spacing.2`       | 8px    |
| Card / form container padding    | `spacing.6`       | 24px   |
| Gap between stacked form fields  | `spacing.4`       | 16px   |
| Gap between two-column form row  | `spacing.4`       | 16px   |
| Table row vertical padding       | `spacing.3`       | 12px   |
| Button vertical padding          | `spacing.2.5`     | 10px   |
| Button horizontal padding        | `spacing.5`       | 20px   |
| Input vertical padding           | `spacing.2`       | 8px    |
| Input horizontal padding         | `spacing.3`       | 12px   |
| Channel card padding             | `spacing.4`       | 16px   |
| Step wizard horizontal gap       | `spacing.10`+     | 40px+  |
| Header bar height                | `spacing.14`      | 56px   |
| Sidebar width (desktop)          | 272px (custom)    | 272px  |

---

## 5. Border Radii

| Component                 | Token        | Pixels |
|---------------------------|--------------|--------|
| Input fields              | `radii.sm`   | 3–4px  |
| Buttons                   | `radii.md`   | 6px    |
| Cards / panels            | `radii.lg`   | 8px    |
| Channel selection cards   | `radii.lg`   | 8px    |
| Step indicator circles    | `radii.full` | 9999px |
| Search field (sidebar)    | `radii.full` | 9999px |
| Badges / chips            | `radii.full` | 9999px |
| Tooltips                  | `radii.md`   | 6px    |
| Dropdown menus            | `radii.md`   | 6px    |

---

## 6. Shadows

| Usage                          | Token          |
|--------------------------------|----------------|
| Sidebar container              | `shadows.sm`   |
| Form card                      | `shadows.DEFAULT`|
| Dropdowns / popovers           | `shadows.md`   |
| Modal overlays                 | `shadows.lg`   |
| Sticky table headers           | `shadows.xs`   |

Cards sit on a light-gray background (`surface.background`). The card shadow is subtle — use `shadows.DEFAULT` or `shadows.sm`, not heavy shadows.

---

## 7. Motion and Animation

This is a **data-entry application** for financial professionals. Motion must be:
- **Functional only** — indicate state change, not decorative
- **Brief** — prefer 100–200ms durations for most interactions
- **Reduced-motion safe** — always honour `prefers-reduced-motion: reduce`

| Interaction                    | Duration token   | Easing token |
|--------------------------------|------------------|--------------|
| Button hover/active state      | `motion.fast`    | `easeOut`    |
| Input focus ring appear        | `motion.fast`    | `easeOut`    |
| Dropdown / menu open           | `motion.normal`  | `easeOut`    |
| Modal fade in                  | `motion.normal`  | `easeInOut`  |
| Sidebar expand / collapse      | `motion.moderate`| `easeInOut`  |
| Toast / notification slide in  | `motion.normal`  | `spring`     |
| Step indicator transition      | `motion.moderate`| `easeInOut`  |

For the balance totals (RC-003), the difference value update on debit/credit change has no animation — it must update instantly (`motion.instant`) to feel responsive.

---

## 8. Layout

### Application Shell

```
┌─────────────────────────────────────────────┐
│  Header bar (56px, primary.500 background)  │
├────────────┬────────────────────────────────┤
│  Sidebar   │  Content area                  │
│  (272px)   │  (flex-1, surface.background)  │
│  white bg  │                                │
└────────────┴────────────────────────────────┘
```

The sidebar is always visible on desktop (`lg` breakpoint and above). On smaller screens it collapses to an icon-only rail or a hamburger-triggered drawer.

### Content Area

- Content area has a `surface.background` (neutral.100) canvas.
- Main content is displayed in white `surface.card` panels with `shadows.DEFAULT`.
- Maximum content width: `1280px` centered (xl breakpoint).
- Page content padding: `spacing.6` (24px) on all sides.

### Breadcrumb

A breadcrumb trail appears directly under the header bar in the content area (e.g. "Home > Marketing > Create campaign"). Use `text.secondary` at `sm` size.

---

## 9. Step Wizard Pattern

The Fiserv Admin Tool uses a horizontal step indicator for multi-step flows. For any multi-step workflow in the Prologue Client (e.g. year-end close wizard, import wizard):

- Active step: filled circle with `step.active` (`#1B4290`) background, white number, bold label below in `primary.500`
- Completed step: filled circle with `accent.500` or a checkmark
- Inactive step: circle with `neutral.300` border, `neutral.400` number, `text.secondary` label
- Connector lines: `neutral.300` between steps

---

## 10. Navigation Sidebar Conventions

- Top item: entity/tenant selector with bank icon (rounded square badge, `primary.500` icon)
- Navigation search field: full-width pill shape, `neutral.200` background
- Section headers (bold): `text.primary`, `fontWeight.semibold`, `fontSize.base`
- Section sub-items (indented): `text.secondary`, `fontWeight.regular`, no icon
- Active item: left border accent in `primary.500`, background `primary.50`
- Hover: background `neutral.100`
- Bottom: user identity strip (avatar + name + role)

---

## 11. Form Patterns

Based on the Campaign details form observed in the reference images:

- **Labels**: `fontSize.base`, `fontWeight.medium`, `text.primary` — above the input field
- **Inputs**: white background, `border.default` border, `radii.sm` radius, `fontSize.base`
- **Optional labels**: `fontSize.xs`, `text.secondary`, rendered below the input
- **Two-column row**: equal-width columns with `spacing.4` gap (Product category + Priority, Start date + End date)
- **Full-width inputs**: for text fields requiring full width (name, description)
- **Textarea**: same styling as input, minimum 3 rows
- **Dropdowns**: chevron indicator on the right, same styling as text input
- **Date pickers**: calendar icon on the right in `accent.500`
- **Error state**: `border.error` border, `state.error` helper text below
- **Focus state**: `border.focus` (`primary.500`) ring, 2px solid

---

## 12. Button Conventions

| Variant   | Background      | Text          | Border         | Hover               |
|-----------|-----------------|---------------|----------------|---------------------|
| Primary   | `accent.500`    | `text.inverse`| none           | `accent.600`        |
| Secondary | `surface.white` | `primary.500` | `primary.500`  | `primary.50` bg     |
| Ghost     | transparent     | `primary.500` | none           | `primary.50` bg     |
| Danger    | `state.error`   | `text.inverse`| none           | darker red          |
| Disabled  | `neutral.300`   | `neutral.500` | none           | no change           |

CTA buttons (Post, Save, Next) use the **Primary** variant in `accent.500`. Destructive actions (Delete, Unpost if destructive) use the **Danger** variant.

---

## 13. Accessibility Constraints

- All interactive elements must have visible focus rings using `border.focus` (`primary.500`), `2px solid`, `2px offset`.
- Do not rely on colour alone for state communication — pair colour with icon or text label.
- Minimum contrast ratio: **4.5:1** for normal text, **3:1** for large text and UI components (WCAG 2.1 AA).
- The `accent.500` green (`#3A7D44`) on white achieves > 5:1 contrast — safe for buttons.
- The `primary.500` blue (`#1B4290`) on white achieves > 9:1 contrast — safe for all text uses.
- Sidebar navigation must be keyboard-traversable (Tab / Shift-Tab, Enter to expand/collapse).
- All form inputs must have associated `<label>` elements (not just `placeholder`).
- Honour `prefers-reduced-motion` — disable all non-essential transitions when set.

---

## 14. Data Grid Conventions (GL-specific)

Journal entry line grids and review lists follow these conventions:

| Element              | Style                                     |
|----------------------|-------------------------------------------|
| Header row           | `neutral.100` bg, `fontWeight.semibold`, `fontSize.sm`, `text.secondary` |
| Body rows            | white bg alternating with `neutral.50`    |
| Row hover            | `primary.50` bg                           |
| Selected row         | `primary.100` bg, left border `primary.500` |
| Numeric cells        | right-aligned, monospace font             |
| Debit/credit columns | right-aligned, 2 decimal places           |
| Difference (balanced)| `text.primary`                            |
| Difference (unbalanced) | `state.error` text, `state.errorLight` cell bg |
| Totals row           | `neutral.100` bg, `fontWeight.semibold`   |
| Action column        | right-aligned icon buttons                |

---

## 15. Tokens Not Extracted (Defaults Applied)

The following token categories were not directly observable in the reference images. Sensible defaults matching Tailwind's standard scale have been applied:

| Category           | Default Applied              |
|--------------------|------------------------------|
| Motion durations   | 100/200/300/400/600ms scale  |
| Motion easings     | Standard CSS easing functions|
| Z-index scale      | 100/200/300/400/500/600 tiers|
| Mono font family   | JetBrains Mono / Fira Code   |

These defaults are safe for a financial application and can be overridden by supplying additional brand guidelines in `ui-style-inputs/` in a later sprint.
