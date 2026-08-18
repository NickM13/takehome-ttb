import express, {
  type ErrorRequestHandler,
  type Express,
  type Request,
  type RequestHandler,
} from "express";
import multer from "multer";
import { fileURLToPath } from "node:url";
import { z, ZodError } from "zod";
import { createReportFilename, createVerificationCsv } from "./csv/report.js";
import type { ExpectedLabel, VerificationResult } from "./domain/types.js";
import {
  createUnprocessedLabelResult,
  verifyLabel,
} from "./domain/verification.js";
import { AppError } from "./errors.js";
import type { ExtractionProvider } from "./providers/extraction-provider.js";
import { validateLabelImage } from "./uploads/image-validation.js";

const expectedLabelSchema = z.object({
  applicationId: z
    .string()
    .trim()
    .max(80)
    .transform((value) => value || undefined)
    .optional(),
  brandName: z.string().trim().min(1).max(200),
  classType: z.string().trim().min(1).max(300),
  alcoholContent: z.string().trim().min(1).max(100),
  netContents: z.string().trim().min(1).max(100),
});

const MAX_BATCH_SIZE = 10;
const BATCH_CONCURRENCY = 2;

function toExpectedLabel(
  parsed: z.infer<typeof expectedLabelSchema>,
): ExpectedLabel {
  return {
    brandName: parsed.brandName,
    classType: parsed.classType,
    alcoholContent: parsed.alcoholContent,
    netContents: parsed.netContents,
    ...(parsed.applicationId ? { applicationId: parsed.applicationId } : {}),
  };
}

function parseBatchApplications(value: unknown): ExpectedLabel[] | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(value) as unknown;
  } catch {
    throw new AppError(
      "INVALID_BATCH_DATA",
      "The batch application data could not be read. Review the selected labels and try again.",
      400,
    );
  }

  return z
    .array(expectedLabelSchema)
    .min(1)
    .max(MAX_BATCH_SIZE)
    .parse(parsedJson)
    .map(toExpectedLabel);
}

function getUploadedFiles(request: Request): Express.Multer.File[] {
  if (request.file) return [request.file];
  if (!request.files) return [];
  if (Array.isArray(request.files)) return request.files;

  return [...(request.files.labels ?? []), ...(request.files.label ?? [])];
}

function safeSourceName(file: Express.Multer.File): string {
  return (
    file.originalname.replace(/\\/g, "/").split("/").at(-1)?.slice(0, 255) ??
    "label-image"
  );
}

export interface CreateAppOptions {
  provider: ExtractionProvider;
  maxFileSizeBytes: number;
  maxImagePixels: number;
}

