# Render handoff

The project owner will perform deployment. The service is designed for a standard Render Node web service.

Suggested settings:

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Health check path: `/api/status`
- Runtime: Node 24, matching `package.json`

Set `EXTRACTION_PROVIDER=openai`, `OPENAI_API_KEY`, and optionally `OPENAI_MODEL` in Render's environment configuration. Do not commit `.env`.

Before accepting a deployed build, upload representative labels and record end-to-end response times. If requests approach the host timeout, reduce image or batch limits before adding persistent jobs.
