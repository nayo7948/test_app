import Link from "next/link";
import { requireLocatedUser } from "@/lib/auth";
import { getNearbyPosts } from "@/lib/posts";
import { CATEGORIES, CATEGORY_KEYS, type Category } from "@/lib/validators";
import { FeedList } from "@/components/FeedList";

const TABS: [string, Category | null][] = [["전체", null], ...CATEGORY_KEYS.map((k) => [CATEGORIES[k], k] as [string, Category])];

const tabHref = (key: Category | null) => (key ? `/?category=${key}` : "/");

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const user = await requireLocatedUser();
  const { category: raw } = await searchParams;
  const category = (CATEGORY_KEYS as string[]).includes(raw ?? "") ? (raw as Category) : null;
  const page = await getNearbyPosts({ center: user, radiusKm: user.radiusKm, category });

  return (
    <div className="lg:grid lg:grid-cols-[180px_minmax(0,1fr)_260px] lg:items-start lg:gap-8 md:pt-6">
      {/* Desktop: categories as a sidebar */}
      <aside className="sticky top-22 hidden lg:block">
        <h2 className="mb-2 px-3 text-xs font-semibold text-muted">주제</h2>
        <nav className="flex flex-col">
          {TABS.map(([label, key]) => (
            <Link
              key={label}
              href={tabHref(key)}
              className={`rounded-lg px-3 py-2 text-sm ${
                category === key ? "bg-surface font-semibold" : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <section className="md:overflow-hidden md:rounded-2xl md:border md:border-border">
        <header className="sticky top-0 z-10 border-b border-border bg-background md:static">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/onboarding/location" className="text-lg font-bold">
              {user.neighborhoodName} ▾
            </Link>
            <span className="text-xs text-muted lg:hidden">반경 {user.radiusKm}km</span>
          </div>
          {/* Phone/tablet: categories as scrollable chips */}
          <nav className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
            {TABS.map(([label, key]) => (
              <Link
                key={label}
                href={tabHref(key)}
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
      </section>

      {/* Desktop: neighborhood summary */}
      <aside className="sticky top-22 hidden space-y-3 lg:block">
        <div className="rounded-2xl border border-border p-5">
          <div className="text-xs text-muted">내 동네</div>
          <div className="mt-1 text-lg font-bold">📍 {user.neighborhoodName}</div>
          <p className="mt-1 text-sm text-muted">반경 {user.radiusKm}km 안의 이웃 글을 보고 있어요.</p>
          <Link href="/onboarding/location" className="mt-3 inline-block text-sm font-semibold text-brand">
            동네·반경 변경 ›
          </Link>
        </div>
        <Link href="/posts/new" className="btn-primary block text-center">
          새 글 쓰기
        </Link>
      </aside>
    </div>
  );
}
