import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creator Studio Demo",
  description: "A fictional creator analytics dashboard — all data is for demonstration purposes only.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0f] text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
