import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { SpawnDesk } from "@/components/cards/spawn-desk";

export const metadata: Metadata = { title: "Print a card" };

export default async function NewCardPage() {
  const { profile } = await getSessionUser();
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Spawn</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Print a press card</h1>
      </div>
      <SpawnDesk handle={profile?.handle ?? null} />
    </div>
  );
}
