# Decision 0020: Export all review results from the backlog

**Date:** 2026-08-19  
**Status:** Accepted

## Decision

Place one **Download all results CSV** button in the review backlog header. Keep
the application-review workspace free of download actions.

The export includes every review currently represented on the backlog home page:
pending reviews first, followed by completed reviews ordered by most recent final
decision. Each field row includes application and source identifiers, automated
evidence and status, final reviewer decision, field reviewer decision, reviewer
note, confidence, explanation, and processing time.

Matching fields that have not been opened export their default reviewer decision
as `approved`. Unresolved flagged fields and pending final decisions remain blank.
All user- and model-controlled values retain CSV quoting and spreadsheet-formula
injection protection.

## Rationale

A single queue-level export is faster and clearer than opening individual reviews
to download separate reports. It also produces one filterable artifact containing
the current pending and completed workload.

Keeping the action on the backlog makes its all-results scope visible and avoids
adding unrelated actions to the focused field-review workflow.

## Consequences

- The button is disabled until at least one review has loaded.
- The export reflects browser-memory state at the moment of download and does not
  create server-side storage.
- Refreshing still discards live reviews, decisions, and notes.
- The raw **Download sample CSV** link remains available separately for the
  repository fixture.
- Direct API clients may continue requesting request-scoped `text/csv` responses.
