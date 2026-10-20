import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, jsonError } from "@/lib/auth";
import { firstError, locationSchema } from "@/lib/validators";

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("로그인이 필요해요.", 401);

  const parsed = locationSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(firstError(parsed.error), 400);

  const updated = await db.user.update({
    where: { id: user.id },
    data: parsed.data,
    select: { neighborhoodName: true, lat: true, lng: true, radiusKm: true },
  });
  return NextResponse.json(updated);
}
