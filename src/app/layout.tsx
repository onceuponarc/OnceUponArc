import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OnceUpon — The Desk",
    template: "%s · OnceUpon",
  },
  description:
    "A token launchpad on Circle Arc. Authors write Stories. OnceUponers claim The Piece.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${newsreader.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-parchment">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
