# Cloudflare Workers deployment

Date: 2026-08-18

## Decision

Support Cloudflare Workers as a second deployment target without replacing the
existing Node.js server. The Worker entry point uses Cloudflare's Node HTTP
compatibility handler to run the Express application. Static assets are uploaded
from `public/` and served by Cloudflare before the Worker; `/api/*` routes invoke
Express first.

Wrangler is a development dependency and `wrangler.jsonc` is the versioned
deployment contract. Workers Builds should run `npm run typecheck` as its build
command and `npm run deploy` as its deploy command.

## Rationale

Running `npm start` in Workers Builds attempts to execute `dist/server.js` and
does not deploy anything. Even after a TypeScript build, a long-running Node
process is not the Workers request entry point. Cloudflare's supported
`httpServerHandler` bridge preserves the current Express routes and provider
boundary with a small platform-specific adapter.

Cloudflare's static-asset layer avoids relying on filesystem access from the
Worker runtime. The local Node server continues to use `express.static`, so the
existing development and Render workflows remain intact.

## Consequences and limits

- Runtime secrets must be configured in the Cloudflare dashboard; build-only
  variables are insufficient.
- `nodejs_compat` and the pinned compatibility date are required.
- The Cloudflare path must be tested with representative multipart uploads and
  live OpenAI calls before claiming the performance target is met.
- Worker CPU, request-body, and subrequest limits still apply to batch reviews.
