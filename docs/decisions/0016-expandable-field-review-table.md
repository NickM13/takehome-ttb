# Decision 0016: Use an expandable field review table

**Date:** 2026-08-19  
**Status:** Accepted

## Decision

Use `Application review` for every single-application workspace, including a review opened from a pending or completed queue row. Use `Batch application review` for a newly verified batch and `Bulk application review` for a queue multi-selection. This replaces the ambiguous `Backlog review` name.

Replace the always-expanded field-card grid with a compact three-column table:

- Field
- AI comparison
- Reviewer status

Each field name is a native button that expands a full-width detail row. A decorative chevron to the left of the field rotates to reflect the expanded state, while the button's `aria-expanded` value provides the same state programmatically. The detail row contains the entered value, AI-observed value, confidence, comparison explanation, reviewer disposition control when required, and reviewer note. Changing a field disposition updates the compact reviewer-status cell without collapsing the detail row.

The compact status is `Not required` for an automated match, `Needs review` before human adjudication, and `Approved` or `Rejected` after a reviewer decision. Automated evidence and human status remain separate.

## Rationale

Seven always-expanded field cards make it difficult to understand overall progress and require substantial scrolling. A table lets the reviewer scan the complete field set and identify unresolved or rejected fields before choosing which evidence to inspect.

Expandable detail rows retain the context and controls from the card interface without reintroducing a horizontally scrolling evidence table. Renaming the workspace prevents confusion between the `Review backlog` queue and the application currently being reviewed.

## Consequences

- Field details are collapsed when an application is first opened or when the reviewer changes applications.
- Multiple detail rows may be expanded at once.
- Field-name buttons expose `aria-expanded` and `aria-controls` and update their visible action text.
- An expanded summary is highlighted and its detail row ends with a strong border, making the boundary between adjacent fields clear without relying on color alone.
- On narrow screens, the table header is visually hidden and each status cell displays its own column label.
- Final application approval remains gated by the same field-level decision rules.
