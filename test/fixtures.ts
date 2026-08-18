import { REQUIRED_GOVERNMENT_WARNING } from "../src/domain/regulatory-rules.js";
import type { ExtractedLabel } from "../src/domain/types.js";

export const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

export function createMatchingExtraction(): ExtractedLabel {
  return {
    brandName: {
      value: "OLD TOM DISTILLERY",
      confidence: 0.99,
      evidence: "OLD TOM DISTILLERY",
    },
    classType: {
      value: "Kentucky Straight Bourbon Whiskey",
      confidence: 0.98,
      evidence: "Kentucky Straight Bourbon Whiskey",
    },
    alcoholContent: {
      value: "45% Alc./Vol. (90 Proof)",
      confidence: 0.97,
      evidence: "45% Alc./Vol. (90 Proof)",
    },
    netContents: {
      value: "750 mL",
      confidence: 0.99,
      evidence: "750 mL",
    },
    bottlerNameAddress: {
      value: "BOTTLED BY OLD TOM DISTILLERY, FRANKFORT, KY",
      confidence: 0.99,
      evidence: "BOTTLED BY OLD TOM DISTILLERY, FRANKFORT, KY",
    },
    countryOfOrigin: {
      value: null,
      confidence: 0,
      evidence: null,
    },
    governmentWarning: {
      value: REQUIRED_GOVERNMENT_WARNING,
      confidence: 0.96,
      evidence: REQUIRED_GOVERNMENT_WARNING,
      headingAllCaps: true,
      headingBold: true,
      bodyBold: false,
      continuousParagraph: true,
    },
  };
}
