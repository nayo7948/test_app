import Link from "next/link";
import { requireLocatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { BottomNav } from "@/components/BottomNav";
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
    <>
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
      <h2 className="border-t-8 border-surface px-4 pt-4 font-semibold">내가 쓴 글 {posts.length}</h2>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <BottomNav />
    </>
  );
}
