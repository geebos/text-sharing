import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TextSharing - 安全便捷的文本分享平台",
  description: "安全、私密、便捷的文本分享平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}