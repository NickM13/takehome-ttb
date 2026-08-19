# Field Decision Button Accessibility Check — 2026-08-19

## Scope

This incremental source-level check covers the replacement of field decision
dropdowns with direct Approve and Reject buttons and the addition of optional
decisions to matching fields.

## Findings

- Each action is a native button with the existing 44-pixel minimum target.
- The two actions are grouped under a visible required or optional decision
  label using `role="group"` and `aria-labelledby`.
- Each button has an application- and field-specific accessible name.
- `aria-pressed` communicates the current decision independently of color, and
  the visible reviewer-status cell updates to Approved or Rejected.
- Matching fields default to Approve; mismatches and uncertain fields have no
  default selection and remain required for final approval.
- A manual rejection on any field disables final approval without changing the
  automated comparison status.

## Remaining manual verification

No controllable browser was connected during this change. Before deployment
sign-off, verify:

1. Approve and Reject announcements with current NVDA and Firefox or Chrome.
2. Button activation and focus retention with Tab, Shift+Tab, Enter, and Space.
3. Selected-state contrast and focus visibility for both actions.
4. Final-approval gating after rejecting and reapproving a matching field.
5. Button wrapping at 320 CSS pixels, 200% text size, and 400% zoom.
