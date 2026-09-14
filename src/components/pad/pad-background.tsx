export function PadBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/banner.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.07]" />
      <div className="pad-vignette absolute inset-0" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(255 255 255 / 70%) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 70%) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
