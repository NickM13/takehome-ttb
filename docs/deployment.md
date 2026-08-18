# Deployment handoff

## Cloudflare Workers

This repository includes a Cloudflare Worker entry point while retaining the
standard Node.js server used by local development and hosts such as Render.
Cloudflare serves `public/` through its static-asset layer and sends `/api/*`
requests to the Express application through its Node HTTP compatibility layer.

In **Workers & Pages > your Worker > Settings > Build**, use:

- Production branch: `main`
- Root directory: leave blank
- Build command: `npm run typecheck`
- Deploy command: `npm run deploy`
- Non-production deploy command: `npx wrangler versions upload`

Do not use `npm run start` as the deploy command. That command starts the
long-running Node server and expects a prior `npm run build`; it does not upload
a Worker.

In **Settings > Variables and Secrets**, configure runtime values—not only
build variables:

- `EXTRACTION_PROVIDER`: plaintext value `openai`
- `OPENAI_API_KEY`: encrypted secret
- `OPENAI_MODEL`: optional plaintext model name
- `OPENAI_TIMEOUT_MS`: optional plaintext timeout in milliseconds
- `MAX_FILE_SIZE_BYTES`: optional plaintext byte limit
- `MAX_IMAGE_PIXELS`: optional plaintext pixel limit

`PORT` is not needed on Cloudflare. If `EXTRACTION_PROVIDER` is omitted, the
application deliberately starts in deterministic mock mode. Never put the API
key in `wrangler.jsonc` or commit it to the repository.

After deployment, verify `/api/status`, load the home page, and complete one
real image review. The health response confirms the configured provider but
does not make an OpenAI request, so an image review is still required to verify
the key and available credits.

## Render or another Node host

Suggested settings for a standard Node web service:

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Health check path: `/api/status`
- Runtime: Node 24, matching `package.json`

Set the same extraction environment values in the host's runtime environment.

Before accepting any deployed build, upload representative labels and record
end-to-end response times. If requests approach the host timeout, reduce image
or batch limits before adding persistent jobs.
