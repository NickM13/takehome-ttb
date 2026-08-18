import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import type { ExtractionProvider } from "./providers/extraction-provider.js";
import { MockExtractionProvider } from "./providers/mock-extraction-provider.js";
import { OpenAIExtractionProvider } from "./providers/openai-extraction-provider.js";

function createProvider(
  config: ReturnType<typeof loadConfig>,
): ExtractionProvider {
  if (config.EXTRACTION_PROVIDER === "openai") {
    return new OpenAIExtractionProvider({
      apiKey: config.OPENAI_API_KEY ?? "",
      model: config.OPENAI_MODEL,
      timeoutMs: config.OPENAI_TIMEOUT_MS,
    });
  }
  return new MockExtractionProvider();
}

export interface CreateConfiguredAppOptions {
  serveStaticAssets?: boolean;
}

export function createConfiguredApp(options: CreateConfiguredAppOptions = {}) {
  const config = loadConfig();
  const provider = createProvider(config);
  const app = createApp({
    provider,
    maxFileSizeBytes: config.MAX_FILE_SIZE_BYTES,
    maxImagePixels: config.MAX_IMAGE_PIXELS,
    serveStaticAssets: options.serveStaticAssets ?? true,
  });

  return { app, config, provider };
}
