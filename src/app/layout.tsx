import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import PageResetHandler from "@/components/shared/PageResetHandler";
import PasswordGate from "@/components/auth/PasswordGate";
import AutoSummaryGenerator from "@/components/summary/AutoSummaryGenerator";

const geistSans = localFont({ src: "../../public/fonts/geist-latin.woff2", variable: "--font-geist-sans", display: "swap" });
const geistMono = localFont({ src: "../../public/fonts/aux-mono.woff", variable: "--font-geist-mono", display: "swap" });
const displayFont = localFont({ src: "../../public/fonts/mondwest.woff", variable: "--font-display", display: "swap" });

export const viewport = { themeColor: "#050505", colorScheme: "dark" };

export const metadata: Metadata = {
  title: "Suwin's Cosmos",
  description: "Suwin的个人AI数字伙伴 — 记录、陪伴、成长",
  icons: {
    icon: "/cosmos-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const passwordConfigured = !!process.env.SITE_PASSWORD;

  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PasswordGate passwordConfigured={passwordConfigured}>
          <AutoSummaryGenerator />
          <PageResetHandler />
          {children}
        </PasswordGate>
      </body>
    </html>
  );
}
