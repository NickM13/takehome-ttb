# Decision 0002: Show comparison results before CSV export

Date: 2026-08-18

## Decision

Show successful verification results in an on-page comparison section before asking the reviewer to download anything. Each row includes the entered value, AI-observed value, extraction confidence, comparison status, and a short explanation. The same response carries a server-generated CSV that the user may download explicitly.

The API remains stateless and supports two representations:

- `Accept: application/json` returns the structured result and request-scoped CSV content for the browser.
- `Accept: text/csv` preserves direct CSV attachment behavior for API clients.

## Error behavior

Known provider failures must be actionable without exposing credentials or raw provider responses. Authentication, exhausted credits, rate limiting, invalid provider image input, network failure, and timeout receive distinct user-safe messages.

## Consequences

- Reviewers can verify what the AI observed before saving the report.
- The form retains entered values for correction and retry.
- CSV generation stays server-side, including escaping and spreadsheet-injection protection.
- The result and CSV exist only in browser memory and disappear on refresh.
