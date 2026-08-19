# Decision 0021: Make field rows clickable and open uncertain evidence

**Date:** 2026-08-19  
**Status:** Accepted

## Decision

Allow a pointer click anywhere on a field summary row—field name, AI comparison,
or reviewer status—to expand or collapse that field's detail row. Retain the
field-name button as the semantic disclosure control for keyboard and assistive
technology users.

When an application review is rendered, initialize every field that requires an
explicit reviewer decision as expanded. This includes automated `mismatch` and
`needs_review` fields. Initialize `match` fields as collapsed. The visible hint,
chevron direction, highlighted summary, hidden detail state, and button
`aria-expanded` value must all derive from the same expansion function.

## Rationale

Restricting pointer activation to the first table column makes a wide summary row
feel less responsive. Treating the complete row as the pointer target reduces
precision demands without replacing the native button semantics.

Flagged fields are the items that require reviewer attention and evidence
inspection. Opening them immediately removes repetitive disclosure actions while
leaving matches compact for scanning.

## Consequences

- Pointer users can activate any non-detail portion of the summary row.
- Keyboard users continue to activate the field-name button with Enter or Space.
- The button stops click propagation so one activation cannot toggle twice.
- Paging or reopening an application recreates the initial state and expands its
  `mismatch` and `needs_review` fields again.
- Multiple fields may remain expanded simultaneously.
