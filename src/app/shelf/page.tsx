import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function ShelfIndexPage() {
  const { profile } = await getSessionUser();
  if (profile) redirect(`/shelf/${profile.handle}`);
  redirect("/onceuponers");
}
