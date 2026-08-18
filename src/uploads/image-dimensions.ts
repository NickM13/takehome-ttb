export interface ImageDimensions {
  width: number;
  height: number;
}

function readUInt24LE(buffer: Buffer, offset: number): number {
  return (
    buffer.readUInt8(offset) |
    (buffer.readUInt8(offset + 1) << 8) |
    (buffer.readUInt8(offset + 2) << 16)
  );
}

function readPngDimensions(buffer: Buffer): ImageDimensions | undefined {
  const pngSignature = "89504e470d0a1a0a";
  if (
    buffer.length < 24 ||
    buffer.subarray(0, 8).toString("hex") !== pngSignature ||
    buffer.subarray(12, 16).toString("ascii") !== "IHDR"
  ) {
    return undefined;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

const jpegStartOfFrameMarkers = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

function readJpegDimensions(buffer: Buffer): ImageDimensions | undefined {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return undefined;
  }

  let offset = 2;
  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    if (offset >= buffer.length) return undefined;

    const marker = buffer.readUInt8(offset);
    offset += 1;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) continue;
    if (offset + 2 > buffer.length) return undefined;

    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length) {
      return undefined;
    }
    if (jpegStartOfFrameMarkers.has(marker)) {
      if (segmentLength < 7) return undefined;
      return {
        width: buffer.readUInt16BE(offset + 5),
        height: buffer.readUInt16BE(offset + 3),
      };
    }
    offset += segmentLength;
  }
  return undefined;
}

function readWebpDimensions(buffer: Buffer): ImageDimensions | undefined {
  if (
    buffer.length < 20 ||
    buffer.subarray(0, 4).toString("ascii") !== "RIFF" ||
    buffer.subarray(8, 12).toString("ascii") !== "WEBP"
  ) {
    return undefined;
  }

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunkType = buffer.subarray(offset, offset + 4).toString("ascii");
    const chunkLength = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;
    if (dataOffset + chunkLength > buffer.length) return undefined;

    if (chunkType === "VP8X" && chunkLength >= 10) {
      return {
        width: readUInt24LE(buffer, dataOffset + 4) + 1,
        height: readUInt24LE(buffer, dataOffset + 7) + 1,
      };
    }

    if (
      chunkType === "VP8 " &&
      chunkLength >= 10 &&
      buffer[dataOffset + 3] === 0x9d &&
      buffer[dataOffset + 4] === 0x01 &&
      buffer[dataOffset + 5] === 0x2a
    ) {
      return {
        width: buffer.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: buffer.readUInt16LE(dataOffset + 8) & 0x3fff,
      };
    }

    if (
      chunkType === "VP8L" &&
      chunkLength >= 5 &&
      buffer[dataOffset] === 0x2f
    ) {
      const byte1 = buffer.readUInt8(dataOffset + 1);
      const byte2 = buffer.readUInt8(dataOffset + 2);
      const byte3 = buffer.readUInt8(dataOffset + 3);
      const byte4 = buffer.readUInt8(dataOffset + 4);
      return {
        width: 1 + byte1 + ((byte2 & 0x3f) << 8),
        height: 1 + (byte2 >> 6) + (byte3 << 2) + ((byte4 & 0x0f) << 10),
      };
    }

    offset = dataOffset + chunkLength + (chunkLength % 2);
  }
  return undefined;
}

export function readImageDimensions(
  buffer: Buffer,
  mimeType: "image/jpeg" | "image/png" | "image/webp",
): ImageDimensions | undefined {
  switch (mimeType) {
    case "image/jpeg":
      return readJpegDimensions(buffer);
    case "image/png":
      return readPngDimensions(buffer);
    case "image/webp":
      return readWebpDimensions(buffer);
  }
}
