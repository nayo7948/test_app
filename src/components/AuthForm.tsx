"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { Logo } from "./Logo";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isSignup = mode === "signup";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api(`/api/auth/${mode}`, "POST", form);
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-emerald-50 to-background px-6 py-10 dark:from-emerald-950/60">
      <div className="w-full max-w-md lg:grid lg:max-w-5xl lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-emerald-600 lg:text-5xl dark:text-emerald-400">
            <Logo size={48} className="shrink-0 drop-shadow-sm lg:h-18 lg:w-18" />
            우리동네
          </h1>
          <p className="mb-8 text-muted lg:text-lg">내 근처 이웃과 나누는 동네 이야기</p>
          <ul className="hidden space-y-3 lg:block">
            <li>📍 내 위치 반경 안의 이웃 글만 모아 봐요</li>
            <li>💬 동네 질문, 맛집, 분실물 소식을 나눠요</li>
            <li>♡ 공감과 댓글로 이웃과 이야기해요</li>
          </ul>
        </div>
        <div>
          <form onSubmit={onSubmit} className="space-y-3 rounded-2xl bg-background p-5 shadow-sm ring-1 ring-border lg:p-8">
            {isSignup && <input name="nickname" placeholder="닉네임" className="input focus:border-emerald-500" required />}
            <input name="email" type="email" placeholder="이메일" className="input focus:border-emerald-500" required autoComplete="email" />
            <input
              name="password"
              type="password"
              placeholder={isSignup ? "비밀번호 (8자 이상)" : "비밀번호"}
              className="input focus:border-emerald-500"
              required
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={pending} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
              {isSignup ? "가입하기" : "로그인"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            {isSignup ? "이미 계정이 있나요? " : "처음이신가요? "}
            <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-emerald-600 dark:text-emerald-400">
              {isSignup ? "로그인" : "회원가입"}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
