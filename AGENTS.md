# AGENTS.md

## Purpose

This repository contains a one-week MVP for an AI-assisted alcohol label verification application. The source of truth for product context is `README.md`. Read it before making product or architecture decisions.

The prototype should help Alcohol and Tobacco Tax and Trade Bureau (TTB) compliance agents compare application data with uploaded label artwork. It is a decision-support tool, not an autonomous approval system. Optimize for a convincing, reliable end-to-end workflow rather than broad regulatory coverage.

## Product Principles

Use these priorities, in order, when requirements compete:

1. Produce a working core review flow.
2. Make results easy to understand and verify.
3. Return a single-label result in about five seconds under normal demo conditions.
4. Handle errors and uncertain extraction safely.
5. Keep the interface obvious for users with widely varying technical comfort.
6. Add batch processing only after the single-label workflow is solid.

Prefer a smaller feature that is tested and demonstrable over an ambitious feature that is incomplete. Do not hide unsupported cases or low-confidence output behind a simple pass/fail result.

## MVP Scope

### Required core workflow

A user should be able to:

1. Provide expected application values.
2. Upload label artwork in a common image format.
3. Start verification with one clear action.
4. Receive the completed result as a downloaded CSV.
5. Use the CSV to see the overall status, field-by-field comparison, extracted evidence, and why each field matched, mismatched, or needs review.
6. Correct the input or retry after a clear error without losing unrelated work.

At minimum, support the example distilled-spirits fields in the README:

- Brand name
- Class/type designation
- Alcohol content, including proof where present
- Net contents
- Government health warning

If time permits, support the other common fields listed in the README and a simple batch upload flow.

### Explicit non-goals for this prototype

- Direct integration with COLA or other TTB systems
- Autonomous approval or rejection of an application
- Exhaustive enforcement of every beer, wine, and distilled-spirits regulation
- Production federal authorization, records management, or FedRAMP certification
- Long-term storage of uploaded documents or application data
- Training a custom OCR or vision model from scratch

Document any deviation from these boundaries before expanding scope.

## Working Product Assumptions

The README leaves some details open. Until the product owner says otherwise, use these reversible assumptions:

- Expected application fields may be entered manually or loaded from local fixture data; no external system integration is required.
- Common raster image formats are sufficient for the first vertical slice. PDF support is optional.
- One application maps to one logical label review, even if multiple label images are eventually supported.
- Uploaded files, extracted text, and verification results are request-scoped and ephemeral.
- Successful results are returned directly to the browser as a CSV download; no database or result-history view is required.
- The demo may use synthetic labels and non-sensitive data.
- The user remains the final decision-maker whenever the image is unreadable, extraction confidence is low, or a regulatory rule requires judgment.

Mark assumptions in user-facing documentation and keep them easy to change in code.

## Verification Behavior

Represent every check with one of three outcomes:

- `match`: the label satisfies the expected value or rule.
- `mismatch`: readable evidence contradicts the expected value or rule.
- `needs_review`: the value is missing, ambiguous, unreadable, unsupported, or below the confidence threshold.

Do not turn missing data, model errors, or low confidence into a definitive mismatch. The overall result should be `needs_review` if any required field cannot be assessed reliably.

Each result should preserve useful evidence where available:

- Expected value
- Extracted or observed value
- Status
- Short explanation
- Confidence or uncertainty signal, if supplied by the extraction provider
- Source text or image region, when practical

### Comparison rules

- Keep raw extracted text for evidence and debugging; compare normalized values separately.
- Normalize harmless presentation differences such as surrounding whitespace, repeated spaces, and ordinary capitalization for fields like brand name. Dave's `STONE'S THROW` versus `Stone's Throw` example should not be an automatic failure solely because of case.
- Do not use broad fuzzy matching without exposing it. If similarity is borderline, return `needs_review`.
- Parse alcohol values into canonical numeric forms when possible. Cross-check ABV and proof when both are present; for distilled spirits, proof is normally twice the ABV, subject to an explicit tolerance.
- Normalize equivalent net-content units only when conversion is exact and the displayed regulatory form is not itself under review.
- Treat the government warning as a dedicated rule, not a generic fuzzy text comparison. Validate required wording, the `GOVERNMENT WARNING:` heading, capitalization, and any presentation requirements the implementation can actually observe.
- OCR cannot reliably prove visual properties such as bold weight or minimum type size unless layout/style evidence is available. Return `needs_review` rather than claiming compliance when those properties cannot be assessed.

Keep regulatory text and rules in versioned configuration or fixtures with a citation to an authoritative TTB or eCFR source. Do not scatter regulatory strings or unexplained thresholds through UI components.

## Human-Centered UX

