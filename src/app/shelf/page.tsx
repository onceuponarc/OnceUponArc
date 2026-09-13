import { getSessionUser } from "@/lib/auth";
import { ShelfGate } from "@/components/shelf-gate";

export const metadata = { title: "Shelf" };

export default async function ShelfIndexPage() {
  const { profile } = await getSessionUser();
  return <ShelfGate handle={profile?.handle ?? null} />;
}
