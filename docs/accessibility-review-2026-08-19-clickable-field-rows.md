# Clickable Field Row Accessibility Check — 2026-08-19

## Scope

This incremental source-level check covers full-row pointer activation and the
automatic expansion of fields that require an explicit reviewer decision.

## Findings

- The existing native field-name button remains the keyboard and assistive
  technology disclosure control.
- Pointer activation on the summary row calls the same expansion function as the
  button, keeping `hidden`, `aria-expanded`, accessible name, visible hint,
  chevron, and expanded styling synchronized.
- Button clicks stop propagation, preventing an accidental double toggle.
- Automatically opened mismatch and uncertain fields expose
  `aria-expanded="true"` and their detail rows are present in the accessibility
  tree.
- Hover and focus-within styling identify the interactive summary without
  removing the existing visible focus indicator.

## Remaining manual verification

No controllable browser was connected during this change. Before deployment
sign-off, verify:

1. Row clicks in each of the three columns and field-button clicks.
2. Enter and Space activation with current NVDA and Firefox or Chrome.
3. Initial announcements for one and multiple automatically expanded fields.
4. Hover, focus, and expanded-state contrast at default and high-contrast settings.
5. Behavior at 320 CSS pixels, 200% text size, and 400% zoom.
