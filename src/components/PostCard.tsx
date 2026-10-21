import Image from "next/image";
import Link from "next/link";
import { formatDistance } from "@/lib/geo";
import { timeAgo } from "@/lib/format";
import { CATEGORIES, type Category } from "@/lib/validators";

export type PostCardData = {
  id: string;
  category: string;
  title: string;
  content: string;
  neighborhoodName: string;
  createdAt: Date | string;
  distanceKm?: number;
  images?: { url: string; width: number; height: number }[];
  _count: { comments: number; likes: number; images?: number };
};

export function PostCard({ post }: { post: PostCardData }) {
  const thumb = post.images?.[0];
  const imageCount = post._count.images ?? 0;
  return (
    <Link href={`/posts/${post.id}`} className="flex gap-3 border-b border-border px-4 py-4 hover:bg-surface">
      <div className="min-w-0 flex-1">
        <span className="rounded bg-surface px-1.5 py-0.5 text-xs text-muted">
          {CATEGORIES[post.category as Category] ?? post.category}
        </span>
        <h2 className="mt-2 font-semibold">{post.title}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{post.content}</p>
        <div className="mt-2 flex items-center justify-between text-xs text-muted">
          <span>
            {post.neighborhoodName}
            {post.distanceKm != null && ` · ${formatDistance(post.distanceKm)}`} · {timeAgo(post.createdAt)}
          </span>
          <span className="space-x-2">
            {post._count.likes > 0 && <span>♡ {post._count.likes}</span>}
            {post._count.comments > 0 && <span>💬 {post._count.comments}</span>}
          </span>
        </div>
      </div>
      {thumb && (
        <div className="relative mt-7 shrink-0 self-start">
          <Image
            src={thumb.url}
            alt=""
            width={thumb.width}
            height={thumb.height}
            unoptimized
            className="block h-18 w-18 rounded-lg object-cover md:h-22 md:w-22"
          />
          {imageCount > 1 && (
            <span className="absolute right-1 bottom-1 rounded bg-black/60 px-1 text-[10px] text-white">
              {imageCount}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
