"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-full bg-[#0b0a12] text-[#f6efe2]">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
          <div className="rounded-3xl border border-[#c9a227]/30 bg-[#0e0c16]/80 p-8">
            <h1 className="text-3xl font-bold">This page could not load</h1>
            <p className="mt-3 text-sm text-[#cbbfa8]">
              {error.message || "A server error occurred. Try again."}
            </p>
            <Button className="mt-6" onClick={reset}>
              Reload
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
