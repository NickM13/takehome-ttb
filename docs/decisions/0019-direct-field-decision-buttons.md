# Decision 0019: Use direct field-decision buttons

**Date:** 2026-08-19  
**Status:** Accepted

## Decision

Replace each field-level reviewer-decision dropdown with two native toggle
buttons: **Approve** and **Reject**. Expose the selected state with
`aria-pressed`, retain visible selected styling, and give each button an
accessible name containing its field and application context.

Expose these buttons for every field. A matching AI comparison initializes with
the independent reviewer decision `approved`, so no action is required. A
reviewer may change that decision to `rejected`. Fields whose AI comparison is
`mismatch` or `needs_review` remain undecided until the reviewer explicitly
approves or rejects them.

Final application approval requires every flagged field to be reviewer-approved
and no field to be reviewer-rejected. The automated AI comparison remains
unchanged when a reviewer chooses either button.

## Rationale

Two visible actions require fewer interactions than opening and choosing from a
dropdown. Applying the same control to matching fields lets reviewers record an
exception without implying that the automated status changed.

Default approval for matching fields preserves the existing low-friction happy
path. Treating a manual rejection as an approval blocker prevents the final
decision from contradicting field-level reviewer evidence.

## Consequences

- Every expanded field presents two 44-pixel native button targets.
- Matching fields display `Approved` immediately but their decision remains
  optional and reversible.
- Flagged fields still require explicit reviewer approval for final approval.
- Button groups have visible labels and programmatic group names; selected state
  is conveyed through text, color, and `aria-pressed`.
- Reviewer notes and automated comparison values remain independent.
