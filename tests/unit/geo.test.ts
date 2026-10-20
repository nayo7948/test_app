import { describe, expect, it } from "vitest";
import { boundingBox, formatDistance, haversineKm, withinRadius } from "@/lib/geo";

const GANGNAM_STN = { lat: 37.4979, lng: 127.0276 };
const YEOKSAM_STN = { lat: 37.5006, lng: 127.0365 };
const BUSAN_STN = { lat: 35.1151, lng: 129.0414 };

describe("haversineKm", () => {
  it("measures nearby subway stations", () => {
    expect(haversineKm(GANGNAM_STN, YEOKSAM_STN)).toBeCloseTo(0.84, 1);
  });

  it("measures Seoul to Busan", () => {
    expect(haversineKm(GANGNAM_STN, BUSAN_STN)).toBeGreaterThan(310);
    expect(haversineKm(GANGNAM_STN, BUSAN_STN)).toBeLessThan(330);
  });

  it("is zero for the same point and symmetric", () => {
    expect(haversineKm(GANGNAM_STN, GANGNAM_STN)).toBe(0);
    expect(haversineKm(GANGNAM_STN, YEOKSAM_STN)).toBeCloseTo(haversineKm(YEOKSAM_STN, GANGNAM_STN), 10);
  });
});

describe("boundingBox", () => {
  it("contains every point on the radius circle", () => {
    const radius = 3;
    const box = boundingBox(GANGNAM_STN, radius);
    for (let deg = 0; deg < 360; deg += 15) {
      // Step slightly inside the circle along each bearing.
      const r = ((radius * 0.999) / 6371) * (180 / Math.PI);
      const lat = GANGNAM_STN.lat + r * Math.cos((deg * Math.PI) / 180);
      const lng = GANGNAM_STN.lng + (r * Math.sin((deg * Math.PI) / 180)) / Math.cos((lat * Math.PI) / 180);
      if (haversineKm(GANGNAM_STN, { lat, lng }) > radius) continue;
      expect(lat).toBeGreaterThanOrEqual(box.minLat);
      expect(lat).toBeLessThanOrEqual(box.maxLat);
      expect(lng).toBeGreaterThanOrEqual(box.minLng);
      expect(lng).toBeLessThanOrEqual(box.maxLng);
    }
  });
});

describe("withinRadius", () => {
  it("keeps only items inside the radius, with distances", () => {
    const items = [
      { id: "near", ...YEOKSAM_STN },
      { id: "far", ...BUSAN_STN },
    ];
    const result = withinRadius(items, GANGNAM_STN, 3);
    expect(result.map((r) => r.id)).toEqual(["near"]);
    expect(result[0].distanceKm).toBeCloseTo(0.84, 1);
  });
});

describe("formatDistance", () => {
  it("formats meters and kilometers", () => {
    expect(formatDistance(0.05)).toBe("100m 이내");
    expect(formatDistance(0.84)).toBe("800m");
    expect(formatDistance(2.345)).toBe("2.3km");
  });
});
