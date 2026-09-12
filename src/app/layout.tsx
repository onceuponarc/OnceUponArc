import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";
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
    "A token launchpad. Solana mainnet is live. Launch SPL, NFT, Pump-style, or Pons-style. Arc testnet is live for wallets.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${syne.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-parchment">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
