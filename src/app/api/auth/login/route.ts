import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError, setSessionCookie } from "@/lib/auth";
import { firstError, loginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(firstError(parsed.error), 400);

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return jsonError("이메일 또는 비밀번호가 올바르지 않아요.", 401);
  }

  const res = NextResponse.json({ id: user.id, hasLocation: user.lat != null });
  await setSessionCookie(res, user.id);
  return res;
}
