"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readApiJson } from "@/lib/http/read-json";

export type CoverPick = {
  url: string;
  imageUri: string;
  cid: string | null;
  storage: "ipfs" | "supabase";
};

export function CoverField({
  value,
  required,
  onChange,
}: {
  value: CoverPick | null;
  required?: boolean;
  onChange: (cover: CoverPick | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paste, setPaste] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/media/cover", { method: "POST", body: form });
      const body = await readApiJson<CoverPick & { error?: string }>(res);
      if (!res.ok) {
        setError(body.error ?? "Could not upload the image.");
        return;
      }
      onChange(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload the image.");
    } finally {
      setBusy(false);
    }
  }

  async function applyPaste(raw: string) {
    setPaste(raw);
    const value = raw.trim();
    if (value.length < 8) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/media/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const body = await readApiJson<CoverPick & { error?: string }>(res);
      if (!res.ok) {
        setError(body.error ?? "Could not read that IPFS link.");
        return;
      }
      onChange(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that IPFS link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="cover">Coin image {required ? "(required)" : ""}</Label>
      <p className="text-sm text-parchment/60">
        Jacket art. Upload a PNG/JPEG/WebP, or paste an IPFS CID. We pin to IPFS when a pin token is
        configured; otherwise the cover is public on the pad and the metadata JSON still carries the
        image.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <label className="relative flex h-36 w-36 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-arc/40 bg-black/30">
          {value?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.url} alt="Coin art" className="h-full w-full object-cover" />
          ) : (
            <span className="px-3 text-center text-xs text-parchment/55">Drop or choose art</span>
          )}
          <input
            id="cover"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </label>
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            value={paste}
            onChange={(e) => void applyPaste(e.target.value)}
            placeholder="ipfs://… or CID or https://ipfs.io/ipfs/…"
          />
          {value ? (
            <p className="break-all text-xs text-parchment/50">
              {value.storage === "ipfs" ? `IPFS ${value.cid}` : "Hosted on the pad"} · {value.imageUri}
            </p>
          ) : null}
          {busy ? <p className="text-xs text-arc">Saving art…</p> : null}
          {error ? <p className="text-xs text-burgundy">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
