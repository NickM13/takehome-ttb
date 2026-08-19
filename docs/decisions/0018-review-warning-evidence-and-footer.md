# Decision 0018: Show warning evidence and simplify review navigation

**Date:** 2026-08-19  
**Status:** Accepted

## Decision

Store the complete configured government warning as the expected value in every
sample review. Store the concrete AI-observed transcription separately. Matching
fixtures contain the complete observed statement; the mismatch and uncertain
fixtures contain the incomplete or obscured text represented by their artwork.

Reduce the bottom of the application-review workspace to one **Back to review
backlog** button. Remove **Start new verification** and **Download CSV** from
that workspace. Use the same compact secondary-button treatment as the backlog
action at the top of the review.

## Rationale

The placeholder `Required government warning wording` did not provide the
expected-versus-observed evidence needed for review. The full statements let a
reviewer inspect exactly what was required and what extraction returned.

The extra footer actions duplicated navigation available from the backlog and
made the end of the decision workflow less focused. A single consistent return
action makes the next step unambiguous.

## Consequences

- Government-warning detail rows are longer but contain auditable evidence.
- The sample CSV correctly quotes warning values because they contain commas.
- Direct API clients may still request `text/csv`; the application-review UI no
  longer exposes its client-side annotated download action.
- Starting a new verification remains available from the review backlog home
  view.
