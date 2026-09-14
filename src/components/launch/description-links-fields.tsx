"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type DescriptionLinksValue = {
  description: string;
  website: string;
  twitter: string;
  telegram: string;
};

export const EMPTY_DESCRIPTION_LINKS: DescriptionLinksValue = {
  description: "",
  website: "",
  twitter: "",
  telegram: "",
};

export function DescriptionLinksFields({
  value,
  onChange,
  twitterLabel = "X / Twitter",
}: {
  value: DescriptionLinksValue;
  onChange: (next: DescriptionLinksValue) => void;
  twitterLabel?: string;
}) {
  function set<K extends keyof DescriptionLinksValue>(key: K, next: string) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Description &amp; links</p>
      <div>
        <Label>Description</Label>
        <Textarea
          className="mt-2"
          rows={3}
          value={value.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What is this token about?"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Website</Label>
          <Input
            className="mt-2"
            value={value.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div>
          <Label>{twitterLabel}</Label>
          <Input
            className="mt-2"
            value={value.twitter}
            onChange={(e) => set("twitter", e.target.value)}
            placeholder="@handle or https://x.com/…"
          />
        </div>
        <div>
          <Label>Telegram</Label>
          <Input
            className="mt-2"
            value={value.telegram}
            onChange={(e) => set("telegram", e.target.value)}
            placeholder="https://t.me/…"
          />
        </div>
      </div>
    </div>
  );
}
