import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { db } from "./db";
import { SESSION_COOKIE, SESSION_MAX_AGE_SEC, signSession, verifySession } from "./session";

export async function setSessionCookie(res: NextResponse, userId: string) {
  res.cookies.set(SESSION_COOKIE, await signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getCurrentUser() {
  const store = await cookies();
  const userId = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      nickname: true,
      neighborhoodName: true,
      lat: true,
      lng: true,
      radiusKm: true,
    },
  });
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
export type LocatedUser = CurrentUser & { lat: number; lng: number; neighborhoodName: string };

export function hasLocation(user: CurrentUser): user is LocatedUser {
  return user.lat != null && user.lng != null && user.neighborhoodName != null;
}

/** For pages: logged-in user with a neighborhood set, redirecting otherwise. */
export async function requireLocatedUser(): Promise<LocatedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasLocation(user)) redirect("/onboarding/location");
  return user;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
