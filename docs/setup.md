# Local setup

## Requirements

- Node.js 24 LTS
- npm 11 or a compatible npm version

## Install and run

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:3000`.

The review backlog loads 12 complete synthetic examples from
`public/sample-reviews.csv` as soon as the page opens. Select **Open review** on
any row to inspect its synthetic label artwork and seven field comparisons. The
review workspace initially shows those fields in a compact table with separate AI
and reviewer statuses. Select anywhere on a field summary bar, or use its field-name
button, to expand its evidence, reviewer decision, and note. Fields whose AI
comparison is `mismatch` or `needs_review` expand automatically when an
application is opened because they require an explicit reviewer decision.
Successful live reviews are prepended to that list in browser memory. Refreshing
the page clears live entries, reviewer decisions, and reviewer notes, then
reloads the 12 examples.
The backlog displays 10 reviews per page; there is no server-side review history
or database in this MVP.

Every field accepts a reviewer note and direct **Approve** and **Reject** field
buttons. Matching AI comparisons default to reviewer-approved, but that optional
decision can be changed to rejected. Mismatches and `needs_review` comparisons
require explicit reviewer approval before final application approval is enabled.
The AI status is retained unchanged for auditability. Every complete review also
has a final human decision of `approved` or `rejected`. Pending applications
remain in the review backlog; a final decision moves the application into the
separate completed table. Both tables can reopen a review. An annotated CSV
export is available from **Download all results CSV** on the review backlog home
page. It contains every pending and completed review currently in browser memory,
including field evidence, final decisions, field decisions, and notes. The
application-review workspace itself retains only its backlog navigation actions.

The **Label artwork** section also offers three official TTB sample labels. A
selection loads the artwork into the same preview used for uploaded files and
fills the corresponding expected application values. Reviewers can still edit
those values before verification or use the upload control for their own single
or batch images. Source details are recorded in `docs/sample-labels.md`.

The checked-in configuration uses the deterministic `mock` extraction provider. The page displays this mode clearly. It exercises upload validation, verification, and CSV generation, but it does not inspect the uploaded image.

To use live image extraction, set these values in `.env`:

```dotenv
EXTRACTION_PROVIDER=openai
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.6-luna
```

The service fails at startup if `openai` is selected without an API key. It never silently falls back to fixture results.

## Verification commands

```powershell
npm run format
npm run lint
npm run typecheck
npm test
npm run build
```

## API

`POST /api/verifications` accepts `multipart/form-data`. A single verification may use the legacy `label` file field or the `labels` field and these text fields:

- `applicationId` (optional)
- `brandName`
- `classType`
- `alcoholContent`
- `netContents`
- `bottlerNameAddress`
- `countryOfOrigin` (optional; imports only)

The government health warning is not a caller-entered field because its required wording is configured centrally. It is extracted and checked automatically for every label.

For a batch, attach 2–10 images as repeated `labels` fields and provide `applications` as a JSON array in the same order. Every array item uses the application fields above. The server processes at most two images concurrently and preserves failed items as `needs_review` rows instead of discarding successful results.

Requests with `Accept: application/json` return the structured on-page result plus its request-scoped CSV export. The browser displays the review without a review-workspace download action and provides the combined annotated export from the backlog home page. Requests with `Accept: text/csv` return the CSV as an attachment for direct API clients. Invalid uploads and extraction failures return a structured JSON error with a non-2xx status.

`GET /sample-reviews.csv` returns the checked-in field-level synthetic backlog
fixture. It is demo data, not a durable review store. Reviewer annotations are
not written back to this fixture.

`GET /api/status` returns service health and the active extraction mode. It does not expose credentials.

## Live-provider troubleshooting

- `EXTRACTION_PROVIDER` must be `openai`; changing `.env` requires a server restart.
- `EXTRACTION_CREDITS_EXHAUSTED` means the key authenticated but its OpenAI organization or project has no available API credits. Add billing/credits before retrying.
- `EXTRACTION_AUTH_FAILED` means the key or project access is invalid.
- `EXTRACTION_RATE_LIMITED` is temporary; wait briefly before retrying.
- A successful `/api/status` response confirms configuration selection, not that the account has credits. A real label verification is the end-to-end check.
