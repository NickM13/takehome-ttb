# Decision 0003: Bounded in-request batch upload

Date: 2026-08-18

## Decision

Support one to ten JPEG, PNG, or WebP label images in the same verification request. The browser shows a thumbnail preview for each selected image and copies the default application values into an editable per-label record. File order determines the mapping between uploaded images and application-value records.

The server processes no more than two extraction calls concurrently. Results remain in input order and are returned as grouped on-page comparisons plus one combined CSV.

## Partial failure behavior

Single-label provider or image failures remain non-2xx errors. In a batch, an item-level failure becomes a `needs_review` result for that label so successful items are not lost. The explanation contains the user-safe failure reason; no raw provider response or secret is included.

## Consequences

- Reviewers can handle small importer submissions without one-at-a-time uploads.
- Preview and per-file expected values make selection mistakes visible before API calls.
- Ten 10 MB files can still consume meaningful request memory, so the limit must not be raised without measurement.
- This does not yet address 200–300 item production batches; durable jobs and storage remain out of scope for the stateless MVP.
