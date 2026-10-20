import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, hasLocation, jsonError } from "@/lib/auth";
import { decodeCursor, getNearbyPosts } from "@/lib/posts";
import { CATEGORY_KEYS, type Category, firstError, postSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("로그인이 필요해요.", 401);
  if (!hasLocation(user)) return jsonError("먼저 동네를 설정해주세요.", 409);

  const params = new URL(req.url).searchParams;
  const rawCategory = params.get("category");
  const category = (CATEGORY_KEYS as string[]).includes(rawCategory ?? "") ? (rawCategory as Category) : null;

  const result = await getNearbyPosts({
    center: user,
    radiusKm: user.radiusKm,
    category,
    cursor: decodeCursor(params.get("cursor")),
  });
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("로그인이 필요해요.", 401);
  if (!hasLocation(user)) return jsonError("먼저 동네를 설정해주세요.", 409);

  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(firstError(parsed.error), 400);

  const post = await db.post.create({
    data: {
      ...parsed.data,
      authorId: user.id,
      neighborhoodName: user.neighborhoodName,
      lat: user.lat,
      lng: user.lng,
    },
    select: { id: true },
  });
  return NextResponse.json(post, { status: 201 });
}
