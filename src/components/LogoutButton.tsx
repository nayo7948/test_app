"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await api("/api/auth/logout", "POST");
    router.replace("/login");
    router.refresh();
  }
  return (
    <button onClick={logout} className="text-sm text-muted underline">
      로그아웃
    </button>
  );
}
