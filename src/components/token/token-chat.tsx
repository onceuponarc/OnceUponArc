"use client";

import { useEffect, useRef, useState } from "react";
import { readApiJson } from "@/lib/http/read-json";
import { timeAgo } from "@/lib/format";

type Message = {
  id: string;
  authorHandle: string;
  body: string;
  burnUsd: number;
  burnStatus: "pending" | "confirmed" | "failed";
  burnTx: string | null;
  createdAt: string;
};

type Limit = { dailyCapUsd: number; enabled: boolean; spentToday: number };

export function TokenChat({ slug, viewerHandle }: { slug: string; viewerHandle: string | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [limit, setLimit] = useState<Limit | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  async function refreshMessages() {
    const res = await fetch(`/api/chat/${slug}`, { cache: "no-store" });
    const body = await readApiJson<{ messages?: Message[] }>(res);
    setMessages(body.messages ?? []);
  }

  async function refreshLimit() {
    if (!viewerHandle) return;
    const res = await fetch("/api/chat/limit", { cache: "no-store" });
    const body = await readApiJson<Limit & { error?: string }>(res);
    if (!body.error) setLimit(body);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshMessages();
    void refreshLimit();
    const id = window.setInterval(() => void refreshMessages(), 4000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, viewerHandle]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function send() {
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text.trim() }),
      });
      const body = await readApiJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(body.error ?? "Could not send that.");
      setText("");
      await Promise.all([refreshMessages(), refreshLimit()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send that.");
    } finally {
      setBusy(false);
    }
  }

  async function saveLimit(dailyCapUsd: number, enabled: boolean) {
    await fetch("/api/chat/limit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dailyCapUsd, enabled }),
    });
    await refreshLimit();
  }

  const pctSpent = limit ? Math.min(100, (limit.spentToday / Math.max(limit.dailyCapUsd, 0.01)) * 100) : 0;
  const capped = limit ? limit.spentToday + 0.05 > limit.dailyCapUsd || !limit.enabled : false;

  return (
    <div className="flex h-[520px] flex-col rounded-3xl border border-white/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Live chat · on-chain</p>
          <p className="text-xs text-white/45">Every message buys &amp; burns 5¢ of $ORBITX from your desk wallet.</p>
        </div>
        {viewerHandle ? (
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:border-white/30"
          >
            {limit ? `$${limit.spentToday.toFixed(2)} / $${limit.dailyCapUsd.toFixed(2)} today` : "Settings"}
          </button>
        ) : null}
      </div>

      {showSettings && limit ? (
        <div className="space-y-3 border-b border-white/10 bg-white/[0.03] p-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gold" style={{ width: `${pctSpent}%` }} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={limit.enabled}
                onChange={(e) => void saveLimit(limit.dailyCapUsd, e.target.checked)}
              />
              Pay-to-chat enabled
            </label>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/45">Daily cap $</span>
            <input
              type="number"
              min={0.05}
              step={0.5}
              defaultValue={limit.dailyCapUsd}
              onBlur={(e) => void saveLimit(Number(e.target.value) || 5, limit.enabled)}
              className="w-20 rounded-lg border border-white/15 bg-transparent px-2 py-1"
            />
          </div>
        </div>
      ) : null}

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {!messages.length ? <p className="text-sm text-white/40">No messages yet — first one&apos;s on you.</p> : null}
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="font-medium text-white/85">@{m.authorHandle}</span>{" "}
            <span className="text-white/40">· {timeAgo(m.createdAt)}</span>
            {m.burnStatus === "confirmed" && m.burnTx ? (
              <a
                href={`https://solscan.io/tx/${m.burnTx}`}
                target="_blank"
                rel="noreferrer"
                className="ml-1.5 text-[10px] text-gold/70 underline"
              >
                🔥 5¢ burned
              </a>
            ) : m.burnStatus === "pending" ? (
              <span className="ml-1.5 text-[10px] text-white/30">burning…</span>
            ) : (
              <span className="ml-1.5 text-[10px] text-red-400/70">burn failed</span>
            )}
            <p className="text-white/75">{m.body}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-3">
        {error ? <p className="mb-2 text-xs text-red-400">{error}</p> : null}
        {viewerHandle ? (
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder={capped ? "Daily cap reached" : "Say something — 5¢ burn per message"}
              disabled={busy || capped}
              className="flex-1 rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm disabled:opacity-40"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={busy || capped || !text.trim()}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
            >
              {busy ? "…" : "Send"}
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-white/45">Sign in with X to chat.</p>
        )}
      </div>
    </div>
  );
}
