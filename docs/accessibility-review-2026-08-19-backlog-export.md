# Backlog Export Accessibility Check — 2026-08-19

## Scope

This incremental source-level check covers the combined results download action
on the review backlog home page.

## Findings

- The export is a native button with an explicit `Download all results CSV`
  label.
- The button is disabled while no exportable reviews are available and becomes
  available when the backlog renders.
- Its placement in the backlog header precedes the hidden application-review
  workspace in reading and keyboard order.
- Successful activation updates the existing polite backlog status message with
  the number of exported reviews.
- The application-review workspace contains no duplicate download control.

## Remaining manual verification

No controllable browser was connected during this change. Before deployment
sign-off, verify:

1. Button focus and activation with Tab, Enter, and Space.
2. The disabled-to-enabled state after the sample backlog loads.
3. The download announcement with current NVDA and Firefox or Chrome.
4. Button wrapping at 320 CSS pixels, 200% text size, and 400% zoom.
