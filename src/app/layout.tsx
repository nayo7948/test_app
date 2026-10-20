import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리동네",
  description: "내 근처 이웃과 나누는 동네 이야기",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <div className="mx-auto min-h-dvh max-w-md border-x border-border pb-20">{children}</div>
      </body>
    </html>
  );
}
