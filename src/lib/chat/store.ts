import "server-only";

import { createServiceClient } from "@/lib/supabase/service";

export type ChatMessage = {
  id: string;
  storySlug: string;
  authorUserId: string;
  authorHandle: string;
  body: string;
  burnUsd: number;
  burnTx: string | null;
  burnStatus: "pending" | "confirmed" | "failed";
  failReason: string | null;
  createdAt: string;
};

function fromRow(row: Record<string, unknown>): ChatMessage {
  return {
    id: String(row.id),
    storySlug: String(row.story_slug),
    authorUserId: String(row.author_user_id),
    authorHandle: String(row.author_handle),
    body: String(row.body),
    burnUsd: Number(row.burn_usd),
    burnTx: (row.burn_tx as string | null) ?? null,
    burnStatus: row.burn_status as ChatMessage["burnStatus"],
    failReason: (row.fail_reason as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

export async function listChatMessages(slug: string, limit = 80): Promise<ChatMessage[]> {
  const db = createServiceClient();
  const { data } = await db
    .from("token_chat_messages")
    .select("*")
    .eq("story_slug", slug)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(fromRow).reverse();
}

export async function insertPendingMessage(input: {
  storySlug: string;
  authorUserId: string;
  authorHandle: string;
  body: string;
  burnUsd: number;
}): Promise<ChatMessage> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("token_chat_messages")
    .insert({
      story_slug: input.storySlug,
      author_user_id: input.authorUserId,
      author_handle: input.authorHandle,
      body: input.body,
      burn_usd: input.burnUsd,
      burn_status: "pending",
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not post the message.");
  return fromRow(data);
}

export async function updateMessageBurn(
  id: string,
  next: { status: "confirmed" | "failed"; lamports?: number; tx?: string; failReason?: string },
): Promise<void> {
  const db = createServiceClient();
  await db
    .from("token_chat_messages")
    .update({
      burn_status: next.status,
      burn_lamports: next.lamports ?? undefined,
      burn_tx: next.tx ?? undefined,
      fail_reason: next.failReason ?? undefined,
    })
    .eq("id", id);
}

/** Sum of a user's confirmed chat-burn spend since UTC midnight today. This is
 *  the number the cap is actually enforced against — never trust a client-sent
 *  "spent so far" figure for that decision. */
export async function todaysSpendUsd(userId: string): Promise<number> {
  const db = createServiceClient();
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { data } = await db
    .from("token_chat_messages")
    .select("burn_usd")
    .eq("author_user_id", userId)
    .eq("burn_status", "confirmed")
    .gte("created_at", startOfDay.toISOString());
  return (data ?? []).reduce((sum, row) => sum + Number(row.burn_usd ?? 0), 0);
}

export async function getSpendCap(userId: string): Promise<{ dailyCapUsd: number; enabled: boolean }> {
  const db = createServiceClient();
  const { data } = await db.from("chat_spend_limits").select("*").eq("user_id", userId).maybeSingle();
  if (!data) return { dailyCapUsd: 5, enabled: true };
  return { dailyCapUsd: Number(data.daily_cap_usd), enabled: Boolean(data.enabled) };
}

export async function setSpendCap(userId: string, dailyCapUsd: number, enabled: boolean): Promise<void> {
  const db = createServiceClient();
  await db
    .from("chat_spend_limits")
    .upsert({ user_id: userId, daily_cap_usd: dailyCapUsd, enabled, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
}
