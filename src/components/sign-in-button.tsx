"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { OnceUponer } from "@/lib/auth";
import { XMark } from "@/components/x-mark";
import Link from "next/link";

export function SignInButton({ profile }: { profile: OnceUponer | null }) {
  if (profile) {
    const initial = profile.handle.slice(0, 1).toUpperCase();
    return (
      <Link
        href={`/you`}
        className="flex items-center gap-2 rounded-full border border-gold/30 bg-white/5 px-2 py-1 backdrop-blur-xl"
      >
        <Avatar size="sm">
          {profile.portraitUrl ? <AvatarImage src={profile.portraitUrl} alt="" /> : null}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <span className="hidden pr-1 text-sm text-parchment sm:inline">@{profile.handle}</span>
      </Link>
    );
  }

  return (
    <Button asChild size="sm">
      <a href="/auth/login" className="gap-1.5">
        <XMark className="size-3.5" />
        Sign in with X
      </a>
    </Button>
  );
}

export function SignOutButton() {
  return (
    <Button variant="outline" asChild>
      <a href="/auth/logout">Sign out</a>
    </Button>
  );
}
