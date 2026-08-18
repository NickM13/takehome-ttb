import express, {
  type ErrorRequestHandler,
  type Express,
  type RequestHandler,
} from "express";
import multer from "multer";
import { fileURLToPath } from "node:url";
import { z, ZodError } from "zod";
import { createReportFilename, createVerificationCsv } from "./csv/report.js";
import { verifyLabel } from "./domain/verification.js";
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
      files: 1,
      fields: 8,
      fieldSize: 10_000,
    },
  });

  const handleVerification: RequestHandler = async (request, response) => {
    if (!request.file) {
      throw new AppError(
        "LABEL_REQUIRED",
        "Choose a label image before starting verification.",
        400,
      );
    }

    const startedAt = performance.now();
    const parsedExpected = expectedLabelSchema.parse(request.body);
    const expected = {
      brandName: parsedExpected.brandName,
      classType: parsedExpected.classType,
      alcoholContent: parsedExpected.alcoholContent,
      netContents: parsedExpected.netContents,
      ...(parsedExpected.applicationId
        ? { applicationId: parsedExpected.applicationId }
        : {}),
    };
    const image = await validateLabelImage(request.file, {
      maxPixels: options.maxImagePixels,
    });

    const extracted = await options.provider.extract(image);
    const result = verifyLabel(expected, extracted, image.originalName, 0);
    result.processingTimeMs = Math.round(performance.now() - startedAt);
    const csv = createVerificationCsv(result);
    const filename = createReportFilename(expected.applicationId);

    response
      .status(200)
      .set({
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "text/csv; charset=utf-8",
      })
      .send(csv);
  };

  app.post("/api/verifications", upload.single("label"), handleVerification);

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
            ? "The image is too large. Choose a smaller file and try again."
            : "The upload could not be accepted. Submit one image and try again.",
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
