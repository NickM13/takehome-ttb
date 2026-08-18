import type { ExtractedLabel } from "../domain/types.js";

export interface LabelImage {
  buffer: Buffer;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  originalName: string;
}

export interface ExtractionProvider {
  readonly name: string;
  readonly isFixture: boolean;
  extract(image: LabelImage): Promise<ExtractedLabel>;
}
