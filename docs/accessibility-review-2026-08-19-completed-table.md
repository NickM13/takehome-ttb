# Completed Review Table Accessibility Check — 2026-08-19

## Scope

This incremental source-level check covers the separate pending and completed tables, pending-only Select all behavior, the empty-backlog state, and reopening completed reviews.

## Findings

- Pending and completed data are presented in separately named sections with separate table captions.
- Both tables retain native row headers and textual AI and human decision statuses.
- Completed rows do not expose selection checkboxes, preventing them from being included through backlog bulk controls.
- Select all derives its target set from applications without a final human decision, including pending applications on other pages.
- Selected completed IDs are pruned immediately when a final decision rerenders the tables.
- An explicit empty-state message replaces the pending table when no applications remain.
- Completed rows retain an accessible `Open review` action with the application context in its name.

## Remaining manual verification

No controllable browser was connected during this change. Before deployment sign-off, verify:

1. Approving and rejecting single and batch reviews moves rows and updates both counts without unexpected focus loss.
2. Select all after one or more decisions selects only pending rows across all pages.
3. Screen-reader table navigation distinguishes the pending and completed captions and column sets.
4. Reopening a completed review and changing its final decision updates its completed-row status.
5. Empty-backlog and first-completed-row transitions at 320 CSS pixels, 200% text size, 400% zoom, and increased WCAG text spacing.
6. An axe scan with pending-only, mixed pending/completed, and completed-only states.
