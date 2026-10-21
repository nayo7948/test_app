import { requireLocatedUser } from "@/lib/auth";
import { PostForm } from "@/components/PostForm";

export default async function NewPostPage() {
  const user = await requireLocatedUser();
  return (
    <div className="md:mx-auto md:mt-6 md:max-w-2xl md:overflow-hidden md:rounded-2xl md:border md:border-border">
      <header className="border-b border-border px-4 py-3 text-lg font-bold">동네생활 글쓰기</header>
      <PostForm neighborhoodName={user.neighborhoodName} />
    </div>
  );
}
