import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { decodeCursor, getNearbyPosts } from "@/lib/posts";

const YEOKSAM = { lat: 37.5006, lng: 127.0365 };
// ~2.5km east: inside the 3km bounding box's lng range but checked exactly by haversine.
const SAMSUNG = { lat: 37.5088, lng: 127.0631 };
// Box corner: within the bounding box, outside the 3km circle.
const CORNER = { lat: 37.5006 + 0.025, lng: 127.0365 + 0.032 };
const BUSAN = { lat: 35.1631, lng: 129.1636 };

beforeAll(async () => {
  await db.post.deleteMany();
  await db.user.deleteMany();
  const user = await db.user.create({ data: { email: "t@example.com", passwordHash: "x", nickname: "tester" } });
  const base = Date.now();
  const rows = [];
  // 60 nearby posts interleaved with 60 far/corner posts, so pages need several DB batches.
  for (let i = 0; i < 60; i++) {
    rows.push({ ...YEOKSAM, title: `near-${i}`, category: "FREE", at: base - i * 2 * 1000 });
    rows.push({ ...(i % 2 ? CORNER : BUSAN), title: `far-${i}`, category: "FREE", at: base - (i * 2 + 1) * 1000 });
  }
  rows.push({ ...SAMSUNG, title: "samsung", category: "QUESTION", at: base + 1000 });
  for (const r of rows) {
    await db.post.create({
      data: {
        authorId: user.id,
        category: r.category,
        title: r.title,
        content: "c",
        neighborhoodName: "n",
        lat: r.lat,
        lng: r.lng,
        createdAt: new Date(r.at),
      },
    });
  }
});

afterAll(() => db.$disconnect());

describe("getNearbyPosts", () => {
  it("returns only posts inside the radius, newest first, across pages", async () => {
    const seen: string[] = [];
    let cursor: string | null = null;
    let pages = 0;
    do {
      const page = await getNearbyPosts({ center: YEOKSAM, radiusKm: 3, cursor: decodeCursor(cursor), limit: 20 });
      seen.push(...page.posts.map((p) => p.title));
      for (const p of page.posts) expect(p.distanceKm).toBeLessThanOrEqual(3);
      cursor = page.nextCursor;
      pages++;
    } while (cursor && pages < 10);

    expect(seen).toEqual(["samsung", ...Array.from({ length: 60 }, (_, i) => `near-${i}`)]);
    expect(pages).toBe(4);
  });

  it("filters by category", async () => {
    const page = await getNearbyPosts({ center: YEOKSAM, radiusKm: 3, category: "QUESTION" });
    expect(page.posts.map((p) => p.title)).toEqual(["samsung"]);
    expect(page.nextCursor).toBeNull();
  });

  it("excludes posts outside a small radius", async () => {
    const page = await getNearbyPosts({ center: YEOKSAM, radiusKm: 1, limit: 100 });
    expect(page.posts.some((p) => p.title === "samsung")).toBe(false);
    expect(page.posts).toHaveLength(60);
  });
});
