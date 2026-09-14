import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  alt = "OrbitX",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/logo.jpg" alt={alt} className={cn("object-cover", className)} />
  );
}

export function BrandBanner({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/banner.jpg" alt="" className={cn("h-full w-full object-cover object-center", className)} />
  );
}
