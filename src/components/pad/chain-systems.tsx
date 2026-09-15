"use client";

import { useEffect, useRef } from "react";

export type ChainWorld = {
  id: string;
  label: string;
  note: string;
  count: number;
  xPct: number;
  yPct: number;
  hue: [string, string, string]; // highlight, mid, shadow
};

type Moon = { angle: number; speed: number; rx: number; ry: number; size: number };

/** Each chain is rendered as its own glowing world; every live token launched
 *  on that chain orbits it as a moon (real counts, capped visually at 6 with
 *  the rest folded into orbit density rather than invented). Pseudo-3D via
 *  squashed orbit ellipses and near/far draw ordering — no WebGL dependency,
 *  same canvas approach as the rest of the background. */
export function ChainSystems({ worlds, className }: { worlds: ChainWorld[]; className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let raf = 0;
    const moonsByWorld = new Map<string, Moon[]>();

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const scale = Math.min(width, height);
      for (const world of worlds) {
        const shown = Math.max(0, Math.min(world.count, 6));
        const moons: Moon[] = Array.from({ length: shown }, (_, i) => ({
          angle: (i / shown) * Math.PI * 2 + Math.random() * 0.6,
          speed: (0.00028 + Math.random() * 0.00018) * (i % 2 === 0 ? 1 : -1),
          rx: scale * (0.1 + i * 0.018),
          ry: scale * (0.035 + i * 0.007),
          size: Math.max(2, scale * 0.009 - i * 0.3),
        }));
        moonsByWorld.set(world.id, moons);
      }
    }

    function sphere(cx: number, cy: number, r: number, hue: [string, string, string]) {
      const grad = ctx!.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
      grad.addColorStop(0, `rgb(${hue[0]})`);
      grad.addColorStop(0.55, `rgb(${hue[1]})`);
      grad.addColorStop(1, `rgb(${hue[2]})`);
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, Math.PI * 2);
      ctx!.fill();

      const glow = ctx!.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.9);
      glow.addColorStop(0, `rgba(${hue[0]},0.22)`);
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.arc(cx, cy, r * 1.9, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawMoon(cx: number, cy: number, m: Moon, t: number, near: boolean) {
      const a = m.angle + t * m.speed;
      const y = Math.sin(a);
      if (near !== y > 0) return;
      const x = cx + Math.cos(a) * m.rx;
      const yy = cy + y * m.ry;
      const depth = (y + 1) / 2; // 0 far .. 1 near
      const r = m.size * (0.55 + depth * 0.7);
      ctx!.globalAlpha = 0.45 + depth * 0.55;
      ctx!.beginPath();
      ctx!.fillStyle = "#dbeafe";
      ctx!.arc(x, yy, r, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.globalAlpha = 1;
    }

    function frame(t: number) {
      ctx!.clearRect(0, 0, width, height);
      for (const world of worlds) {
        const cx = width * world.xPct;
        const cy = height * world.yPct;
        const r = Math.max(14, Math.min(width, height) * (0.05 + Math.sqrt(world.count) * 0.014));
        const moons = moonsByWorld.get(world.id) ?? [];

        ctx!.strokeStyle = "rgba(255,255,255,0.08)";
        ctx!.lineWidth = 1;
        for (const m of moons) {
          ctx!.beginPath();
          ctx!.ellipse(cx, cy, m.rx, m.ry, 0, 0, Math.PI * 2);
          ctx!.stroke();
        }

        for (const m of moons) drawMoon(cx, cy, m, t, false);
        sphere(cx, cy, r, world.hue);
        for (const m of moons) drawMoon(cx, cy, m, t, true);
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    if (reduceMotion) {
      frame(0);
    } else {
      raf = requestAnimationFrame(frame);
    }
    const onResize = () => {
      resize();
      if (reduceMotion) frame(0);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
