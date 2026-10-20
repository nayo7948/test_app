import { describe, expect, it } from "vitest";
import { locationSchema, postSchema, signupSchema } from "@/lib/validators";

describe("validators", () => {
  it("rejects short passwords and bad emails on signup", () => {
    expect(signupSchema.safeParse({ email: "a@b.co", password: "short", nickname: "이웃" }).success).toBe(false);
    expect(signupSchema.safeParse({ email: "nope", password: "longenough", nickname: "이웃" }).success).toBe(false);
    expect(signupSchema.safeParse({ email: "a@b.co", password: "longenough", nickname: "이웃" }).success).toBe(true);
  });

  it("only allows the offered radius options", () => {
    const base = { neighborhoodName: "역삼동", lat: 37.5, lng: 127.03 };
    expect(locationSchema.safeParse({ ...base, radiusKm: 3 }).success).toBe(true);
    expect(locationSchema.safeParse({ ...base, radiusKm: 50 }).success).toBe(false);
    expect(locationSchema.safeParse({ ...base, lat: 120, radiusKm: 3 }).success).toBe(false);
  });

  it("requires a known category and non-blank title", () => {
    expect(postSchema.safeParse({ category: "FREE", title: "안녕", content: "하세요" }).success).toBe(true);
    expect(postSchema.safeParse({ category: "MARKET", title: "안녕", content: "하세요" }).success).toBe(false);
    expect(postSchema.safeParse({ category: "FREE", title: "   ", content: "하세요" }).success).toBe(false);
  });
});
