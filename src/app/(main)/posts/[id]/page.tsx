import Link from "next/link";
import { notFound } from "next/navigation";
import { requireLocatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { timeAgo } from "@/lib/format";
import { formatDistance, haversineKm } from "@/lib/geo";
import { getPostDetail } from "@/lib/posts";
import { CATEGORIES, type Category } from "@/lib/validators";
import { CommentSection, DeletePostButton, LikeButton } from "@/components/PostActions";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireLocatedUser();
  const { id } = await params;
  const post = await getPostDetail(id, user.id);
  if (!post) notFound();
  await db.post.update({ where: { id }, data: { viewCount: { increment: 1 } } });

  return (
    <div className="md:mx-auto md:mt-6 md:max-w-2xl md:overflow-hidden md:rounded-2xl md:border md:border-border">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <Link href="/" aria-label="뒤로">
          ←
        </Link>
        {post.author.id === user.id && <DeletePostButton postId={post.id} />}
      </header>
      <article className="px-4 py-4">
        <span className="rounded bg-surface px-1.5 py-0.5 text-xs text-muted">
          {CATEGORIES[post.category as Category] ?? post.category}
        </span>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface">🙂</div>
          <div>
            <div className="text-sm font-semibold">{post.author.nickname}</div>
            <div className="text-xs text-muted">
              {post.neighborhoodName} · {formatDistance(haversineKm(user, post))} · {timeAgo(post.createdAt)}
            </div>
          </div>
        </div>
        <h1 className="mt-4 text-xl font-bold">{post.title}</h1>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        <div className="mt-6 flex items-center justify-between">
          <LikeButton postId={post.id} liked={post.likedByMe} count={post._count.likes} />
          <span className="text-xs text-muted">조회 {post.viewCount + 1}</span>
        </div>
      </article>
      <CommentSection postId={post.id} initial={post.comments} />
    </div>
  );
}
