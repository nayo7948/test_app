"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { resizeImage } from "@/lib/resize-image";
import { CATEGORIES, CATEGORY_KEYS, MAX_IMAGES_PER_POST as MAX_PHOTOS } from "@/lib/validators";

type Photo = { file: File; preview: string };

export function PostForm({ neighborhoodName }: { neighborhoodName: string }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  // Release preview object URLs when the form goes away.
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const room = MAX_PHOTOS - photos.length;
    const picked = Array.from(files).slice(0, room);
    if (files.length > room) setError(`사진은 ${MAX_PHOTOS}장까지 올릴 수 있어요.`);
    setPreparing(true);
    const resized = await Promise.all(picked.map(resizeImage));
    setPhotos((prev) => [...prev, ...resized.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    setPreparing(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(e.currentTarget);
    for (const photo of photos) form.append("images", photo.file);
    try {
      const { id } = await api<{ id: string }>("/api/posts", "POST", form);
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

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={photos.length >= MAX_PHOTOS || preparing}
          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-lg border border-border text-xs text-muted disabled:opacity-50"
        >
          <span className="text-2xl" aria-hidden>
            📷
          </span>
          {preparing ? "준비 중…" : `${photos.length}/${MAX_PHOTOS}`}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          aria-label="사진 첨부"
          onChange={(e) => addPhotos(e.target.files)}
        />
        {photos.map((photo, i) => (
          <div key={photo.preview} className="relative h-20 w-20 shrink-0">
            <Image
              src={photo.preview}
              alt={`첨부한 사진 ${i + 1}`}
              width={80}
              height={80}
              unoptimized
              className="h-20 w-20 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              aria-label={`사진 ${i + 1} 삭제`}
              className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs text-background"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted">📍 {neighborhoodName} 이웃들에게 보여요.</p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button type="submit" disabled={pending || preparing} className="btn-primary">
        {pending ? "올리는 중…" : "완료"}
      </button>
    </form>
  );
}
