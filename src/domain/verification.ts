import {
  ABV_TOLERANCE,
  MINIMUM_EXTRACTION_CONFIDENCE,
  PROOF_TOLERANCE,
  REQUIRED_GOVERNMENT_WARNING,
} from "./regulatory-rules.js";
import type {
  ExpectedLabel,
  ExtractedLabel,
  FieldVerification,
  VerificationResult,
  VerificationStatus,
} from "./types.js";

interface ParsedAlcohol {
  abv: number;
  proof?: number;
}

interface ParsedVolume {
  milliliters: number;
}

const DOMESTIC_COUNTRY_EXPECTATION = "Not applicable (domestic product)";

function collapseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeName(value: string): string {
  return collapseWhitespace(value)
    .normalize("NFKC")
    .replace(/[‘’]/g, "'")
    .toLocaleUpperCase("en-US");
}

function parseAlcohol(value: string): ParsedAlcohol | undefined {
  const abvMatch =
    /(\d+(?:\.\d+)?)\s*(?:%|percent)\s*(?:(?:alc(?:ohol)?\.?\s*\/?\s*vol\.?)|abv)?/i.exec(
      value,
    );
  if (!abvMatch?.[1]) return undefined;

  const proofMatch = /(\d+(?:\.\d+)?)\s*(?:°\s*)?proof/i.exec(value);
  const proof = proofMatch?.[1] ? Number(proofMatch[1]) : undefined;

  return {
    abv: Number(abvMatch[1]),
    ...(proof === undefined ? {} : { proof }),
  };
}

function parseVolume(value: string): ParsedVolume | undefined {
  const match =
    /(\d+(?:\.\d+)?)\s*(ml|milliliters?|l|liters?|cl|centiliters?)\b/i.exec(
      value,
    );
  if (!match?.[1] || !match[2]) return undefined;

  const quantity = Number(match[1]);
  const unit = match[2].toLocaleLowerCase("en-US");
  const factor =
    unit.startsWith("cl") || unit.startsWith("centil")
      ? 10
      : unit === "l" || unit.startsWith("liter")
        ? 1000
        : 1;

  return { milliliters: quantity * factor };
}

function unavailableField(
  field: FieldVerification["field"],
  expectedValue: string,
  observedValue: string | null,
  confidence: number,
): FieldVerification | undefined {
  if (observedValue === null || collapseWhitespace(observedValue) === "") {
    return {
      field,
      expectedValue,
      observedValue: "",
      status: "needs_review",
      confidence,
      explanation: "No readable value was extracted from the label.",
    };
  }

  if (confidence < MINIMUM_EXTRACTION_CONFIDENCE) {
    return {
      field,
      expectedValue,
      observedValue,
      status: "needs_review",
      confidence,
      explanation:
        "The extracted value is below the review confidence threshold.",
    };
  }

  return undefined;
}

function compareTextField(
  field: FieldVerification["field"],
  expectedValue: string,
  observedValue: string | null,
  confidence: number,
): FieldVerification {
  const unavailable = unavailableField(
    field,
    expectedValue,
    observedValue,
    confidence,
  );
  if (unavailable) return unavailable;

  const observed = observedValue ?? "";
  const matches = normalizeName(expectedValue) === normalizeName(observed);
  return {
    field,
    expectedValue,
    observedValue: observed,
    status: matches ? "match" : "mismatch",
    confidence,
    explanation: matches
      ? "The values match after harmless case and spacing normalization."
      : "The readable label value does not match the application value.",
  };
}

function compareAlcohol(
  expectedValue: string,
  observedValue: string | null,
  confidence: number,
): FieldVerification {
  const field = "alcohol_content" as const;
  const unavailable = unavailableField(
    field,
    expectedValue,
    observedValue,
    confidence,
  );
  if (unavailable) return unavailable;

  const observed = observedValue ?? "";
  const expectedAlcohol = parseAlcohol(expectedValue);
  const observedAlcohol = parseAlcohol(observed);
  if (!expectedAlcohol || !observedAlcohol) {
    return {
      field,
      expectedValue,
      observedValue: observed,
      status: "needs_review",
      confidence,
      explanation:
        "The alcohol content could not be compared as numeric ABV/proof values.",
    };
  }

  const abvMatches =
    Math.abs(expectedAlcohol.abv - observedAlcohol.abv) <= ABV_TOLERANCE;
  const expectedProofMatches =
    expectedAlcohol.proof === undefined ||
    (observedAlcohol.proof !== undefined &&
      Math.abs(expectedAlcohol.proof - observedAlcohol.proof) <=
        PROOF_TOLERANCE);
  const observedProofConsistent =
    observedAlcohol.proof === undefined ||
    Math.abs(observedAlcohol.proof - observedAlcohol.abv * 2) <=
      PROOF_TOLERANCE;
  const matches = abvMatches && expectedProofMatches && observedProofConsistent;

  return {
    field,
    expectedValue,
    observedValue: observed,
    status: matches ? "match" : "mismatch",
    confidence,
    explanation: matches
      ? "The numeric ABV and proof values are consistent with the application."
      : "The ABV or proof value differs from the application or is internally inconsistent.",
  };
}

function compareNetContents(
  expectedValue: string,
  observedValue: string | null,
  confidence: number,
): FieldVerification {
  const field = "net_contents" as const;
  const unavailable = unavailableField(
    field,
    expectedValue,
    observedValue,
    confidence,
  );
  if (unavailable) return unavailable;

  const observed = observedValue ?? "";
  const expectedVolume = parseVolume(expectedValue);
  const observedVolume = parseVolume(observed);
  if (!expectedVolume || !observedVolume) {
    return {
      field,
      expectedValue,
      observedValue: observed,
      status: "needs_review",
      confidence,
      explanation:
        "The net contents could not be converted to a supported metric unit.",
    };
  }

  const matches =
    Math.abs(expectedVolume.milliliters - observedVolume.milliliters) < 0.01;
  return {
    field,
    expectedValue,
    observedValue: observed,
    status: matches ? "match" : "mismatch",
    confidence,
    explanation: matches
      ? "The net contents are equivalent after exact metric-unit conversion."
      : "The label net contents do not match the application value.",
  };
}

