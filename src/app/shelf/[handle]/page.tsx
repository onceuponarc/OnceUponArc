import { redirect } from "next/navigation";

export default async function ShelfAliasPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  redirect(`/u/${handle}`);
}
