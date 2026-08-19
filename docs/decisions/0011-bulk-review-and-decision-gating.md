# Decision 0011: Add selected bulk review and gate final approval

**Date:** 2026-08-19  
**Status:** Accepted

## Decision

The review backlog supports an explicit selection workflow:

- Every backlog row has a labeled checkbox.
- A visible `Select all` control selects or clears the current backlog.
- `Start selected reviews` becomes available when at least two reviews are selected.
- Selected reviews open in one combined, request-local workspace and export to one CSV, while retaining a separate final human decision for each review.

The evidence workspace uses responsive field cards instead of a wide comparison table. Each card keeps the field name, automated status, entered value, AI-observed value, confidence, explanation, reviewer disposition, and reviewer note together. Cards use one or two columns depending on available width and do not require horizontal scrolling.

A reviewer can adjudicate both `mismatch` and `needs_review` fields as approved or rejected. This human disposition remains separate from the automated comparison status. A review's final `Approve` button is enabled only when every field is either an automated match or has an explicit reviewer approval. Changing a required field disposition away from approved returns an existing final approval to pending. Final rejection remains available at any time.

## Rationale

Reviewers need to work through related queue items without repeatedly returning to the backlog, but bulk review must not become bulk automatic approval. Explicit selection and per-review final decisions preserve human accountability.

The former five-column results table required horizontal scrolling and separated related evidence from reviewer controls. Responsive cards provide more usable reading widths, allow a shorter note input, and preserve a clear label and reading order at narrow viewports.

Gating final approval prevents a review from being marked approved while an automated mismatch or uncertain field remains unresolved. Allowing an explicit human approval on a mismatch preserves the reviewer as the final decision-maker without overwriting the automated evidence.

## Consequences

- Bulk review remains browser-memory-only and is lost on refresh, consistent with the current MVP architecture.
- The combined CSV repeats each result's application and source values using the existing row schema.
- Backlog selection is not a final decision and never changes review status by itself.
- Field-card semantics and keyboard order must remain covered by accessibility regression checks.
- A disabled final approval includes visible status text explaining which prerequisite remains.
