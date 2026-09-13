export function PadBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div className="absolute inset-0 bg-[linear-gradient(165deg,#041018_0%,#071b28_42%,#041018_100%)]" />
      <div className="absolute -top-24 right-[-8%] size-[42rem] rounded-full bg-arc/18 blur-3xl" />
      <div className="absolute bottom-[-12%] left-[-10%] size-[36rem] rounded-full bg-secondary/20 blur-3xl" />
      <div className="pad-vignette absolute inset-0" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(231 251 246 / 18%) 1px, transparent 1px), linear-gradient(90deg, rgb(231 251 246 / 18%) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
    </div>
  );
}
