import { PAD_NAME, launchExplorerLinks, venueLabel } from "@onceupon/config/launchpad";
import { Badge } from "@/components/ui/badge";
import { CopyCa } from "@/components/story/copy-ca";

export function LaunchLinks({
  mint,
  venue,
  chain,
  twitterUrl,
  telegramUrl,
  websiteUrl,
  metadataUri,
}: {
  mint: string;
  venue?: string | null;
  chain?: string | null;
  twitterUrl?: string | null;
  telegramUrl?: string | null;
  websiteUrl?: string | null;
  metadataUri?: string | null;
}) {
  const links = launchExplorerLinks(mint, chain);
  const socials = [
    twitterUrl ? { href: twitterUrl, label: "X" } : null,
    telegramUrl ? { href: telegramUrl, label: "Telegram" } : null,
    websiteUrl ? { href: websiteUrl, label: "Website" } : null,
  ].filter((item): item is { href: string; label: string } => Boolean(item));
  const chainLinks =
    chain === "arc"
      ? [
          { href: links.explorer, label: "Arcscan" },
          { href: metadataUri || links.metadata, label: "Metadata JSON" },
        ]
      : [
          { href: links.dexscreener, label: "DexScreener" },
          { href: links.solscan, label: "Solscan" },
          { href: links.birdeye, label: "Birdeye" },
          venue === "pumpfun" && links.pumpswap ? { href: links.pumpswap, label: "PumpSwap" } : null,
          { href: metadataUri || links.metadata, label: "Metadata JSON" },
        ].filter((item): item is { href: string; label: string } => Boolean(item));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{PAD_NAME}</Badge>
        <Badge variant="outline">{venueLabel(venue, chain)}</Badge>
        <CopyCa mint={mint} />
      </div>
      {socials.length ? (
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {socials.map((item) => (
            <a key={item.label} className="text-gold hover:underline" href={item.href} target="_blank" rel="noreferrer">
              {item.label}
            </a>
          ))}
        </p>
      ) : null}
      <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {chainLinks.map((item) => (
          <a key={item.label} className="text-gold hover:underline" href={item.href} target="_blank" rel="noreferrer">
            {item.label}
          </a>
        ))}
      </p>
    </div>
  );
}