function compareCountryOfOrigin(
  expectedValue: string | undefined,
  country: ExtractedLabel["countryOfOrigin"],
): FieldVerification {
  const field = "country_of_origin" as const;
  if (expectedValue) {
    return compareTextField(
      field,
      expectedValue,
      country.value,
      country.confidence,
    );
  }

  const observed = country.value?.trim() ?? "";
  if (!observed) {
    return {
      field,
      expectedValue: DOMESTIC_COUNTRY_EXPECTATION,
      observedValue: "",
      status: "match",
      confidence: country.confidence,
      explanation:
        "The application does not identify an imported product, and no country-of-origin statement was detected.",
    };
  }

  return {
    field,
    expectedValue: DOMESTIC_COUNTRY_EXPECTATION,
    observedValue: observed,
    status: "needs_review",
    confidence: country.confidence,
    explanation:
      "A country-of-origin statement was detected, but the application does not identify an import. Confirm the application data.",
  };
}

function compareWarning(
  warning: ExtractedLabel["governmentWarning"],
): FieldVerification {
  const field = "government_warning" as const;
  const unavailable = unavailableField(
    field,
    REQUIRED_GOVERNMENT_WARNING,
    warning.value,
    warning.confidence,
  );
  if (unavailable) return unavailable;

  const observed = warning.value ?? "";
  const wordingMatches =
    collapseWhitespace(observed) ===
    collapseWhitespace(REQUIRED_GOVERNMENT_WARNING);

  if (
    !wordingMatches ||
    warning.headingAllCaps === false ||
    warning.headingBold === false ||
    warning.bodyBold === true ||
    warning.continuousParagraph === false
  ) {
    return {
      field,
      expectedValue: REQUIRED_GOVERNMENT_WARNING,
      observedValue: observed,
      status: "mismatch",
      confidence: warning.confidence,
      explanation:
        "The warning wording, heading capitalization/bold treatment, body weight, or paragraph format does not meet the configured rule.",
    };
  }

  if (
    warning.headingAllCaps === null ||
    warning.headingBold === null ||
    warning.bodyBold === null ||
    warning.continuousParagraph === null
  ) {
    return {
      field,
      expectedValue: REQUIRED_GOVERNMENT_WARNING,
      observedValue: observed,
      status: "needs_review",
      confidence: warning.confidence,
      explanation:
        "The wording matches, but one or more visual formatting requirements could not be established.",
    };
  }

  return {
    field,
    expectedValue: REQUIRED_GOVERNMENT_WARNING,
    observedValue: observed,
    status: "match",
    confidence: warning.confidence,
    explanation:
      "The required wording and observable formatting requirements match.",
  };
}

function aggregateStatus(fields: FieldVerification[]): VerificationStatus {
  if (fields.some(({ status }) => status === "mismatch")) return "mismatch";
  if (fields.some(({ status }) => status === "needs_review")) {
    return "needs_review";
  }
  return "match";
}

export function verifyLabel(
  expected: ExpectedLabel,
  extracted: ExtractedLabel,
  sourceFile: string,
  processingTimeMs: number,
): VerificationResult {
  const fields = [
    compareTextField(
      "brand_name",
      expected.brandName,
      extracted.brandName.value,
      extracted.brandName.confidence,
    ),
    compareTextField(
      "class_type",
      expected.classType,
      extracted.classType.value,
      extracted.classType.confidence,
    ),
    compareAlcohol(
      expected.alcoholContent,
      extracted.alcoholContent.value,
      extracted.alcoholContent.confidence,
    ),
    compareNetContents(
      expected.netContents,
      extracted.netContents.value,
      extracted.netContents.confidence,
    ),
    compareTextField(
      "bottler_name_address",
      expected.bottlerNameAddress,
      extracted.bottlerNameAddress.value,
      extracted.bottlerNameAddress.confidence,
    ),
    compareCountryOfOrigin(expected.countryOfOrigin, extracted.countryOfOrigin),
    compareWarning(extracted.governmentWarning),
  ];

  return {
    ...(expected.applicationId
      ? { applicationId: expected.applicationId }
      : {}),
    sourceFile,
    overallStatus: aggregateStatus(fields),
    fields,
    processingTimeMs,
  };
}

export function createUnprocessedLabelResult(
  expected: ExpectedLabel,
  sourceFile: string,
  processingTimeMs: number,
  explanation: string,
): VerificationResult {
  const unavailable = (
    field: FieldVerification["field"],
    expectedValue: string,
  ): FieldVerification => ({
    field,
    expectedValue,
    observedValue: "",
    status: "needs_review",
    confidence: 0,
    explanation,
  });

  return {
    ...(expected.applicationId
      ? { applicationId: expected.applicationId }
      : {}),
    sourceFile,
    overallStatus: "needs_review",
    fields: [
      unavailable("brand_name", expected.brandName),
      unavailable("class_type", expected.classType),
      unavailable("alcohol_content", expected.alcoholContent),
      unavailable("net_contents", expected.netContents),
      unavailable("bottler_name_address", expected.bottlerNameAddress),
      unavailable(
        "country_of_origin",
        expected.countryOfOrigin ?? DOMESTIC_COUNTRY_EXPECTATION,
      ),
      unavailable("government_warning", REQUIRED_GOVERNMENT_WARNING),
    ],
    processingTimeMs,
  };
}
