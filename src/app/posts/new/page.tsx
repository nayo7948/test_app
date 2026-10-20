import { requireLocatedUser } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import { PostForm } from "@/components/PostForm";

export default async function NewPostPage() {
  const user = await requireLocatedUser();
  return (
    <>
      <header className="border-b border-border px-4 py-3 text-lg font-bold">동네생활 글쓰기</header>
      <PostForm neighborhoodName={user.neighborhoodName} />
      <BottomNav />
    </>
  );
}
