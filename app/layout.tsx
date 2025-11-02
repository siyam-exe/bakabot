import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BakaBot - Your Anime Companion",
  description: "Chat with an emotionally dynamic anime AI companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-black">
      <body className="h-full overflow-hidden bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