- Use plain language: `Matches`, `Does not match`, and `Needs review` are preferable to model or OCR jargon.
- Put the primary upload/verify action in the natural reading order and make it visually obvious.
- Show progress immediately and prevent accidental duplicate submissions.
- Preserve partial field results in the CSV if one field check fails; do not replace the entire review with a generic error.
- Pair status colors with text and icons so color is never the only signal.
- Ensure keyboard access, visible focus, associated form labels, readable contrast, and useful screen-reader status announcements.
- Explain how to fix upload problems, including unsupported format, oversized file, unreadable image, timeout, and provider failure.
- For a batch, provide clear processing feedback and include per-item states plus summary data in the downloaded CSV. Since results are not stored, a retry may require resubmitting the failed item.

Avoid chat-style interfaces unless they materially improve the review task. A structured checklist is easier to scan and audit.

## Architecture Guidance

### Chosen stack

- Use Node.js with TypeScript and Express for the application and backend.
- Keep TypeScript in strict mode and use runtime schema validation at all untrusted boundaries.
- Prefer a single deployable service. Express may serve a small static or server-rendered frontend in addition to the API; do not introduce a separate frontend service unless it materially simplifies the workflow.
- Do not add a database, ORM, cache, queue, or durable object storage for the MVP.
- Python/FastAPI is a fallback only if a required OCR, vision, or document-processing capability cannot be delivered reasonably in the Node.js service. Before adding Python, document the concrete blocker, deployment impact, and why a TypeScript-compatible provider or library is insufficient.
- The project owner will handle deployment, likely on Render's free offering. Agents should make the service deployment-ready but should not deploy it unless explicitly asked.

Use an actively supported Node.js LTS version, record it in the repository's runtime metadata, and keep local and production versions aligned. Choose one package manager, commit its lockfile, and use its commands consistently.

### Service design

Maintain clear boundaries between:

- Upload validation and image preparation
- Text/vision extraction provider
- Field parsing and normalization
- Deterministic comparison and regulatory rules
- Result aggregation
- API/transport layer
- Presentation layer

Use a provider interface around any external OCR or multimodal model so it can be replaced or faked in tests. Provider output must be validated before use. Prefer structured output with a schema over parsing free-form prose.

Keep verification stateless. A request should validate and preprocess its uploads, perform extraction and comparison, stream or buffer the completed CSV response, and then release temporary resources. Do not write generated reports into the repository or depend on local disk surviving between requests.

### CSV contract

Return a successful verification as `text/csv` with a safe `Content-Disposition: attachment` filename. Use a standards-compliant CSV serializer rather than assembling rows with string concatenation.

Use one row per verification field. The initial schema should include:

- `application_id` or another caller-supplied correlation value when available
- `source_file`
- `overall_status`
- `field`
- `expected_value`
- `observed_value`
- `field_status`
- `confidence`
- `explanation`
- `processing_time_ms`

Batch output should use the same columns and repeat application-level values on each row so the file remains easy to filter. If summary rows are added, give them an explicit `row_type`; do not overload field rows with a second shape.

Escape quotes, commas, and line breaks correctly. Defend against spreadsheet formula injection in every user- or model-controlled cell beginning with `=`, `+`, `-`, `@`, tab, or carriage return. Use UTF-8 and verify the output opens cleanly in common spreadsheet software.

Errors that prevent a trustworthy report, such as an invalid request or total provider failure, should use an appropriate non-2xx response with a stable structured error body. Do not return a file that looks successful but contains only an opaque error.

Because the target environment may restrict outbound traffic:

- Fail clearly and quickly when a remote provider is unreachable.
- Keep provider configuration in environment variables.
- Include deterministic fixtures or a mock/demo mode for local development and automated tests.
- Do not silently fall back to fabricated AI results.

Keep batch processing within a bounded request for the MVP and limit its size and concurrency. If a batch cannot complete reliably within hosting request limits, reduce the supported batch size or revisit the stateless download constraint with the product owner rather than quietly adding persistent jobs.

## Performance

The stakeholder usability target is approximately five seconds for a typical single label. Treat this as an end-to-end target, not only model latency.

- Record timing for upload/preprocessing, provider calls, parsing, and total request time.
- Resize or compress very large images before inference while preserving legibility.
- Set bounded timeouts and provide an actionable timeout message.
- Avoid repeated extraction calls for different fields when one structured call can return all evidence.
- Limit batch concurrency to avoid provider throttling and resource exhaustion.
- Document representative local or deployed measurements and their test conditions.

Do not claim the target is met without measuring it.

## Security and Privacy

Even though the prototype uses non-sensitive data, follow safe defaults:

