import { fileTypeFromBuffer } from "file-type";
import { AppError } from "../errors.js";
import type { LabelImage } from "../providers/extraction-provider.js";
import { readImageDimensions } from "./image-dimensions.js";

const allowedMimeTypes = new Set<LabelImage["mimeType"]>([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export interface ImageValidationOptions {
  maxPixels: number;
}

export async function validateLabelImage(
  file: Express.Multer.File,
  options: ImageValidationOptions,
): Promise<LabelImage> {
  const detectedType = await fileTypeFromBuffer(file.buffer);
  if (
    !detectedType ||
    !allowedMimeTypes.has(detectedType.mime as LabelImage["mimeType"])
  ) {
    throw new AppError(
      "UNSUPPORTED_FILE_TYPE",
      "Upload a JPEG, PNG, or WebP image.",
      415,
    );
  }

  const mimeType = detectedType.mime as LabelImage["mimeType"];
  const dimensions = readImageDimensions(file.buffer, mimeType);

  if (!dimensions?.width || !dimensions.height) {
    throw new AppError(
      "INVALID_IMAGE",
      "The image dimensions could not be read.",
      400,
    );
  }

  if (dimensions.width * dimensions.height > options.maxPixels) {
    throw new AppError(
      "IMAGE_DIMENSIONS_TOO_LARGE",
      "The image dimensions are too large. Resize the image and try again.",
      413,
    );
  }

  const originalName =
    file.originalname.replace(/\\/g, "/").split("/").at(-1)?.slice(0, 255) ??
    "label-image";

  return {
    buffer: file.buffer,
    mimeType,
    originalName,
  };
}
