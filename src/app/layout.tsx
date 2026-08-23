import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "LYNK — Links and QR codes, beautifully managed",
    template: "%s · LYNK",
  },
  description:
    "Shorten links, design custom QR codes, and understand every scan. A modern link management platform with a built-in QR design studio.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans min-h-screen bg-white text-zinc-950 antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
