import { describe, expect, it } from "vitest";
import { inspectImage, MAX_IMAGE_BYTES } from "@/lib/uploads";

// 2x3 PNG
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAADCAYAAAC56t6BAAAAEElEQVR4nGP4z8DwnxjMAACUZQ/x8xA2FgAAAABJRU5ErkJggg==",
  "base64",
);

describe("inspectImage", () => {
  it("accepts a real image and reads its size from the bytes", () => {
    expect(inspectImage(PNG)).toEqual({ ext: "png", contentType: "image/png", width: 2, height: 3 });
  });

  it("rejects non-images regardless of what the client claims", () => {
    expect(inspectImage(Buffer.from("<script>alert(1)</script>"))).toHaveProperty("error");
    expect(inspectImage(new Uint8Array())).toHaveProperty("error");
  });

  it("rejects image formats outside the allow-list", () => {
    // Minimal BMP header (14-byte file header + 40-byte info header, 1x1)
    const bmp = Buffer.alloc(58);
    bmp.write("BM", 0);
    bmp.writeUInt32LE(58, 2);
    bmp.writeUInt32LE(54, 10);
    bmp.writeUInt32LE(40, 14);
    bmp.writeInt32LE(1, 18);
    bmp.writeInt32LE(1, 22);
    expect(inspectImage(bmp)).toEqual({ error: "JPG, PNG, WebP, GIF 사진만 올릴 수 있어요." });
  });

  it("rejects files over the size limit", () => {
    const big = Buffer.concat([PNG, Buffer.alloc(MAX_IMAGE_BYTES)]);
    expect(inspectImage(big)).toEqual({ error: "사진은 한 장에 10MB까지 올릴 수 있어요." });
  });
});
