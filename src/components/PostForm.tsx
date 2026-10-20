"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/validators";

export function PostForm({ neighborhoodName }: { neighborhoodName: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const { id } = await api<{ id: string }>("/api/posts", "POST", Object.fromEntries(new FormData(e.currentTarget)));
      router.replace(`/posts/${id}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 px-4 py-4">
      <select name="category" className="input" aria-label="주제" defaultValue="QUESTION">
        {CATEGORY_KEYS.map((key) => (
          <option key={key} value={key}>
            {CATEGORIES[key]}
          </option>
        ))}
      </select>
      <input name="title" placeholder="제목" className="input" required maxLength={100} />
      <textarea
        name="content"
        placeholder={`${neighborhoodName} 이웃과 이야기를 나눠보세요.`}
        className="input min-h-48 resize-y"
        required
        maxLength={5000}
      />
      <p className="text-xs text-muted">📍 {neighborhoodName} 이웃들에게 보여요.</p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        완료
      </button>
    </form>
  );
}
