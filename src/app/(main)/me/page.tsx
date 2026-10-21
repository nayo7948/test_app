import Link from "next/link";
import { requireLocatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LogoutButton } from "@/components/LogoutButton";
import { PostCard } from "@/components/PostCard";

export default async function MePage() {
  const user = await requireLocatedUser();
  const posts = await db.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { comments: true, likes: true } } },
  });

  return (
    <div className="md:mx-auto md:mt-6 md:max-w-2xl lg:grid lg:max-w-none lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="md:overflow-hidden md:rounded-2xl md:border md:border-border lg:sticky lg:top-22">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-lg font-bold">나의 동네</span>
          <LogoutButton />
        </header>
        <section className="px-4 py-5">
          <div className="text-lg font-semibold">{user.nickname}</div>
          <div className="text-sm text-muted">{user.email}</div>
          <Link
            href="/onboarding/location"
            className="mt-4 flex items-center justify-between rounded-lg bg-surface px-4 py-3 text-sm"
          >
            <span>
              📍 {user.neighborhoodName} · 반경 {user.radiusKm}km
            </span>
            <span className="text-muted">동네 변경 ›</span>
          </Link>
        </section>
      </div>

      <section className="border-t-8 border-surface md:mt-6 md:overflow-hidden md:rounded-2xl md:border md:border-border lg:mt-0">
        <h2 className="px-4 pt-4 pb-1 font-semibold">내가 쓴 글 {posts.length}</h2>
        {posts.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted">아직 쓴 글이 없어요.</p>}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
    </div>
  );
}
