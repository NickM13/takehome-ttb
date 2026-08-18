import { describe, expect, it } from "vitest";
import {
  createReportFilename,
  createVerificationCsv,
  escapeSpreadsheetFormula,
} from "./report.js";
import type { VerificationResult } from "../domain/types.js";

describe("CSV reports", () => {
  it.each(["=1+1", "+SUM(A1)", "-2+3", "@cmd", "\tformula", "\rformula"])(
    "neutralizes formula-like cell %s",
    (value) => {
      expect(escapeSpreadsheetFormula(value)).toBe(`'${value}`);
    },
  );

  it("serializes the stable schema and escapes controlled values", () => {
    const result: VerificationResult = {
      applicationId: "+APP",
      sourceFile: "=label.png",
      overallStatus: "mismatch",
      processingTimeMs: 42,
      fields: [
        {
          field: "brand_name",
          expectedValue: "A, Brand",
          observedValue: "Other\nBrand",
          status: "mismatch",
          confidence: 0.8,
          explanation: "@Review this",
        },
      ],
    };

    const csv = createVerificationCsv(result);

    expect(csv).toContain("application_id,source_file,overall_status");
    expect(csv).toContain("'+APP");
    expect(csv).toContain("'=label.png");
    expect(csv).toContain("'@Review this");
    expect(csv).toContain('"A, Brand"');
    expect(csv).toContain('"Other\nBrand"');
  });

  it("creates an ASCII-safe attachment filename", () => {
    expect(createReportFilename("../../COLA 123\r\n.csv")).toBe(
      "verification-COLA-123-csv.csv",
    );
  });

  it("combines multiple label results into one batch report", () => {
    const first: VerificationResult = {
      sourceFile: "one.png",
      overallStatus: "match",
      processingTimeMs: 12,
      fields: [
        {
          field: "brand_name",
          expectedValue: "One",
          observedValue: "One",
          status: "match",
          confidence: 1,
          explanation: "Matches.",
        },
      ],
    };
    const second: VerificationResult = {
      ...first,
      sourceFile: "two.png",
      overallStatus: "mismatch",
      fields: [
        {
          field: "brand_name",
          expectedValue: "One",
          observedValue: "Two",
          status: "mismatch",
          confidence: 1,
          explanation: "Does not match.",
        },
      ],
    };

    const csv = createVerificationCsv([first, second]);

    expect(csv).toContain("one.png,match");
    expect(csv).toContain("two.png,mismatch");
    expect(csv.match(/application_id,source_file/g)).toHaveLength(1);
  });
});
