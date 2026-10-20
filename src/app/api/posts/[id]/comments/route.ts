import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, jsonError } from "@/lib/auth";
import { commentSchema, firstError } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return jsonError("로그인이 필요해요.", 401);
  const { id } = await params;

  const parsed = commentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(firstError(parsed.error), 400);

  if (!(await db.post.findUnique({ where: { id }, select: { id: true } }))) {
    return jsonError("글을 찾을 수 없어요.", 404);
  }
  const comment = await db.comment.create({
    data: { postId: id, authorId: user.id, content: parsed.data.content },
    select: { id: true, content: true, createdAt: true, author: { select: { id: true, nickname: true } } },
  });
  return NextResponse.json(comment, { status: 201 });
}
