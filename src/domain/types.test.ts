import { describe, expect, it } from "vitest";
import { createMatchingExtraction } from "../../test/fixtures.js";
import { extractedLabelSchema } from "./types.js";

describe("extractedLabelSchema", () => {
  it("accepts the complete seven-field provider contract", () => {
    expect(
      extractedLabelSchema.safeParse(createMatchingExtraction()).success,
    ).toBe(true);
  });

  it("rejects provider output missing either newly required extraction field", () => {
    const extraction = createMatchingExtraction();
    const withoutAddress: Record<string, unknown> = { ...extraction };
    const withoutCountry: Record<string, unknown> = { ...extraction };
    Reflect.deleteProperty(withoutAddress, "bottlerNameAddress");
    Reflect.deleteProperty(withoutCountry, "countryOfOrigin");

    expect(extractedLabelSchema.safeParse(withoutAddress).success).toBe(false);
    expect(extractedLabelSchema.safeParse(withoutCountry).success).toBe(false);
  });
});
