import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError, setSessionCookie } from "@/lib/auth";
import { firstError, signupSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const parsed = signupSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(firstError(parsed.error), 400);
  const { password, nickname } = parsed.data;

  const email = parsed.data.email.toLowerCase();
  if (await db.user.findUnique({ where: { email } })) {
    return jsonError("이미 가입된 이메일이에요.", 409);
  }

  const user = await db.user.create({
    data: { email, nickname, passwordHash: await bcrypt.hash(password, 10) },
  });
  const res = NextResponse.json({ id: user.id }, { status: 201 });
  await setSessionCookie(res, user.id);
  return res;
}
