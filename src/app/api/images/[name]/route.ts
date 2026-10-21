import { getCurrentUser, jsonError } from "@/lib/auth";
import { readImage } from "@/lib/uploads";

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!(await getCurrentUser())) return jsonError("로그인이 필요해요.", 401);

  const image = await readImage((await params).name);
  if (!image) return jsonError("사진을 찾을 수 없어요.", 404);

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.contentType,
      // File names are random and never reused, so the content never changes.
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
