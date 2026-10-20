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
    <main className="flex min-h-dvh flex-col justify-center bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/60 px-6">
      <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
        <Logo size={48} className="shrink-0 drop-shadow-sm" />
        우리동네
      </h1>
      <p className="mb-8 text-muted">내 근처 이웃과 나누는 동네 이야기</p>
      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl bg-background p-5 shadow-sm ring-1 ring-border">
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
    </main>
  );
}
