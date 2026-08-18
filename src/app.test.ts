import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createApp } from "./app.js";
import { AppError } from "./errors.js";
import type { ExtractionProvider } from "./providers/extraction-provider.js";
import { MockExtractionProvider } from "./providers/mock-extraction-provider.js";
import { onePixelPng } from "../test/fixtures.js";

const browserVerificationResponseSchema = z.object({
  result: z.object({
    applicationId: z.string().optional(),
    sourceFile: z.string(),
    overallStatus: z.string(),
    fields: z.array(
      z.object({
        field: z.string(),
        expectedValue: z.string(),
        observedValue: z.string(),
        status: z.string(),
      }),
    ),
  }),
  report: z.object({
    filename: z.string(),
    content: z.string(),
  }),
});

const batchVerificationResponseSchema = z.object({
  results: z.array(
    z.object({
      applicationId: z.string().optional(),
      sourceFile: z.string(),
      overallStatus: z.string(),
      fields: z.array(
        z.object({
          field: z.string(),
          status: z.string(),
        }),
      ),
    }),
  ),
  report: z.object({
    filename: z.string(),
    content: z.string(),
  }),
});

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

function buildApp() {
  return createApp({
    provider: new MockExtractionProvider(),
    maxFileSizeBytes: 1024 * 1024,
    maxImagePixels: 1_000_000,
  });
}

function validRequest(app: ReturnType<typeof buildApp>) {
  return request(app)
    .post("/api/verifications")
    .field("applicationId", "COLA-123")
    .field("brandName", "OLD TOM DISTILLERY")
    .field("classType", "Kentucky Straight Bourbon Whiskey")
    .field("alcoholContent", "45% Alc./Vol. (90 Proof)")
    .field("netContents", "750 mL")
    .attach("label", onePixelPng, {
      filename: "label.png",
      contentType: "image/png",
    });
}

function validBatchRequest(app: ReturnType<typeof buildApp>) {
  const applications = [
    {
      applicationId: "COLA-ONE",
      brandName: "OLD TOM DISTILLERY",
      classType: "Kentucky Straight Bourbon Whiskey",
      alcoholContent: "45% Alc./Vol. (90 Proof)",
      netContents: "750 mL",
    },
    {
      applicationId: "COLA-TWO",
      brandName: "DIFFERENT BRAND",
      classType: "Kentucky Straight Bourbon Whiskey",
      alcoholContent: "45% Alc./Vol. (90 Proof)",
      netContents: "750 mL",
    },
  ];

  return request(app)
    .post("/api/verifications")
    .set("Accept", "application/json")
    .field("applications", JSON.stringify(applications))
    .attach("labels", onePixelPng, {
      filename: "one.png",
      contentType: "image/png",
    })
    .attach("labels", onePixelPng, {
      filename: "two.png",
      contentType: "image/png",
    });
}

