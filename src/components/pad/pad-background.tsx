export function PadBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1630] via-ink to-[#120c18]" />
      <div className="pad-vignette absolute inset-0" />
    </div>
  );
}
