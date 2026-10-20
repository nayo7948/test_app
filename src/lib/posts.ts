import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { boundingBox, haversineKm, type LatLng } from "./geo";
import type { Category } from "./validators";

export const FEED_PAGE_SIZE = 20;
const BATCH_SIZE = 50;

const postListSelect = {
  id: true,
  category: true,
  title: true,
  content: true,
  neighborhoodName: true,
  lat: true,
  lng: true,
  viewCount: true,
  createdAt: true,
  author: { select: { id: true, nickname: true } },
  _count: { select: { comments: true, likes: true } },
} satisfies Prisma.PostSelect;

type PostRow = Prisma.PostGetPayload<{ select: typeof postListSelect }>;
export type FeedPost = PostRow & { distanceKm: number };

export type FeedCursor = { createdAt: string; id: string };

export function encodeCursor(post: { createdAt: Date; id: string }): string {
  return Buffer.from(JSON.stringify({ createdAt: post.createdAt.toISOString(), id: post.id })).toString(
    "base64url",
  );
}

export function decodeCursor(raw: string | null | undefined): FeedCursor | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString());
    if (typeof parsed.createdAt === "string" && typeof parsed.id === "string") return parsed;
  } catch {}
  return null;
}

/**
 * Newest posts within `radiusKm` of `center`.
 * The bounding box narrows candidates in SQL; the exact circle check runs in JS.
 * Candidates are scanned in batches so corner-of-the-box posts don't leave pages short.
 */
export async function getNearbyPosts(opts: {
  center: LatLng;
  radiusKm: number;
  category?: Category | null;
  cursor?: FeedCursor | null;
  limit?: number;
}): Promise<{ posts: FeedPost[]; nextCursor: string | null }> {
  const { center, radiusKm, category, limit = FEED_PAGE_SIZE } = opts;
  const box = boundingBox(center, radiusKm);
  const results: FeedPost[] = [];
  let cursor = opts.cursor ?? null;

  while (results.length <= limit) {
    const where: Prisma.PostWhereInput = {
      lat: { gte: box.minLat, lte: box.maxLat },
      lng: { gte: box.minLng, lte: box.maxLng },
      ...(category ? { category } : {}),
      ...(cursor
        ? {
            OR: [
              { createdAt: { lt: new Date(cursor.createdAt) } },
              { createdAt: new Date(cursor.createdAt), id: { lt: cursor.id } },
            ],
          }
        : {}),
    };
    const batch: PostRow[] = await db.post.findMany({
      where,
      select: postListSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: BATCH_SIZE,
    });

    for (const post of batch) {
      const distanceKm = haversineKm(center, post);
      if (distanceKm <= radiusKm) results.push({ ...post, distanceKm });
    }
    if (batch.length < BATCH_SIZE) break;
    const last = batch[batch.length - 1];
    cursor = { createdAt: last.createdAt.toISOString(), id: last.id };
  }

  const posts = results.slice(0, limit);
  const nextCursor = results.length > limit ? encodeCursor(posts[posts.length - 1]) : null;
  return { posts, nextCursor };
}

export async function getPostDetail(id: string, viewerId: string) {
  const post = await db.post.findUnique({
    where: { id },
    select: {
      ...postListSelect,
      comments: {
        orderBy: { createdAt: "asc" },
        select: { id: true, content: true, createdAt: true, author: { select: { id: true, nickname: true } } },
      },
      likes: { where: { userId: viewerId }, select: { userId: true } },
    },
  });
  if (!post) return null;
  const { likes, ...rest } = post;
  return { ...rest, likedByMe: likes.length > 0 };
}

/** Toggle the viewer's like; returns the new state and count. */
export async function toggleLike(postId: string, userId: string) {
  const key = { userId_postId: { userId, postId } };
  const existing = await db.like.findUnique({ where: key });
  if (existing) await db.like.delete({ where: key });
  else await db.like.create({ data: { userId, postId } });
  const likeCount = await db.like.count({ where: { postId } });
  return { liked: !existing, likeCount };
}
