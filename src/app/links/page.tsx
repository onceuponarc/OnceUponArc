import { ShareDeck } from "@/components/links/share-deck";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links",
  description: "OnceUpon on Arc — X, Telegram updates, community. Website coming soon.",
  openGraph: {
    title: "OnceUpon · links",
    description: "X, Telegram updates, community. Website on the press.",
    url: "/links",
  },
};

export default function LinksPage() {
  return <ShareDeck />;
}
