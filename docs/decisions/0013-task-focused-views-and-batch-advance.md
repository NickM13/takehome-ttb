# Decision 0013: Use task-focused views and advance batch decisions

**Date:** 2026-08-19  
**Status:** Accepted

## Decision

Treat the review backlog as the application's home view. The initial page shows the backlog and supporting overview, while the application form remains hidden until the reviewer chooses `Start new verification`.

Use three mutually exclusive browser-memory views:

1. Backlog home
2. New verification form
3. Review workspace

The verification form provides a native button back to the backlog. The longer review workspace provides the same action at both its beginning and end so a reviewer does not need to cross all evidence to leave the task. Starting a new verification clears the prior file selection and form message. Returning to the backlog does not remove completed reviews, reviewer annotations, or final decisions from the current browser session.

In a multi-application review, recording a final `Approve` or `Reject` decision automatically opens the next application when one remains. The application selector and Previous/Next controls remain available for non-linear navigation. Automatic advancement changes presentation only; it does not create or infer decisions for any other application.

## Rationale

Showing the queue, long verification form, and review workspace in one document required substantial manual scrolling and made the current task less obvious. Mutually exclusive views reduce page length and establish the queue as a clear starting point without adding a frontend framework or client-side router.

The final decision is made at the bottom of each application's evidence. Automatically moving and scrolling to the beginning of the next application avoids requiring the reviewer to return to the pager after every decision.

## Consequences

- View state is ephemeral and is not encoded in the URL or stored on the server.
- Browser Back does not navigate between the three views; the visible in-page buttons are the supported navigation for this MVP.
- View changes move programmatic focus to the new view heading and honor reduced-motion preferences.
- The last application in a batch remains visible after its final decision so the reviewer can confirm the outcome or download the combined CSV.
- Existing final-approval gating remains unchanged: automatic advancement occurs only after an enabled final decision is activated.
