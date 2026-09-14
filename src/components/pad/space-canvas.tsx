"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; phase: number; speed: number };
type Shooter = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number };

/** A self-contained twinkling starfield + occasional shooting stars, scoped to
 *  whatever container it's placed in (absolute inset-0). Kept separate from
 *  the site-wide CSS starfield in PadBackground so this heavier per-frame
 *  canvas cost only applies to the home hero, not every page in the app. */
export function SpaceCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let shooters: Shooter[] = [];
    let raf = 0;
    let lastShot = 0;

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
      const count = Math.round((width * height) / 5200);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.006,
      }));
    }

    function drawStatic() {
      ctx!.clearRect(0, 0, width, height);
      for (const s of stars) {
        ctx!.beginPath();
        ctx!.fillStyle = "rgba(255,255,255,0.7)";
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function frame(t: number) {
      ctx!.clearRect(0, 0, width, height);
      for (const s of stars) {
        const twinkle = 0.45 + 0.55 * Math.sin(t * s.speed + s.phase);
        ctx!.beginPath();
        ctx!.fillStyle = `rgba(255,255,255,${Math.max(0, twinkle).toFixed(3)})`;
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (t - lastShot > 2600 + Math.random() * 2600 && shooters.length < 2) {
        lastShot = t;
        const startX = Math.random() * width * 0.6 + width * 0.2;
        shooters.push({
          x: startX,
          y: Math.random() * height * 0.3,
          vx: -(2.6 + Math.random() * 1.6),
          vy: 1.6 + Math.random() * 1.2,
          life: 0,
          maxLife: 40 + Math.random() * 15,
        });
      }
      shooters = shooters.filter((sh) => sh.life < sh.maxLife);
      for (const sh of shooters) {
        sh.life += 1;
        sh.x += sh.vx;
        sh.y += sh.vy;
        const alpha = 1 - sh.life / sh.maxLife;
        const grad = ctx!.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 8, sh.y - sh.vy * 8);
        grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.4;
        ctx!.beginPath();
        ctx!.moveTo(sh.x, sh.y);
        ctx!.lineTo(sh.x - sh.vx * 8, sh.y - sh.vy * 8);
        ctx!.stroke();
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    if (reduceMotion) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(frame);
    }
    const onResize = () => {
      resize();
      if (reduceMotion) drawStatic();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
