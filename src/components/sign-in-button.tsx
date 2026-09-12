"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { OnceUponer } from "@/lib/auth";
import Link from "next/link";

export function SignInButton({ profile }: { profile: OnceUponer | null }) {
  if (profile) {
    const initial = profile.handle.slice(0, 1).toUpperCase();
    return (
      <Link
        href={`/shelf/${profile.handle}`}
        className="flex items-center gap-2 rounded-full border border-gold/30 bg-parchment/5 px-2 py-1"
      >
        <Avatar size="sm">
          {profile.portraitUrl ? <AvatarImage src={profile.portraitUrl} alt="" /> : null}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <span className="pr-1 text-sm text-parchment">@{profile.handle}</span>
      </Link>
    );
  }

  return (
    <Button asChild>
      <a href="/auth/login">Sign in with X</a>
    </Button>
  );
}

export function SignOutButton() {
  return (
    <Button variant="outline" asChild>
      <a href="/auth/logout">Close the book</a>
    </Button>
  );
}
