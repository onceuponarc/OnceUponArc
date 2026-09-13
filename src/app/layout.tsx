import { AppShell } from "@/components/app-shell";
import type { Metadata, Viewport } from "next";
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
    default: "OnceUpon — Social launchpad on Arc",
    template: "%s · OnceUpon",
  },
  description:
    "Open a Chapter on Arc. Watch live buys and sells, holders, and the curve. Launch on Arc, Solana SPL, or Robinhood Chain via Pons. Sign in with X.",
  applicationName: "OnceUpon",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "OnceUpon",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#00E5C3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
