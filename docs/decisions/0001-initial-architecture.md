# Decision 0001: Initial MVP architecture

Date: 2026-08-17

## Decision

Build one stateless Node.js 24 service using strict TypeScript and Express 5. Express serves the small frontend and the verification endpoint. Uploaded images remain in memory for the request lifetime; successful results return immediately as a CSV download. There is no database, persistent file storage, job queue, or separate frontend deployment.

Extraction is isolated behind a provider interface:

- `mock` provides an explicitly labeled deterministic fixture for local work and automated tests.
- `openai` sends one image to the Responses API and validates structured output before deterministic comparisons run locally.

The default live model is `gpt-5.6-luna` because the current OpenAI model guidance positions it for cost-sensitive, high-volume work while supporting image input and structured output. This is an initial choice to benchmark against the stakeholder's five-second target, not an assumption that the target is already met.

## Regulatory scope

The initial rules cover the distilled-spirits fields named in the project brief. The required warning text and formatting checks are based on [TTB's current distilled spirits health-warning guidance](https://www.ttb.gov/regulated-commodities/beverage-alcohol/distilled-spirits/ds-labeling-home/ds-health-warning), checked on 2026-08-17. Exact wording and heading checks are deterministic. Visual properties that extraction cannot establish are reported as `needs_review`.

## Provider source

The live provider follows current [OpenAI model guidance](https://developers.openai.com/api/docs/guides/latest-model) and the [OpenAI model catalog](https://developers.openai.com/api/docs/models), checked on 2026-08-17.

## Consequences

- The application is easy to run and suitable for a single free web service.
- A successful response has no server-side history and must be saved by the user.
- Batch size is limited by request duration and memory.
- Fixture mode supports development without credentials but cannot demonstrate OCR quality.
- Provider and rule tests remain deterministic and credential-free.
