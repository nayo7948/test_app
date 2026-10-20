import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const PUBLIC_PAGES = ["/login", "/signup"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const loggedIn = (await verifySession(req.cookies.get(SESSION_COOKIE)?.value)) != null;
  const isPublic = PUBLIC_PAGES.includes(pathname);

  if (!loggedIn && !isPublic) return NextResponse.redirect(new URL("/login", req.url));
  if (loggedIn && isPublic) return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}

export const config = {
  // API routes answer 401 themselves; skip static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
