import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, hasLocation, jsonError } from "@/lib/auth";
import { decodeCursor, getNearbyPosts } from "@/lib/posts";
import { deleteImages, inspectImage, saveImage } from "@/lib/uploads";
import { CATEGORY_KEYS, type Category, firstError, MAX_IMAGES_PER_POST, postSchema } from "@/lib/validators";

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

  // Multipart (from the post form, with optional "images" files) or plain JSON without images.
  const isMultipart = req.headers.get("content-type")?.startsWith("multipart/form-data");
  const form = isMultipart ? await req.formData().catch(() => null) : null;
  const body = form ? Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")) : await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return jsonError(firstError(parsed.error), 400);

  const files = (form?.getAll("images") ?? []).filter((v): v is File => typeof v !== "string");
  if (files.length > MAX_IMAGES_PER_POST) return jsonError(`사진은 ${MAX_IMAGES_PER_POST}장까지 올릴 수 있어요.`, 400);
  const images = [];
  for (const file of files) {
    const data = new Uint8Array(await file.arrayBuffer());
    const info = inspectImage(data);
    if ("error" in info) return jsonError(info.error, 400);
    images.push({ data, info });
  }

  const saved: string[] = [];
  try {
    for (const { data, info } of images) saved.push(await saveImage(data, info.ext));
    const post = await db.post.create({
      data: {
        ...parsed.data,
        authorId: user.id,
        neighborhoodName: user.neighborhoodName,
        lat: user.lat,
        lng: user.lng,
        images: {
          create: images.map(({ info }, position) => ({
            fileName: saved[position],
            width: info.width,
            height: info.height,
            position,
          })),
        },
      },
      select: { id: true },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    await deleteImages(saved);
    throw err;
  }
}
