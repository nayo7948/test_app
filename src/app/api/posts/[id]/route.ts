import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, jsonError } from "@/lib/auth";
import { getPostDetail } from "@/lib/posts";
import { deleteImages } from "@/lib/uploads";
import { firstError, postSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return jsonError("로그인이 필요해요.", 401);
  const post = await getPostDetail((await params).id, user.id);
  if (!post) return jsonError("글을 찾을 수 없어요.", 404);
  return NextResponse.json(post);
}

async function loadOwnPost(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: jsonError("로그인이 필요해요.", 401) };
  const post = await db.post.findUnique({ where: { id }, select: { authorId: true } });
  if (!post) return { error: jsonError("글을 찾을 수 없어요.", 404) };
  if (post.authorId !== user.id) return { error: jsonError("작성자만 할 수 있어요.", 403) };
  return { error: null };
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const { error } = await loadOwnPost(id);
  if (error) return error;

  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(firstError(parsed.error), 400);

  await db.post.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ id });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const { error } = await loadOwnPost(id);
  if (error) return error;

  const images = await db.postImage.findMany({ where: { postId: id }, select: { fileName: true } });
  await db.post.delete({ where: { id } });
  await deleteImages(images.map((i) => i.fileName));
  return NextResponse.json({ ok: true });
}
