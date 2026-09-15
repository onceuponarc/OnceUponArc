import { XIcon, Send, LineChart, ArrowLeftRight, Compass } from "lucide-react";
import { OFFICIAL_TOKEN } from "@/lib/official-token";
import { LinkButton } from "@/components/links/link-button";

const ICON: Record<string, typeof XIcon> = {
  X: XIcon,
  Updates: Send,
  Telegram: Send,
  Chart: LineChart,
  Buy: ArrowLeftRight,
  Solscan: Compass,
};

export function ChannelStrip() {
  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {OFFICIAL_TOKEN.channels.map((link) => (
        <LinkButton
          key={link.href}
          href={link.href}
          label={link.label}
          Icon={ICON[link.label] ?? Compass}
        />
      ))}
    </div>
  );
}
