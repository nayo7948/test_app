import Link from "next/link";
import { requireLocatedUser } from "@/lib/auth";
import { getNearbyPosts } from "@/lib/posts";
import { CATEGORIES, CATEGORY_KEYS, type Category } from "@/lib/validators";
import { BottomNav } from "@/components/BottomNav";
import { FeedList } from "@/components/FeedList";

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const user = await requireLocatedUser();
  const { category: raw } = await searchParams;
  const category = (CATEGORY_KEYS as string[]).includes(raw ?? "") ? (raw as Category) : null;
  const page = await getNearbyPosts({ center: user, radiusKm: user.radiusKm, category });

  const tabs: [string, string | null][] = [["전체", null], ...CATEGORY_KEYS.map((k) => [CATEGORIES[k], k] as [string, string])];

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/onboarding/location" className="text-lg font-bold">
            {user.neighborhoodName} ▾
          </Link>
          <span className="text-xs text-muted">반경 {user.radiusKm}km</span>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
          {tabs.map(([label, key]) => (
            <Link
              key={label}
              href={key ? `/?category=${key}` : "/"}
              className={`shrink-0 rounded-full border px-3 py-1 text-sm ${
                category === key ? "border-foreground bg-foreground text-background" : "border-border"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <FeedList key={category ?? "all"} initial={page} category={category} />
      <BottomNav />
    </>
  );
}
