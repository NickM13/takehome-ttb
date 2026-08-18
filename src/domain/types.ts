import { z } from "zod";

export const verificationStatuses = [
  "match",
  "mismatch",
  "needs_review",
] as const;

export type VerificationStatus = (typeof verificationStatuses)[number];

export const observedFieldSchema = z.object({
  value: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  evidence: z.string().nullable(),
});

export const extractedLabelSchema = z.object({
  brandName: observedFieldSchema,
  classType: observedFieldSchema,
  alcoholContent: observedFieldSchema,
  netContents: observedFieldSchema,
  bottlerNameAddress: observedFieldSchema,
  countryOfOrigin: observedFieldSchema,
  governmentWarning: observedFieldSchema.extend({
    headingAllCaps: z.boolean().nullable(),
    headingBold: z.boolean().nullable(),
    bodyBold: z.boolean().nullable(),
    continuousParagraph: z.boolean().nullable(),
  }),
});

export type ExtractedLabel = z.infer<typeof extractedLabelSchema>;

export interface ExpectedLabel {
  applicationId?: string;
  brandName: string;
  classType: string;
  alcoholContent: string;
  netContents: string;
  bottlerNameAddress: string;
  countryOfOrigin?: string;
}

export type VerificationField =
  | "brand_name"
  | "class_type"
  | "alcohol_content"
  | "net_contents"
  | "bottler_name_address"
  | "country_of_origin"
  | "government_warning";

export interface FieldVerification {
  field: VerificationField;
  expectedValue: string;
  observedValue: string;
  status: VerificationStatus;
  confidence: number;
  explanation: string;
}

export interface VerificationResult {
  applicationId?: string;
  sourceFile: string;
  overallStatus: VerificationStatus;
  fields: FieldVerification[];
  processingTimeMs: number;
}
