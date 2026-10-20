import { NextResponse } from "next/server";
import { getCurrentUser, jsonError } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("로그인이 필요해요.", 401);
  return NextResponse.json(user);
}
