import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LocationPicker } from "@/components/LocationPicker";

export default async function LocationPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 py-8 md:flex md:max-w-none md:items-center md:justify-center md:bg-surface">
      <div className="md:w-full md:max-w-lg md:rounded-2xl md:bg-background md:p-8 md:shadow-sm md:ring-1 md:ring-border">
        <h1 className="mb-1 text-2xl font-bold">내 동네 설정</h1>
        <p className="mb-8 text-muted">동네를 설정하면 근처 이웃들의 이야기를 볼 수 있어요.</p>
        <LocationPicker initial={user} />
      </div>
    </main>
  );
}
