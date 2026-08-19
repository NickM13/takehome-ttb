# Decision 0010: Use a focused review mode

**Date:** 2026-08-19  
**Status:** Accepted

## Decision

Opening a backlog review or completing a verification switches the page into a focused review mode:

- The submission form is hidden while a review is active.
- The backlog remains visible above the review workspace so another queued item can still be opened.
- The field-by-field evidence and reviewer-note controls appear before the final human decision.
- The final decision uses two explicit buttons, `Approve` and `Reject`, instead of a select menu.
- The selected decision is exposed visually and through `aria-pressed`, updates the backlog immediately, and remains separate from the AI status and field-level dispositions.
- `Start new verification` leaves review mode, restores the submission form, and moves focus to its heading.

For a batch, each result retains its own pair of final-decision buttons. A decision begins as pending and can be changed between approved and rejected.

## Rationale

The former layout left a long submission form between the backlog and the opened review and placed the final decision before the evidence. Hiding the form shortens the backlog-to-review transition, while placing explicit final-decision buttons after the evidence follows the reviewer's task order and makes the consequential actions easier to find.

## Consequences

- The form remains in browser memory while hidden, so starting another verification can preserve application values while clearing the prior file selection.
- A successful verification is announced from the visible results section because the form's live-status region is hidden in review mode.
- The final-decision controls require mutually exclusive pressed-state styling and accessible names that identify the application or source file.
- Returning to data entry is an explicit action rather than an always-visible parallel workflow.
