import { AppShell } from "@/components/app-shell";
import type { Metadata } from "next";
import { Geist, Syne } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "OnceUpon — Launchpad",
    template: "%s · OnceUpon",
  },
  description:
    "A token launchpad. Sign in with X via Supabase. The pad wallet lives in Supabase. Swaps route through Jupiter. Arc launches are not open yet.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${syne.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-parchment">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
