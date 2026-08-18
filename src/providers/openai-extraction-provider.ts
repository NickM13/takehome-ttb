import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { extractedLabelSchema, type ExtractedLabel } from "../domain/types.js";
import { AppError } from "../errors.js";
import type { ExtractionProvider, LabelImage } from "./extraction-provider.js";

const EXTRACTION_INSTRUCTIONS = `You extract visible compliance evidence from one US alcohol beverage label image.
Return only what is visible. Do not fill in missing text from general knowledge.
Preserve exact capitalization, punctuation, and wording, especially for the full government warning.
For confidence, use 0 when absent/unreadable and reserve high confidence for clearly legible text.
Extract the complete bottler, producer, importer, or brewer name-and-address statement, including its qualifying phrase when visible.
Extract country of origin only from an explicit import-origin statement such as "Product of France". Return only the country name as the field value and preserve the full visible statement as evidence. Do not infer a country from a city, state, appellation, or regional designation.
The government warning style fields describe only visible evidence. Return null when bold weight or continuous-paragraph layout cannot be established reliably.
The bodyBold field is true only when the warning text after the GOVERNMENT WARNING heading is bold.`;

export interface OpenAIExtractionProviderOptions {
  apiKey: string;
  model: string;
  timeoutMs: number;
}

export function mapOpenAIApiError(
  status: number,
  code?: string | null,
): AppError {
  if (status === 401 || status === 403) {
    return new AppError(
      "EXTRACTION_AUTH_FAILED",
      "The extraction service could not authenticate. Check the configured OpenAI API key and project access.",
      502,
    );
  }

  if (
    status === 429 &&
    (code === "credit_balance_exhausted" || code === "insufficient_quota")
  ) {
    return new AppError(
      "EXTRACTION_CREDITS_EXHAUSTED",
      "The OpenAI account has no available API credits. Add credits or billing, then try again.",
      503,
    );
  }

  if (status === 429) {
    return new AppError(
      "EXTRACTION_RATE_LIMITED",
      "The extraction service is temporarily rate-limited. Wait briefly, then try again.",
      503,
    );
  }

  if (status === 400 && code === "invalid_value") {
    return new AppError(
      "EXTRACTION_INVALID_IMAGE",
      "The extraction service could not read this image. Export it as a new JPEG or PNG and try again.",
      422,
    );
  }

  if (status >= 500) {
    return new AppError(
      "EXTRACTION_UNAVAILABLE",
      "The extraction service is temporarily unavailable. Please try again.",
      502,
    );
  }

  return new AppError(
    "EXTRACTION_FAILED",
    "The label could not be processed by the extraction provider. Please try again.",
    502,
  );
}

export class OpenAIExtractionProvider implements ExtractionProvider {
  readonly name: string;
  readonly isFixture = false;
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAIExtractionProviderOptions) {
    this.client = new OpenAI({
      apiKey: options.apiKey,
      timeout: options.timeoutMs,
      maxRetries: 0,
    });
    this.model = options.model;
    this.name = `openai:${options.model}`;
  }

  async extract(image: LabelImage): Promise<ExtractedLabel> {
    const imageUrl = `data:${image.mimeType};base64,${image.buffer.toString("base64")}`;

    try {
      const response = await this.client.responses.parse({
        model: this.model,
        instructions: EXTRACTION_INSTRUCTIONS,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Extract the seven configured fields and visible warning-format evidence from this label.",
              },
              {
                type: "input_image",
                image_url: imageUrl,
                detail: "high",
              },
            ],
          },
        ],
        text: {
          format: zodTextFormat(extractedLabelSchema, "label_extraction"),
        },
      });

      if (!response.output_parsed) {
        throw new AppError(
          "EXTRACTION_EMPTY",
          "The extraction provider did not return a usable result. Please try a clearer image.",
          502,
        );
      }

      return extractedLabelSchema.parse(response.output_parsed);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      if (error instanceof OpenAI.APIConnectionTimeoutError) {
        throw new AppError(
          "EXTRACTION_TIMEOUT",
          "Label extraction took too long. Please retry with a smaller or clearer image.",
          504,
        );
      }

      if (error instanceof OpenAI.APIConnectionError) {
        throw new AppError(
          "EXTRACTION_CONNECTION_FAILED",
          "The extraction service could not be reached. Check the network connection and try again.",
          502,
        );
      }

      if (error instanceof OpenAI.APIError) {
        const status = typeof error.status === "number" ? error.status : 500;
        const code = typeof error.code === "string" ? error.code : null;
        throw mapOpenAIApiError(status, code);
      }

      throw new AppError(
        "EXTRACTION_FAILED",
        "The label could not be processed by the extraction provider. Please try again.",
        502,
      );
    }
  }
}
