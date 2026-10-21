"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const ITEMS = [
  { href: "/", label: "동네생활", icon: "🏘️" },
  { href: "/posts/new", label: "글쓰기", icon: "✏️" },
  { href: "/me", label: "나의 동네", icon: "👤" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Desktop/tablet header navigation (md and up). */
export function TopNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 hidden border-b border-border bg-background/90 backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
          <Logo size={32} />
          우리동네
        </Link>
        <nav className="flex gap-1">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm ${
                isActive(pathname, item.href) ? "bg-surface font-semibold" : "text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

/** Phone tab bar (below md). Hidden on post detail, where the comment box takes the bottom. */
export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/posts/") && pathname !== "/posts/new") return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md border-x border-t border-border bg-background md:hidden">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-1 flex-col items-center py-2 text-xs ${
            isActive(pathname, item.href) ? "font-semibold text-foreground" : "text-muted"
          }`}
        >
          <span className="text-xl" aria-hidden>
            {item.icon}
          </span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