export function createApp(options: CreateAppOptions): Express {
  const app = express();
  app.disable("x-powered-by");

  app.use((_request, response, next) => {
    response.set({
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    });
    next();
  });

  app.use(
    express.static(fileURLToPath(new URL("../public", import.meta.url)), {
      index: "index.html",
      etag: true,
      maxAge: "1h",
    }),
  );

  app.get("/api/status", (_request, response) => {
    response.set("Cache-Control", "no-store").json({
      status: "ok",
      extractionProvider: options.provider.name,
      fixtureMode: options.provider.isFixture,
    });
  });

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: options.maxFileSizeBytes,
      files: MAX_BATCH_SIZE,
      fields: 10,
      fieldSize: 50_000,
    },
  });

  const handleVerification: RequestHandler = async (request, response) => {
    const files = getUploadedFiles(request);
    if (files.length === 0) {
      throw new AppError(
        "LABEL_REQUIRED",
        "Choose at least one label image before starting verification.",
        400,
      );
    }

    const requestBody: unknown = request.body;
    const applicationsValue: unknown =
      typeof requestBody === "object" && requestBody !== null
        ? (Reflect.get(requestBody, "applications") as unknown)
        : undefined;
    const batchApplications = parseBatchApplications(applicationsValue);
    if (batchApplications && batchApplications.length !== files.length) {
      throw new AppError(
        "BATCH_LENGTH_MISMATCH",
        "Each selected label must have one set of application values.",
        400,
      );
    }

    if (files.length > 1 && !batchApplications) {
      throw new AppError(
        "BATCH_APPLICATIONS_REQUIRED",
        "Review the application values for every selected label before verifying the batch.",
        400,
      );
    }

    const expectedLabels = batchApplications ?? [
      toExpectedLabel(expectedLabelSchema.parse(request.body)),
    ];
    const preserveItemFailures = files.length > 1;

    const processFile = async (
      file: Express.Multer.File,
      expected: ExpectedLabel,
    ): Promise<VerificationResult> => {
      const startedAt = performance.now();
      try {
        const image = await validateLabelImage(file, {
          maxPixels: options.maxImagePixels,
        });
        const extracted = await options.provider.extract(image);
        const result = verifyLabel(expected, extracted, image.originalName, 0);
        result.processingTimeMs = Math.round(performance.now() - startedAt);
        return result;
      } catch (error: unknown) {
        if (preserveItemFailures && error instanceof AppError) {
          return createUnprocessedLabelResult(
            expected,
            safeSourceName(file),
            Math.round(performance.now() - startedAt),
            error.message,
          );
        }
        throw error;
      }
    };

    const results: VerificationResult[] = [];
    for (let index = 0; index < files.length; index += BATCH_CONCURRENCY) {
      const chunk = files.slice(index, index + BATCH_CONCURRENCY);
      const chunkResults = await Promise.all(
        chunk.map((file, chunkIndex) => {
          const expected = expectedLabels[index + chunkIndex];
          if (!expected) {
            throw new AppError(
              "BATCH_LENGTH_MISMATCH",
              "Each selected label must have one set of application values.",
              400,
            );
          }
          return processFile(file, expected);
        }),
      );
      results.push(...chunkResults);
    }

    const csv = createVerificationCsv(results);
    const filename = createReportFilename(
      results.length === 1 ? results[0]?.applicationId : "batch",
    );

    const acceptHeader = request.get("Accept") ?? "";
    const wantsJson =
      acceptHeader.includes("application/json") &&
      !acceptHeader.includes("text/csv");

    if (wantsJson) {
      response
        .status(200)
        .set("Cache-Control", "no-store")
        .json({
          ...(results.length === 1 ? { result: results[0] } : {}),
          results,
          report: {
            filename,
            content: csv,
          },
        });
      return;
    }

    response
      .status(200)
      .set({
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "text/csv; charset=utf-8",
      })
      .send(csv);
  };

  app.post(
    "/api/verifications",
    upload.fields([
      { name: "label", maxCount: 1 },
      { name: "labels", maxCount: MAX_BATCH_SIZE },
    ]),
    handleVerification,
  );

  app.use((_request, response) => {
    response.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "The requested resource was not found.",
      },
    });
  });

  const errorHandler: ErrorRequestHandler = (
    error,
    _request,
    response,
    _next,
  ) => {
    void _next;
    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === "LIMIT_FILE_SIZE";
      response.status(tooLarge ? 413 : 400).json({
        error: {
          code: tooLarge ? "FILE_TOO_LARGE" : "INVALID_UPLOAD",
          message: tooLarge
            ? "An image is too large. Choose a smaller file and try again."
            : "The upload could not be accepted. Submit no more than 10 images and try again.",
        },
      });
      return;
    }

    if (error instanceof ZodError) {
      response.status(400).json({
        error: {
          code: "INVALID_APPLICATION_DATA",
          message: "Complete all required application fields and try again.",
          details: z.treeifyError(error),
        },
      });
      return;
    }

    if (error instanceof AppError) {
      response.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
          ...(error.details === undefined ? {} : { details: error.details }),
        },
      });
      return;
    }

    console.error("Unexpected request failure", error);
    response.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "The request could not be completed. Please try again.",
      },
    });
  };

  app.use(errorHandler);
  return app;
}
