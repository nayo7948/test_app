"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { PostCard, type PostCardData } from "./PostCard";

type Page = { posts: PostCardData[]; nextCursor: string | null };

export function FeedList({ initial, category }: { initial: Page; category: string | null }) {
  const [posts, setPosts] = useState(initial.posts);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!cursor) return;
    setLoading(true);
    const params = new URLSearchParams({ cursor });
    if (category) params.set("category", category);
    try {
      const page = await api<Page>(`/api/posts?${params}`);
      setPosts((prev) => [...prev, ...page.posts]);
      setCursor(page.nextCursor);
    } finally {
      setLoading(false);
    }
  }

  if (posts.length === 0) {
    return (
      <p className="px-4 py-20 text-center text-muted">
        아직 근처에 올라온 글이 없어요.
        <br />첫 번째 이야기를 남겨보세요!
      </p>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {cursor && (
        <button onClick={loadMore} disabled={loading} className="w-full py-4 text-sm text-muted">
          {loading ? "불러오는 중…" : "더보기"}
        </button>
      )}
    </div>
  );
}
