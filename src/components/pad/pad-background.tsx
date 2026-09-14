export function PadBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div className="stars-layer stars-far" />
      <div className="stars-layer stars-near" />
      <div className="nebula-blob nebula-cyan" />
      <div className="nebula-blob nebula-violet" />
      <div className="nebula-blob nebula-gold" />
      <div className="pad-vignette absolute inset-0" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(255 255 255 / 70%) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 70%) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
