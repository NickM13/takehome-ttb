import { describe, expect, it } from "vitest";
import { mapOpenAIApiError } from "./openai-extraction-provider.js";

describe("mapOpenAIApiError", () => {
  it("returns an actionable error when API credits are exhausted", () => {
    const error = mapOpenAIApiError(429, "credit_balance_exhausted");

    expect(error.code).toBe("EXTRACTION_CREDITS_EXHAUSTED");
    expect(error.statusCode).toBe(503);
    expect(error.message).toMatch(/credits/i);
  });

  it("distinguishes ordinary rate limiting from exhausted credits", () => {
    expect(mapOpenAIApiError(429, "rate_limit_exceeded").code).toBe(
      "EXTRACTION_RATE_LIMITED",
    );
  });

  it("returns a configuration-safe authentication message", () => {
    const error = mapOpenAIApiError(401, "invalid_api_key");

    expect(error.code).toBe("EXTRACTION_AUTH_FAILED");
    expect(error.message).not.toContain("sk-");
  });
});
