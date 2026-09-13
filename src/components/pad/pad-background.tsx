export function PadBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
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
