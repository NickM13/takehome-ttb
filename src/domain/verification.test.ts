import { describe, expect, it } from "vitest";
import { REQUIRED_GOVERNMENT_WARNING } from "./regulatory-rules.js";
import type { ExpectedLabel } from "./types.js";
import { createUnprocessedLabelResult, verifyLabel } from "./verification.js";
import { createMatchingExtraction } from "../../test/fixtures.js";

const expected: ExpectedLabel = {
  applicationId: "TEST-001",
  brandName: "Old Tom Distillery",
  classType: "Kentucky Straight Bourbon Whiskey",
  alcoholContent: "45% Alc./Vol. (90 Proof)",
  netContents: "750 mL",
  bottlerNameAddress: "BOTTLED BY OLD TOM DISTILLERY, FRANKFORT, KY",
};

describe("verifyLabel", () => {
  it("matches a clean label and tolerates harmless brand-name case", () => {
    const result = verifyLabel(
      expected,
      createMatchingExtraction(),
      "label.png",
      125,
    );

    expect(result.overallStatus).toBe("match");
    expect(result.fields).toHaveLength(7);
    expect(result.fields.every((field) => field.status === "match")).toBe(true);
  });

  it("matches exactly equivalent metric volumes", () => {
    const result = verifyLabel(
      { ...expected, netContents: "0.75 L" },
      createMatchingExtraction(),
      "label.png",
      125,
    );

    expect(
      result.fields.find(({ field }) => field === "net_contents")?.status,
    ).toBe("match");
  });

  it("rejects an internally inconsistent proof value", () => {
    const extracted = createMatchingExtraction();
    extracted.alcoholContent.value = "45% Alc./Vol. (80 Proof)";

    const result = verifyLabel(expected, extracted, "label.png", 125);

    expect(
      result.fields.find(({ field }) => field === "alcohol_content")?.status,
    ).toBe("mismatch");
    expect(result.overallStatus).toBe("mismatch");
  });

  it("reports incorrect warning heading case as a mismatch", () => {
    const extracted = createMatchingExtraction();
    extracted.governmentWarning.value = REQUIRED_GOVERNMENT_WARNING.replace(
      "GOVERNMENT WARNING",
      "Government Warning",
    );
    extracted.governmentWarning.headingAllCaps = false;

    const result = verifyLabel(expected, extracted, "label.png", 125);

    expect(
      result.fields.find(({ field }) => field === "government_warning")?.status,
    ).toBe("mismatch");
  });

  it("reports unverifiable warning styling as needs review", () => {
    const extracted = createMatchingExtraction();
    extracted.governmentWarning.headingBold = null;

    const result = verifyLabel(expected, extracted, "label.png", 125);

    expect(
      result.fields.find(({ field }) => field === "government_warning")?.status,
    ).toBe("needs_review");
    expect(result.overallStatus).toBe("needs_review");
  });

  it("does not turn low-confidence extraction into a mismatch", () => {
    const extracted = createMatchingExtraction();
    extracted.brandName.value = "Something else";
    extracted.brandName.confidence = 0.3;

    const result = verifyLabel(expected, extracted, "label.png", 125);

    expect(result.fields[0]?.status).toBe("needs_review");
    expect(result.overallStatus).toBe("needs_review");
  });

  it("matches a readable bottler name and address", () => {
    const result = verifyLabel(
      expected,
      createMatchingExtraction(),
      "label.png",
      125,
    );

    expect(
      result.fields.find(({ field }) => field === "bottler_name_address")
        ?.status,
    ).toBe("match");
  });

  it("reports a different readable bottler name and address as a mismatch", () => {
    const extracted = createMatchingExtraction();
    extracted.bottlerNameAddress.value =
      "BOTTLED BY ANOTHER DISTILLERY, FRANKFORT, KY";

    const result = verifyLabel(expected, extracted, "label.png", 125);

    expect(
      result.fields.find(({ field }) => field === "bottler_name_address")
        ?.status,
    ).toBe("mismatch");
    expect(result.overallStatus).toBe("mismatch");
  });

  it("matches an explicit country of origin for an import", () => {
    const extracted = createMatchingExtraction();
    extracted.countryOfOrigin = {
      value: "France",
      confidence: 0.98,
      evidence: "Product of France",
    };

    const result = verifyLabel(
      { ...expected, countryOfOrigin: "France" },
      extracted,
      "label.png",
      125,
    );

    expect(
      result.fields.find(({ field }) => field === "country_of_origin")?.status,
    ).toBe("match");
  });

  it("flags an unexpected import-origin statement for review", () => {
    const extracted = createMatchingExtraction();
    extracted.countryOfOrigin = {
      value: "France",
      confidence: 0.98,
      evidence: "Product of France",
    };

    const result = verifyLabel(expected, extracted, "label.png", 125);

    expect(
      result.fields.find(({ field }) => field === "country_of_origin")?.status,
    ).toBe("needs_review");
    expect(result.overallStatus).toBe("needs_review");
  });

  it("preserves a failed batch item as needs review", () => {
    const result = createUnprocessedLabelResult(
      expected,
      "failed.png",
      75,
      "Extraction failed for this label.",
    );

    expect(result.overallStatus).toBe("needs_review");
    expect(result.fields).toHaveLength(7);
    expect(result.fields.every(({ status }) => status === "needs_review")).toBe(
      true,
    );
  });
});
