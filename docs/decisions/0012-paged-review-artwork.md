# Decision 0012: Page bulk reviews and retain session artwork

**Date:** 2026-08-19  
**Status:** Accepted

## Decision

Place the `Start selected reviews` action directly below the backlog table, together with live text that reports the number of selected reviews.

When more than one backlog item is opened, show one application at a time. A native application selector and Previous/Next buttons change the active page. Field annotations and final decisions remain attached to every selected result, and the bulk CSV continues to export all selected results rather than only the visible page.

Show the current review's label artwork beside its summary. Artwork uploaded or chosen during the browser session is retained with an object URL until the page is closed. Repository-backed sample artwork uses its static URL. If a demo backlog fixture has no corresponding image in the repository, show an explicit unavailable message instead of substituting unrelated artwork.

## Rationale

Putting the bulk action after the selectable rows follows the reviewer's reading and keyboard order. Paging keeps the evidence workspace at a manageable length and makes the current application's final decision unambiguous. Displaying the source image alongside the extracted evidence helps the reviewer validate the automated comparison without returning to the upload form.

The six existing CSV fixtures reference filenames whose images are not present in the repository. An honest unavailable state preserves the provenance of the evidence and avoids implying that a different sample image was reviewed.

## Consequences

- Paging changes presentation only; it does not introduce storage or server-side state.
- Switching pages rerenders the current result while preserving annotations and decisions in browser memory.
- Uploaded image object URLs are released on page exit and are not included in CSV output.
- The pager is hidden for a single review.
- Application changes are announced through a polite live region, and every pager control remains a native keyboard-operable control.
