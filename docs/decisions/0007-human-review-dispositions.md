# Human review dispositions

Date: 2026-08-18

## Decision

Keep AI comparison results and reviewer decisions as separate values. Every
field accepts a reviewer note. Fields whose AI status is `needs_review` also
accept `approved` or `rejected`; matching and mismatching fields retain their AI
status and accept notes but do not expose a second disposition control.

Each complete review also accepts a final `approved` or `rejected` human
decision regardless of its aggregate AI status. The backlog displays that final
decision as a separate badge and treats an undecided review as pending.

Each seeded or newly completed backlog row opens the same field-level review
interface. The repository fixture contains one row per field so the six demo
reviews are fully inspectable rather than summary-only.

Reviewer annotations are held in browser memory and are added to the currently
open report as `review_decision`, field-level `reviewer_decision`, and
`reviewer_note` columns when the reviewer downloads the CSV. Spreadsheet
formula-injection protection is applied to the client-generated annotation
cells as well as the rest of the export.

## Rationale

The automated result is evidence for a human decision-support workflow, not the
final agency determination. Preserving both values avoids presenting a reviewer
override as if it were the original extraction result. Session-only state keeps
the no-database MVP constraint while still making the backlog demonstrable.

## Consequences and limits

- Refreshing or closing the page discards reviewer decisions and notes unless
  the annotated CSV was downloaded.
- The current interface adjudicates only `needs_review` fields. It does not
  overturn an explicit automated mismatch.
- There is no reviewer identity, timestamp, authentication, concurrency control,
  or durable audit trail in this MVP.
