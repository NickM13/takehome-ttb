# Decision 0005: Official sample label selector

Date: 2026-08-18

## Decision

Offer three fictitious labels from TTB's official interactive anatomy tools in
a small selector above the existing upload control. Selecting an example loads
the same local PNG used for verification and fills its expected application
values. The reviewer can inspect the preview, edit those values, and start the
normal verification flow.

Keep direct upload and batch selection available. Sample selection represents a
single review and replaces any current file selection.

## Asset handling

TTB publishes each label as image strips. Reconstruct the strips into one PNG
with the front and other/back panels side by side so a single extraction call
can observe all seven MVP fields. Preserve the published pixels and record the
official sources in `docs/sample-labels.md`.

## Consequences

- Evaluators can exercise the workflow without locating their own artwork.
- Fictitious official examples avoid copying commercial COLA artwork.
- The same preview, upload validation, provider, comparison, backlog, and CSV
  paths are exercised; there is no fabricated verification response.
- Fixture extraction mode still returns its fixed OLD TOM values and will not
  inspect these samples. Live extraction is required to evaluate their actual
  content.