- Validate file type by content as well as extension, and enforce file-size and image-dimension limits.
- Generate server-side identifiers; never trust an uploaded filename as a path.
- Do not execute, render as HTML, or interpolate extracted label text unsafely.
- Do not commit credentials. Provide `.env.example` with names and descriptions only.
- Avoid logging image contents, full extracted text, secrets, or user-provided personal data.
- Delete temporary files promptly and document any third-party data handling.
- Sanitize suggested CSV filenames and prevent spreadsheet formula injection in CSV cell values.
- Keep error responses useful without exposing stack traces, secrets, or internal paths.
- Pin dependencies and keep the dependency set modest.

## Code and Repository Conventions

Use the following TypeScript conventions:

- Keep modules focused and name them by domain responsibility rather than implementation novelty.
- Put business rules in testable functions, not route handlers or UI components.
- Use explicit types or schemas at input, provider, API, and persistence boundaries.
- Do not use `any` to bypass provider or request validation; narrow `unknown` data through schemas.
- Keep Express handlers thin and move extraction, verification, and CSV generation into services or pure domain modules.
- Prefer structured error types and user-safe error messages.
- Keep configuration centralized and environment-specific values out of source code.
- Add comments for regulatory rationale or surprising trade-offs, not for obvious syntax.
- Avoid unrelated refactors during MVP work.
- Do not edit or rename `README.md` unless the product owner explicitly changes this instruction. Put new setup, architecture, assumptions, environment-variable, and operational documentation under `docs/` for now.

Before adopting a new dependency, confirm that it removes meaningful implementation risk or effort. Avoid overlapping libraries that solve the same problem.

## Testing and Validation

Every change should be verified at the lowest useful level, and core workflow changes should receive an end-to-end check.

### Minimum automated coverage

- Normalization and comparison functions
- Exact government-warning rule, including missing words and incorrect heading case
- ABV/proof parsing and inconsistency detection
- Net-content parsing
- Provider response schema validation
- Overall status aggregation
- CSV schema, escaping, safe filenames, and spreadsheet formula-injection protection
- Invalid, oversized, and unreadable upload paths
- Provider timeout/error behavior

Use fixtures covering:

- A clean, fully matching label
- A clear field mismatch
- Benign brand-name capitalization or spacing differences
- A warning with subtly incorrect wording or heading case
- Low-confidence or missing text
- Poor lighting, skew, glare, or low resolution
- Malformed provider output
- Mixed success and failure in a batch, if batch support exists

Mock provider calls in unit and integration tests. Keep a small, explicitly marked live-provider smoke test optional so normal test runs remain deterministic, fast, and credential-free.

For UI changes, manually verify the happy path, keyboard navigation, loading state, retry flow, narrow viewport, and error messages. Do not rely on snapshots alone for correctness.

## Definition of Done

A feature is done when:

- Its behavior matches the README and the assumptions documented here.
- The happy path and important failure paths work in the running application.
- Relevant automated tests pass.
- User-visible states are accessible and understandable.
- No secrets or sensitive upload data are logged or committed.
- Setup or behavior changes are documented.
- Any known limitation or unsupported regulatory check is stated plainly.
- Successful responses download a valid CSV and request-scoped files are cleaned up.

Before handing off a deployment-ready build, run the repository's formatter, linter, type checker, tests, and production build, as applicable. Also perform one clean setup using only the documentation under `docs/`. The project owner is responsible for the actual deployment unless they explicitly delegate it.

## Suggested One-Week Delivery Order

1. Establish the TypeScript/Express skeleton, schemas, fixtures, and provider boundary.
2. Complete one end-to-end single-label flow that downloads a valid CSV.
3. Add deterministic field rules, evidence, uncertainty, cleanup, and error states.
4. Add automated coverage, accessibility fixes, and performance measurement.
5. Add a small batch flow only if the single-label experience is stable.
6. Produce a deployment-ready build, handoff notes, and demo data. If the owner deploys during the project, exercise the production URL afterward.

When schedule pressure arises, cut beverage/rule breadth, advanced image correction, and batch sophistication before cutting correctness, evidence, error handling, or the working deployed path.

## Decision Log Expectations

Record material choices in a short `docs/decisions/` note. Do not modify `README.md` under the current project-owner instruction. Include:

- Node.js/runtime version, package manager, major libraries, and Render configuration assumptions
- Extraction provider and why it fits the five-second target
- Remote versus local processing trade-offs
- Supported file types, beverage types, and fields
- CSV contract, batch limits, and request timeout assumptions
- Confidence thresholds and numeric tolerances
- Regulatory sources and the date they were checked
- Known limitations, especially visual warning-format checks
- Data retention and third-party processing behavior

If a new decision conflicts with the README, stop and surface the conflict instead of silently changing the product.
