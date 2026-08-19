import { readFileSync } from "node:fs";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createApp } from "./app.js";
import { REQUIRED_GOVERNMENT_WARNING } from "./domain/regulatory-rules.js";
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
    .field("bottlerNameAddress", "BOTTLED BY OLD TOM DISTILLERY, FRANKFORT, KY")
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
      bottlerNameAddress: "BOTTLED BY OLD TOM DISTILLERY, FRANKFORT, KY",
    },
    {
      applicationId: "COLA-TWO",
      brandName: "DIFFERENT BRAND",
      classType: "Kentucky Straight Bourbon Whiskey",
      alcoholContent: "45% Alc./Vol. (90 Proof)",
      netContents: "750 mL",
      bottlerNameAddress: "BOTTLED BY OLD TOM DISTILLERY, FRANKFORT, KY",
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
    expect(response.text).toContain("Application review");
    expect(response.text).toContain("Review backlog");
    expect(response.text).toContain('id="backlog-body"');
    expect(response.text).toContain("Reviewer decision");
    expect(response.text).toContain('id="bulk-review-button"');
    expect(response.text).toContain('id="bulk-selection-summary"');
    expect(response.text).toContain('id="backlog-pagination"');
    expect(response.text).toContain('id="previous-backlog-page-button"');
    expect(response.text).toContain('id="next-backlog-page-button"');
    expect(response.text).toContain('id="completed-reviews-section"');
    expect(response.text).toContain('id="completed-reviews-body"');
    expect(response.text).toContain('id="backlog-empty"');
    expect(response.text).toContain('id="select-all-reviews"');
    expect(response.text).toContain('id="start-verification-button"');
    expect(response.text).toContain('id="back-from-verification-button"');
    expect(response.text).toContain('id="back-to-backlog-top-button"');
    expect(response.text).toContain('id="back-to-backlog-button"');
    expect(response.text).not.toContain('id="review-another-button"');
    expect(response.text).not.toContain('id="download-button"');
    expect(response.text).toContain('id="reviewer-summary"');
    expect(response.text).toContain('id="review-artwork-image"');
    expect(response.text).toContain('id="review-pager"');
    expect(response.text).toContain('id="review-page-select"');
    expect(response.text).toContain('class="results-list"');
    expect(response.text).toContain('id="review-decision-list"');
    expect(response.text).toContain("Final reviewer decision");
    expect(response.text).not.toContain('<th scope="col">Label</th>');
    expect(response.text).toContain('href="/sample-reviews.csv"');
    expect(response.text).toContain('id="sample-label"');
    expect(response.text).toContain("Captain John's Spiced Rum");
    expect(response.text).toContain("Lighthouse Stormchaser Chardonnay");
    expect(response.text).toContain("Malt &amp; Hop Honey Huckleberry Pie Ale");
    expect(response.text).toContain('id="bottlerNameAddress"');
    expect(response.text).toContain('id="countryOfOrigin"');
    expect(response.text).toContain("Government health warning");
    expect(response.text).toContain('id="preview-region"');
    expect(response.text).toContain('name="labels"');
    expect(response.text).toContain("multiple");
    expect(response.headers["content-security-policy"]).toContain(
      "frame-ancestors 'none'",
    );
  });

  it("serves the three official sample label images", async () => {
    const paths = [
      "/sample-labels/captain-johns-spiced-rum.png",
      "/sample-labels/lighthouse-chardonnay.png",
      "/sample-labels/malt-and-hop-ale.png",
    ];

    for (const path of paths) {
      const response = await request(buildApp()).get(path).expect(200);
      expect(response.headers["content-type"]).toContain("image/png");
      expect(response.headers["content-length"]).toBeDefined();
    }
  });

  it("accepts each official sample label through the verification upload path", async () => {
    const filenames = [
      "captain-johns-spiced-rum.png",
      "lighthouse-chardonnay.png",
      "malt-and-hop-ale.png",
    ];

    for (const filename of filenames) {
      const image = readFileSync(
        new URL(`../public/sample-labels/${filename}`, import.meta.url),
      );
      await request(buildApp())
        .post("/api/verifications")
        .set("Accept", "application/json")
        .field("brandName", "OLD TOM DISTILLERY")
        .field("classType", "Kentucky Straight Bourbon Whiskey")
        .field("alcoholContent", "45% Alc./Vol. (90 Proof)")
        .field("netContents", "750 mL")
        .field(
          "bottlerNameAddress",
          "BOTTLED BY OLD TOM DISTILLERY, FRANKFORT, KY",
        )
        .attach("labels", image, {
          filename,
          contentType: "image/png",
        })
        .expect(200);
    }
  });

  it("serves twelve repository-backed sample backlog reviews", async () => {
    const response = await request(buildApp())
      .get("/sample-reviews.csv")
      .expect(200);
    const lines = response.text.trim().split(/\r?\n/);

    expect(response.headers["content-type"]).toContain("text/csv");
    expect(lines).toHaveLength(85);
    expect(lines[0]).toBe(
      "review_id,submitted_at,application_id,source_file,overall_status,field,expected_value,observed_value,field_status,confidence,explanation,processing_time_ms",
    );
    expect(response.text).toContain("DEMO-001");
    expect(response.text).toContain("DEMO-012");
    expect(response.text).toContain("needs_review");
    expect(response.text.split(REQUIRED_GOVERNMENT_WARNING).length - 1).toBe(
      22,
    );
    expect(response.text).toContain(
      "GOVERNMENT WARNING: Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.",
    );
    expect(response.text).toContain("women [obscured] pregnancy");
    for (let reviewNumber = 1; reviewNumber <= 12; reviewNumber += 1) {
      const reviewId = `DEMO-${String(reviewNumber).padStart(3, "0")},`;
      expect(lines.filter((line) => line.startsWith(reviewId))).toHaveLength(7);
    }
  });

  it("serves artwork for every sample backlog review", async () => {
    const artworkMappings = [
      ["harbor-light-gin.png", "harbor-light-gin.svg"],
      ["mesa-roja-tequila.png", "mesa-roja-tequila.svg"],
      ["north-fork-vodka.png", "north-fork-vodka.svg"],
      ["stone-bridge-bourbon.png", "stone-bridge-bourbon.svg"],
      ["cascade-pear-brandy.png", "cascade-pear-brandy.svg"],
      ["old-tom-reserve.png", "old-tom-reserve.svg"],
      ["lakeview-riesling.png", "lakeview-riesling.svg"],
      ["copper-finch-ipa.png", "copper-finch-ipa.svg"],
      ["sierra-azul-mezcal.png", "sierra-azul-mezcal.svg"],
      ["red-cedar-rye.png", "red-cedar-rye.svg"],
      ["orchard-gate-cider.png", "orchard-gate-cider.svg"],
      ["atlantic-reserve-rum.png", "atlantic-reserve-rum.svg"],
    ];
    const clientScript = readFileSync(
      new URL("../public/app.js", import.meta.url),
      "utf8",
    );

    for (const [sourceFilename, artworkFilename] of artworkMappings) {
      const response = await request(buildApp())
        .get(`/sample-labels/demo/${artworkFilename}`)
        .expect(200);
      const artwork = response.body as Buffer;
      expect(response.headers["content-type"]).toContain("image/svg+xml");
      expect(artwork.toString("utf8")).toContain("Synthetic demo label");
      expect(clientScript).toContain(
        `"${sourceFilename}": "/sample-labels/demo/${artworkFilename}"`,
      );
    }
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
    expect(body.result.fields).toContainEqual({
      field: "bottler_name_address",
      expectedValue: "BOTTLED BY OLD TOM DISTILLERY, FRANKFORT, KY",
      observedValue: "BOTTLED BY OLD TOM DISTILLERY, FRANKFORT, KY",
      status: "match",
    });
    expect(body.result.fields).toContainEqual({
      field: "country_of_origin",
      expectedValue: "Not applicable (domestic product)",
      observedValue: "",
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
            bottlerNameAddress: "BOTTLED BY OLD TOM DISTILLERY, FRANKFORT, KY",
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
      .field(
        "bottlerNameAddress",
        "BOTTLED BY OLD TOM DISTILLERY, FRANKFORT, KY",
      )
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
      .field(
        "bottlerNameAddress",
        "BOTTLED BY OLD TOM DISTILLERY, FRANKFORT, KY",
      )
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
