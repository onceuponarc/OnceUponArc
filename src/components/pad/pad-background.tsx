export function PadBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      {/* Plain img: next/image previously 404'd this wallpaper and crashed the pad. */}
      <img
        src="/arc-pad-bg.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#070b14]/45" />
      <div className="pad-vignette absolute inset-0" />
    </div>
  );
}
