"use client";

import { useSyncExternalStore, type ReactNode } from "react";

function subscribe() {
  return () => undefined;
}

function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export function ClientOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const isClient = useIsClient();
  if (!isClient) return <>{fallback ?? null}</>;
  return <>{children}</>;
}
