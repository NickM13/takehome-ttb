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

`POST /api/verifications` accepts `multipart/form-data` with one `label` image and these text fields:

- `applicationId` (optional)
- `brandName`
- `classType`
- `alcoholContent`
- `netContents`

Successful requests return a CSV attachment. Invalid uploads and extraction failures return a structured JSON error with a non-2xx status.

`GET /api/status` returns service health and the active extraction mode. It does not expose credentials.
