import { REQUIRED_GOVERNMENT_WARNING } from "../domain/regulatory-rules.js";
import type { ExtractedLabel } from "../domain/types.js";
import type { ExtractionProvider, LabelImage } from "./extraction-provider.js";

export class MockExtractionProvider implements ExtractionProvider {
  readonly name = "mock-fixture";
  readonly isFixture = true;

  async extract(_image: LabelImage): Promise<ExtractedLabel> {
    void _image;
    await Promise.resolve();
    return {
      brandName: {
        value: "OLD TOM DISTILLERY",
        confidence: 0.99,
        evidence: "OLD TOM DISTILLERY",
      },
      classType: {
        value: "Kentucky Straight Bourbon Whiskey",
        confidence: 0.99,
        evidence: "Kentucky Straight Bourbon Whiskey",
      },
      alcoholContent: {
        value: "45% Alc./Vol. (90 Proof)",
        confidence: 0.99,
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
        confidence: 0.99,
        evidence: REQUIRED_GOVERNMENT_WARNING,
        headingAllCaps: true,
        headingBold: true,
        bodyBold: false,
        continuousParagraph: true,
      },
    };
  }
}
