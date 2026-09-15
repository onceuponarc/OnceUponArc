"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; phase: number; speed: number; layer: number };
type Shooter = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number };

const LAYER_SPEED = [0.006, 0.014, 0.03]; // px/ms drift, back to front
const LAYER_COLOR = ["rgba(140,170,255,", "rgba(190,210,255,", "rgba(255,255,255,"];

/** The site's real background: three parallax star layers with slow drift and
 *  twinkle, a couple of soft blue nebula glows, a distant glowing planet, and
 *  occasional shooting stars — all in one canvas so it composites cheaply
 *  instead of stacking separate CSS layers. Sits behind every page. */
export function DeepSpaceField({ className }: { className?: string }) {
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
    const planet = { xPct: 0.86, yPct: 0.14, r: 0 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      planet.r = Math.max(60, Math.min(width, height) * 0.09);

      const density = width < 640 ? 4200 : 3200;
      const total = Math.round((width * height) / density);
      stars = Array.from({ length: total }, () => {
        const layer = Math.floor(Math.random() * 3);
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: (layer + 1) * 0.45 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.008,
          layer,
        };
      });
    }

    function drawNebula(t: number) {
      const drift = reduceMotion ? 0 : Math.sin(t * 0.00004) * 40;
      const g1 = ctx!.createRadialGradient(
        width * 0.15 + drift,
        height * 0.75,
        0,
        width * 0.15 + drift,
        height * 0.75,
        width * 0.5,
      );
      g1.addColorStop(0, "rgba(59,130,246,0.10)");
      g1.addColorStop(1, "rgba(59,130,246,0)");
      ctx!.fillStyle = g1;
      ctx!.fillRect(0, 0, width, height);

      const g2 = ctx!.createRadialGradient(
        width * 0.9 - drift,
        height * 0.9,
        0,
        width * 0.9 - drift,
        height * 0.9,
        width * 0.45,
      );
      g2.addColorStop(0, "rgba(29,78,216,0.14)");
      g2.addColorStop(1, "rgba(29,78,216,0)");
      ctx!.fillStyle = g2;
      ctx!.fillRect(0, 0, width, height);
    }

    function drawPlanet(t: number) {
      const cx = width * planet.xPct;
      const cy = height * planet.yPct;
      const pulse = reduceMotion ? 1 : 1 + 0.03 * Math.sin(t * 0.0006);
      const r = planet.r * pulse;

      const glow = ctx!.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.4);
      glow.addColorStop(0, "rgba(96,165,250,0.35)");
      glow.addColorStop(1, "rgba(96,165,250,0)");
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.arc(cx, cy, r * 2.4, 0, Math.PI * 2);
      ctx!.fill();

      const body = ctx!.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      body.addColorStop(0, "#dbeafe");
      body.addColorStop(0.5, "#60a5fa");
      body.addColorStop(1, "#1e3a8a");
      ctx!.fillStyle = body;
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.strokeStyle = "rgba(191,219,254,0.35)";
      ctx!.lineWidth = Math.max(2, r * 0.06);
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, r * 1.7, r * 0.32, -0.35, 0, Math.PI * 2);
      ctx!.stroke();
    }

    function drawStatic() {
      ctx!.clearRect(0, 0, width, height);
      drawNebula(0);
      drawPlanet(0);
      for (const s of stars) {
        ctx!.beginPath();
        ctx!.fillStyle = `${LAYER_COLOR[s.layer]}0.75)`;
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function frame(t: number) {
      ctx!.clearRect(0, 0, width, height);
      drawNebula(t);
      drawPlanet(t);

      for (const s of stars) {
        s.x -= LAYER_SPEED[s.layer];
        if (s.x < -2) s.x = width + 2;
        const twinkle = 0.4 + 0.6 * Math.sin(t * s.speed + s.phase);
        ctx!.beginPath();
        ctx!.fillStyle = `${LAYER_COLOR[s.layer]}${Math.max(0, twinkle).toFixed(3)})`;
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (t - lastShot > 2200 + Math.random() * 2400 && shooters.length < 2) {
        lastShot = t;
        shooters.push({
          x: Math.random() * width * 0.6 + width * 0.2,
          y: Math.random() * height * 0.25,
          vx: -(3 + Math.random() * 2),
          vy: 1.8 + Math.random() * 1.4,
          life: 0,
          maxLife: 36 + Math.random() * 14,
        });
      }
      shooters = shooters.filter((sh) => sh.life < sh.maxLife);
      for (const sh of shooters) {
        sh.life += 1;
        sh.x += sh.vx;
        sh.y += sh.vy;
        const alpha = 1 - sh.life / sh.maxLife;
        const grad = ctx!.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 9, sh.y - sh.vy * 9);
        grad.addColorStop(0, `rgba(219,234,254,${alpha})`);
        grad.addColorStop(1, "rgba(219,234,254,0)");
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.6;
        ctx!.beginPath();
        ctx!.moveTo(sh.x, sh.y);
        ctx!.lineTo(sh.x - sh.vx * 9, sh.y - sh.vy * 9);
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
    // Real apps stop animating when backgrounded — pausing the loop here
    // saves battery/CPU instead of drawing frames nobody can see.
    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else if (!reduceMotion && !raf) {
        raf = requestAnimationFrame(frame);
      }
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
