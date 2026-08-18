import { describe, expect, it } from "vitest";
import { onePixelPng } from "../../test/fixtures.js";
import { readImageDimensions } from "./image-dimensions.js";

describe("readImageDimensions", () => {
  it("reads PNG dimensions", () => {
    expect(readImageDimensions(onePixelPng, "image/png")).toEqual({
      width: 1,
      height: 1,
    });
  });

  it("rejects truncated content", () => {
    expect(readImageDimensions(Buffer.from("not an image"), "image/png")).toBe(
      undefined,
    );
  });

  it("reads lossless WebP dimensions with bounded header parsing", () => {
    const buffer = Buffer.alloc(26);
    buffer.write("RIFF", 0, "ascii");
    buffer.writeUInt32LE(18, 4);
    buffer.write("WEBP", 8, "ascii");
    buffer.write("VP8L", 12, "ascii");
    buffer.writeUInt32LE(5, 16);
    buffer[20] = 0x2f;
    buffer[21] = 0x09;
    buffer[22] = 0x80;
    buffer[23] = 0x0c;
    buffer[24] = 0;

    expect(readImageDimensions(buffer, "image/webp")).toEqual({
      width: 10,
      height: 51,
    });
  });
});
