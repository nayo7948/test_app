"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "동네생활", icon: "🏘️" },
  { href: "/posts/new", label: "글쓰기", icon: "✏️" },
  { href: "/me", label: "나의 동네", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md border-t border-x border-border bg-background">
      {ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center py-2 text-xs ${active ? "font-semibold text-foreground" : "text-muted"}`}
          >
            <span className="text-xl" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
