import { stringify } from "csv-stringify/sync";
import type { VerificationResult } from "../domain/types.js";

const columns = [
  "application_id",
  "source_file",
  "overall_status",
  "field",
  "expected_value",
  "observed_value",
  "field_status",
  "confidence",
  "explanation",
  "processing_time_ms",
] as const;

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function escapeSpreadsheetFormula(value: string): string {
  return FORMULA_PREFIX.test(value) ? `'${value}` : value;
}

export function createVerificationCsv(result: VerificationResult): string {
  const records = result.fields.map((field) => ({
    application_id: escapeSpreadsheetFormula(result.applicationId ?? ""),
    source_file: escapeSpreadsheetFormula(result.sourceFile),
    overall_status: result.overallStatus,
    field: field.field,
    expected_value: escapeSpreadsheetFormula(field.expectedValue),
    observed_value: escapeSpreadsheetFormula(field.observedValue),
    field_status: field.status,
    confidence: field.confidence.toFixed(2),
    explanation: escapeSpreadsheetFormula(field.explanation),
    processing_time_ms: result.processingTimeMs.toString(),
  }));

  return stringify(records, {
    header: true,
    columns: [...columns],
    record_delimiter: "windows",
    quoted_match: /[\r\n]/,
  });
}

export function createReportFilename(applicationId?: string): string {
  const safeIdentifier = (applicationId ?? "label")
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `verification-${safeIdentifier || "label"}.csv`;
}
