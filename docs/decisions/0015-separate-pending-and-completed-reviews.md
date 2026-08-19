# Decision 0015: Separate pending and completed reviews

**Date:** 2026-08-19  
**Status:** Accepted

## Decision

Keep one browser-memory review collection but present it as two home-page tables:

- **Review backlog** contains only applications without a final human decision.
- **Approved and rejected** contains applications with a final `approved` or `rejected` decision.

Recording either final decision immediately rerenders both tables and places the application in the completed table. Completed reviews remain reopenable and retain their AI status, field dispositions, reviewer notes, final decision, artwork reference, and CSV export during the browser session.

`Select all awaiting reviews` selects every pending application across all backlog pages. Completed applications are removed from the selection set and cannot be included by the backlog Select all control. The existing 10-row pagination applies to pending applications only.

## Rationale

The pending queue should communicate remaining work rather than mix actionable and finished applications. A separate completed table gives reviewers immediate confirmation that a decision was recorded while preserving access to the supporting evidence.

Limiting bulk selection to pending applications prevents accidental reprocessing of work that already has a final decision. Keeping one underlying in-memory collection avoids duplicating state or introducing persistence.

## Consequences

- Counts report awaiting and completed applications separately.
- The completed table is hidden until the first final decision in the session.
- Completed rows are ordered by the most recently recorded final decision.
- Changing an existing completed decision updates its row and moves it to the top of the completed table.
- Refreshing still restores all repository fixtures to the pending backlog because final human decisions are not persisted.
