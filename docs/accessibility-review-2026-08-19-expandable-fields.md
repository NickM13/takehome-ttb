# Expandable Field Table Accessibility Check — 2026-08-19

## Scope

This incremental source-level check covers the renamed application-review workspace and the compact expandable field table.

## Findings

- Field summaries use a native table with a programmatic caption, column headers, and row headers.
- Every field name is a native button with a 44-pixel minimum target, `aria-expanded`, `aria-controls`, and an accessible action name containing the field.
- A decorative chevron rotates with the expanded state and is hidden from assistive technology; the state remains available through `aria-expanded` and the visible `View details` or `Hide details` text.
- The hidden detail row is removed from the accessibility tree with the native `hidden` attribute.
- AI comparison and reviewer status remain separate textual cells, so color is not the only status signal.
- Changing a reviewer disposition updates the visible compact status without rerendering or collapsing the current detail row.
- Expanded content retains description-list semantics for entered and observed values and explicit labels for reviewer controls.
- At the narrow-layout breakpoint, column headers are visually hidden and each status cell displays its own visible label.
- Expanded summaries are highlighted, and each detail section ends with a thicker border so adjacent fields remain distinguishable without color as the only cue.

## Remaining manual verification

No controllable browser was connected during this change. Before deployment sign-off, verify:

1. Table and button announcements with current NVDA and Firefox or Chrome.
2. Expand and collapse behavior using Tab plus Enter and Space.
3. Focus retention after field approval or rejection and after final-approval gating changes.
4. Status scanning and expanded content at 320 CSS pixels, 200% text size, 400% zoom, and increased WCAG text spacing.
5. Contrast and focus visibility for field-name buttons, status badges, and expanded rows.
6. An axe scan with all rows collapsed, one expanded row, several expanded rows, and approved and rejected field states.
