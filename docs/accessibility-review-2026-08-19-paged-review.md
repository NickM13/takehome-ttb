# Paged Review Accessibility Check — 2026-08-19

## Scope

This incremental source-level check covers the relocated bulk-review action, current-label artwork, and paging controls for a multi-application review.

## Findings

- The bulk action follows the backlog table in DOM and visual order. A polite status message reports whether zero, one, or enough reviews are selected.
- Multi-review navigation uses native buttons and a labeled native select. Previous and Next are disabled at the corresponding boundaries.
- Only the active application's evidence and final decision are rendered, which keeps heading, label, and control relationships unique and concise.
- Page changes update a polite live region with the page number and application name.
- Available artwork has contextual alternative text. Missing fixture artwork is represented by visible text rather than an empty or unrelated image.
- At the narrow-layout breakpoint, the summary and pager become single-column layouts and buttons retain the existing 44-pixel target sizing.

## Remaining manual verification

The in-app browser connection was unavailable. Before deployment sign-off, verify the following in a rendered browser:

1. Keyboard order from backlog checkboxes to the bulk action, then through Previous, application selector, Next, evidence controls, and final decision.
2. Screen-reader announcements when selection count and active application change.
3. Artwork scaling and the missing-artwork message at 320 CSS pixels, 200% text size, and 400% zoom.
4. Focus visibility, disabled-control contrast, long application names, and page switching with unsaved reviewer-note text.
5. An axe scan of single-review, first bulk page, middle bulk page, final bulk page, and missing-artwork states.
