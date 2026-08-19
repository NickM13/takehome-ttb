# Task View Accessibility Check — 2026-08-19

## Scope

This incremental source-level check covers the backlog home view, new-verification and return controls, mutually exclusive task views, and automatic advancement after a final batch decision.

## Findings

- Every transition uses a native button with visible task-specific text. The long review workspace exposes its backlog return action at both the top and bottom.
- The verification form is hidden on initial load, leaving the backlog as the primary application view.
- Only one of the backlog, form, and review workspace is visible at a time. Hidden content is removed from the accessibility tree through the native `hidden` attribute.
- Each transition moves focus without forcing an animated focus scroll, then scrolls the main content according to the user's reduced-motion preference.
- After a final batch decision, the next application's heading receives focus and a polite live region announces the completed decision, next application, and position in the batch.
- Automatic advancement does not occur for a single review or after the last application in a batch.

## Remaining manual verification

No controllable browser was connected during this change. Before deployment sign-off, verify:

1. Initial focus order and keyboard activation of `Start new verification`.
2. Focus placement and screen-reader announcements when entering the form, returning home, opening a review, and automatically advancing a batch.
3. That reviewer notes and field decisions persist when paging and switching views.
4. View layouts at 320 CSS pixels, 200% text size, 400% zoom, and increased WCAG text spacing.
5. Browser history expectations with representative reviewers, since the MVP uses in-page navigation rather than URL routes.
6. An axe scan of all three views and the batch state immediately after automatic advancement.
