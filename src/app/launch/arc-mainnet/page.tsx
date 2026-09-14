import { redirect } from "next/navigation";

export const metadata = { title: "Arc" };

export default function ArcMainnetPage() {
  redirect("/launch/arc");
}
