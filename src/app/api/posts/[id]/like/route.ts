import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, jsonError } from "@/lib/auth";
import { toggleLike } from "@/lib/posts";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return jsonError("로그인이 필요해요.", 401);
  const { id } = await params;

  if (!(await db.post.findUnique({ where: { id }, select: { id: true } }))) {
    return jsonError("글을 찾을 수 없어요.", 404);
  }
  return NextResponse.json(await toggleLike(id, user.id));
}
