# Decision 0014: Expand and page the demo backlog

**Date:** 2026-08-19  
**Status:** Accepted

## Decision

Expand `public/sample-reviews.csv` from six to 12 complete synthetic reviews. Every review retains the same seven field rows and represents a deliberate mix of automated matches, mismatches, and uncertain evidence.

Display at most 10 backlog reviews per page. Previous and Next controls and a live page summary appear directly below the backlog table when more than one page exists. The total backlog count continues to report every review, and selections remain active when the reviewer changes pages.

`Select all` continues to select the complete browser-session backlog, including reviews on other pages. Newly completed verifications are prepended and return the backlog to its first page so the new rows are immediately visible.

## Rationale

Twelve samples better demonstrate queue handling while keeping the initial table compact. A fixed 10-row page prevents the home view from growing indefinitely as live reviews are added, without introducing server-side pagination or persistence for this MVP.

Preserving cross-page selections allows reviewers to assemble a bulk review without losing work when navigating the queue. The visible selected count makes hidden-page selections explicit.

## Consequences

- Pagination is browser-only and recalculated whenever the in-memory backlog changes.
- The second initial page contains two reviews; live reviews can increase the number of pages during the session.
- Reviewer decisions rerender only the current backlog page and do not reset pagination.
- Demo artwork remains unavailable where a matching repository image is not present; no unrelated artwork is substituted.
