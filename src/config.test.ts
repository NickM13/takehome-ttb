import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

describe("loadConfig", () => {
  it("defaults to explicit fixture mode", () => {
    const config = loadConfig({ NODE_ENV: "test" });
    expect(config.EXTRACTION_PROVIDER).toBe("mock");
  });

  it("requires an API key for the OpenAI provider", () => {
    expect(() =>
      loadConfig({ NODE_ENV: "test", EXTRACTION_PROVIDER: "openai" }),
    ).toThrow(/OPENAI_API_KEY/);
  });
});
