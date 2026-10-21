"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { timeAgo } from "@/lib/format";

export function LikeButton({ postId, liked, count }: { postId: string; liked: boolean; count: number }) {
  const [state, setState] = useState({ liked, likeCount: count });
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    try {
      setState(await api<{ liked: boolean; likeCount: number }>(`/api/posts/${postId}/like`, "POST"));
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-pressed={state.liked}
      className={`rounded-full border px-3 py-1 text-sm ${state.liked ? "border-brand text-brand" : "border-border text-muted"}`}
    >
      {state.liked ? "♥" : "♡"} 공감 {state.likeCount}
    </button>
  );
}

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  async function remove() {
    if (!confirm("글을 삭제할까요?")) return;
    await api(`/api/posts/${postId}`, "DELETE");
    router.replace("/");
    router.refresh();
  }
  return (
    <button onClick={remove} className="text-sm text-muted underline">
      삭제
    </button>
  );
}

type Comment = { id: string; content: string; createdAt: Date | string; author: { nickname: string } };

export function CommentSection({ postId, initial }: { postId: string; initial: Comment[] }) {
  const [comments, setComments] = useState(initial);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const comment = await api<Comment>(`/api/posts/${postId}/comments`, "POST", { content });
      setComments((prev) => [...prev, comment]);
      setContent("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="border-t-8 border-surface">
      <h2 className="px-4 pt-4 font-semibold">댓글 {comments.length}</h2>
      <ul>
        {comments.map((c) => (
          <li key={c.id} className="border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">
              {c.author.nickname} <span className="font-normal text-xs text-muted">{timeAgo(c.createdAt)}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm">{c.content}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={onSubmit} className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md gap-2 border-x border-t border-border bg-background p-3 md:static md:max-w-none md:border-x-0">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력해주세요."
          className="input"
          aria-label="댓글"
          maxLength={1000}
        />
        <button type="submit" disabled={pending || !content.trim()} className="shrink-0 rounded-lg bg-brand px-4 font-semibold text-white disabled:opacity-50">
          등록
        </button>
      </form>
      {error && <p className="px-4 text-sm text-red-500">{error}</p>}
    </section>
  );
}
