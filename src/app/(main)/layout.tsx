import { BottomNav, TopNav } from "@/components/Nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav />
      <div className="mx-auto min-h-dvh max-w-md border-x border-border pb-20 md:min-h-0 md:max-w-6xl md:border-x-0 md:px-6 md:pb-12">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
