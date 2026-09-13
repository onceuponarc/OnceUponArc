import { redirect } from "next/navigation";

export const metadata = { title: "Launch" };

export default function LaunchPage() {
  redirect("/launch/arc");
}