describe("application", () => {
  it("serves the accessible upload page", async () => {
    const response = await request(buildApp()).get("/").expect(200);
    expect(response.text).toContain("Alcohol Label Verification");
    expect(response.text).toContain("Label comparison");
    expect(response.text).toContain("Download CSV");
    expect(response.text).toContain("Review backlog");
    expect(response.text).toContain('id="backlog-body"');
    expect(response.text).toContain('href="/sample-reviews.csv"');
    expect(response.text).toContain('id="preview-region"');
    expect(response.text).toContain('name="labels"');
    expect(response.text).toContain("multiple");
    expect(response.headers["content-security-policy"]).toContain(
      "frame-ancestors 'none'",
    );
  });

  it("serves six repository-backed sample backlog reviews", async () => {
    const response = await request(buildApp())
      .get("/sample-reviews.csv")
      .expect(200);
    const lines = response.text.trim().split(/\r?\n/);

    expect(response.headers["content-type"]).toContain("text/csv");
    expect(lines).toHaveLength(7);
    expect(lines[0]).toBe(
      "review_id,submitted_at,application_id,source_file,brand_name,class_type,alcohol_content,net_contents,overall_status,review_summary",
    );
    expect(response.text).toContain("DEMO-001");
    expect(response.text).toContain("DEMO-006");
    expect(response.text).toContain("needs_review");
  });

  it("reports the explicitly active fixture provider", async () => {
    const response = await request(buildApp()).get("/api/status").expect(200);
    expect(response.body).toEqual({
      status: "ok",
      extractionProvider: "mock-fixture",
      fixtureMode: true,
    });
  });

  it("returns a CSV attachment for a valid verification", async () => {
    const response = await validRequest(buildApp()).expect(200);

    expect(response.headers["content-type"]).toContain("text/csv");
    expect(response.headers["content-disposition"]).toBe(
      'attachment; filename="verification-COLA-123.csv"',
    );
    expect(response.text).toContain(
      "application_id,source_file,overall_status",
    );
    expect(response.text).toContain("COLA-123,label.png,match");
  });

  it("returns structured results plus a CSV export for the browser", async () => {
    const response = await validRequest(buildApp())
      .set("Accept", "application/json")
      .expect(200);
    const body = browserVerificationResponseSchema.parse(response.body);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(body).toMatchObject({
      result: {
        applicationId: "COLA-123",
        sourceFile: "label.png",
        overallStatus: "match",
      },
      report: {
        filename: "verification-COLA-123.csv",
      },
    });
    expect(body.result.fields).toContainEqual({
      field: "brand_name",
      expectedValue: "OLD TOM DISTILLERY",
      observedValue: "OLD TOM DISTILLERY",
      status: "match",
    });
    expect(body.report.content).toContain("COLA-123,label.png,match");
  });

  it("processes multiple labels with per-file application values", async () => {
    const response = await validBatchRequest(buildApp()).expect(200);
    const body = batchVerificationResponseSchema.parse(response.body);

    expect(body.results).toHaveLength(2);
    expect(body.results[0]).toMatchObject({
      applicationId: "COLA-ONE",
      sourceFile: "one.png",
      overallStatus: "match",
    });
    expect(body.results[1]).toMatchObject({
      applicationId: "COLA-TWO",
      sourceFile: "two.png",
      overallStatus: "mismatch",
    });
    expect(body.report.filename).toBe("verification-batch.csv");
    expect(body.report.content).toContain("one.png");
    expect(body.report.content).toContain("two.png");
  });

  it("requires one application record per batch image", async () => {
    const response = await request(buildApp())
      .post("/api/verifications")
      .set("Accept", "application/json")
      .field(
        "applications",
        JSON.stringify([
          {
            brandName: "OLD TOM DISTILLERY",
            classType: "Kentucky Straight Bourbon Whiskey",
            alcoholContent: "45% Alc./Vol. (90 Proof)",
            netContents: "750 mL",
          },
        ]),
      )
      .attach("labels", onePixelPng, {
        filename: "one.png",
        contentType: "image/png",
      })
      .attach("labels", onePixelPng, {
        filename: "two.png",
        contentType: "image/png",
      })
      .expect(400);
    const body = errorResponseSchema.parse(response.body);

    expect(body.error.code).toBe("BATCH_LENGTH_MISMATCH");
  });

  it("preserves successful batch items when another item cannot be processed", async () => {
    const fixture = new MockExtractionProvider();
    let calls = 0;
    const provider: ExtractionProvider = {
      name: "partially-failing-provider",
      isFixture: false,
      async extract(image) {
        calls += 1;
        if (calls === 2) {
          throw new AppError(
            "EXTRACTION_RATE_LIMITED",
            "The extraction service is temporarily rate-limited.",
            503,
          );
        }
        return fixture.extract(image);
      },
    };
    const app = createApp({
      provider,
      maxFileSizeBytes: 1024 * 1024,
      maxImagePixels: 1_000_000,
    });

    const response = await validBatchRequest(app).expect(200);
    const body = batchVerificationResponseSchema.parse(response.body);

    expect(body.results[0]?.overallStatus).toBe("match");
    expect(body.results[1]?.overallStatus).toBe("needs_review");
    expect(
      body.results[1]?.fields.every(({ status }) => status === "needs_review"),
    ).toBe(true);
  });

  it("rejects content that is not an allowed image", async () => {
    const response = await request(buildApp())
      .post("/api/verifications")
      .field("brandName", "OLD TOM DISTILLERY")
      .field("classType", "Kentucky Straight Bourbon Whiskey")
      .field("alcoholContent", "45% Alc./Vol. (90 Proof)")
      .field("netContents", "750 mL")
      .attach("label", Buffer.from("not an image"), {
        filename: "label.png",
        contentType: "image/png",
      })
      .expect(415);

    expect(response.body).toMatchObject({
      error: { code: "UNSUPPORTED_FILE_TYPE" },
    });
  });

  it("returns field errors without creating a misleading report", async () => {
    const response = await request(buildApp())
      .post("/api/verifications")
      .field("brandName", "OLD TOM DISTILLERY")
      .field("alcoholContent", "45% Alc./Vol. (90 Proof)")
      .field("netContents", "750 mL")
      .attach("label", onePixelPng, {
        filename: "label.png",
        contentType: "image/png",
      })
      .expect(400);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body).toMatchObject({
      error: { code: "INVALID_APPLICATION_DATA" },
    });
  });

  it("returns an actionable provider error without a misleading report", async () => {
    const provider: ExtractionProvider = {
      name: "failing-provider",
      isFixture: false,
      async extract() {
        await Promise.resolve();
        throw new AppError(
          "EXTRACTION_CREDITS_EXHAUSTED",
          "The OpenAI account has no available API credits. Add credits or billing, then try again.",
          503,
        );
      },
    };
    const app = createApp({
      provider,
      maxFileSizeBytes: 1024 * 1024,
      maxImagePixels: 1_000_000,
    });

    const response = await validRequest(app).expect(503);
    const body = errorResponseSchema.parse(response.body);

    expect(response.headers["content-type"]).toContain("application/json");
    expect(body.error.code).toBe("EXTRACTION_CREDITS_EXHAUSTED");
    expect(body.error.message).toMatch(/credits/i);
  });
});
