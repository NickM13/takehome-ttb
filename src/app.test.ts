import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { MockExtractionProvider } from "./providers/mock-extraction-provider.js";
import { onePixelPng } from "../test/fixtures.js";

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

describe("application", () => {
  it("serves the accessible upload page", async () => {
    const response = await request(buildApp()).get("/").expect(200);
    expect(response.text).toContain("Alcohol Label Verification");
    expect(response.headers["content-security-policy"]).toContain(
      "frame-ancestors 'none'",
    );
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
});
