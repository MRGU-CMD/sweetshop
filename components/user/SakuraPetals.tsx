"use client";

import { useEffect, useRef, useCallback } from "react";

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  hue: number;
  sat: number;
  light: number;
  sway: number;
  swaySpeed: number;
  swayAmp: number;
  type: "petal" | "flower" | "spark";
  scale: number;
}

function hsl(h: number, s: number, l: number, a: number = 1): string {
  return `hsla(${h},${s}%,${l}%,${a})`;
}

function drawVeinedPetal(
  ctx: CanvasRenderingContext2D,
  size: number,
  hue: number,
  sat: number,
  light: number
) {
  const s = size;
  const w = s * 0.55;

  // Main petal body with gradient
  const grad = ctx.createLinearGradient(0, -s, 0, s * 0.4);
  grad.addColorStop(0, hsl(hue, sat - 5, light + 20, 0.85));
  grad.addColorStop(0.3, hsl(hue, sat, light + 8, 0.8));
  grad.addColorStop(0.7, hsl(hue, sat + 5, light, 0.7));
  grad.addColorStop(1, hsl(hue, sat + 10, light - 5, 0.5));

  ctx.beginPath();
  // Petal outline — realistic sakura shape
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(w * 0.6, -s * 0.85, w * 1.05, -s * 0.4, w * 0.7, s * 0.05);
  ctx.bezierCurveTo(w * 0.5, s * 0.25, w * 0.2, s * 0.35, 0, s * 0.2);
  ctx.bezierCurveTo(-w * 0.2, s * 0.35, -w * 0.5, s * 0.25, -w * 0.7, s * 0.05);
  ctx.bezierCurveTo(-w * 1.05, -s * 0.4, -w * 0.6, -s * 0.85, 0, -s);
  ctx.fillStyle = grad;
  ctx.fill();

  // Subtle outline
  ctx.strokeStyle = hsl(hue, sat + 15, light - 10, 0.15);
  ctx.lineWidth = 0.4;
  ctx.stroke();

  // Center vein
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.75);
  ctx.quadraticCurveTo(0, -s * 0.1, 0, s * 0.15);
  ctx.strokeStyle = hsl(hue, sat + 10, light + 5, 0.25);
  ctx.lineWidth = 0.3;
  ctx.stroke();

  // Side veins
  for (let i = -1; i <= 1; i += 2) {
    for (let t = 0.25; t <= 0.7; t += 0.22) {
      const vy = -s * 0.75 + s * t;
      const vx = i * w * 0.25 * t;
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.quadraticCurveTo(vx * 0.5, vy - s * 0.05, vx, vy - s * 0.08);
      ctx.strokeStyle = hsl(hue, sat + 5, light + 10, 0.18);
      ctx.lineWidth = 0.2;
      ctx.stroke();
    }
  }

  // Notch at tip
  ctx.beginPath();
  ctx.moveTo(-w * 0.12, -s * 0.65);
  ctx.quadraticCurveTo(0, -s * 0.75, w * 0.12, -s * 0.65);
  ctx.strokeStyle = hsl(hue, sat + 20, light - 5, 0.2);
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

function drawFlower(
  ctx: CanvasRenderingContext2D,
  size: number,
  hue: number,
  sat: number,
  light: number
) {
  // Draw 5 petals arranged in a circle
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const petalSize = size * 0.55;
    const cx = Math.cos(angle) * petalSize * 0.35;
    const cy = Math.sin(angle) * petalSize * 0.35 - petalSize * 0.15;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    drawVeinedPetal(ctx, petalSize, hue, sat, light);
    ctx.restore();
  }

  // Center stamens
  const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.2);
  centerGrad.addColorStop(0, hsl(45, 60, 70, 0.9));
  centerGrad.addColorStop(0.5, hsl(hue, sat + 30, light - 10, 0.7));
  centerGrad.addColorStop(1, hsl(hue, sat + 20, light, 0));

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = centerGrad;
  ctx.fill();

  // Tiny stamen dots
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = size * 0.1;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 0.6, 0, Math.PI * 2);
    ctx.fillStyle = hsl(45, 80, 55, 0.8);
    ctx.fill();
  }
}

export default function SakuraPetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, vx: 0, vy: 0 });
  const animRef = useRef<number>(0);
  const prevMouse = useRef({ x: -9999, y: -9999 });

  const createPetal = useCallback((canvasW: number, canvasH: number, yOffset: number = 0): Petal => {
    const hue = 340 + Math.random() * 25; // pink range
    const sat = 40 + Math.random() * 40;
    const light = 72 + Math.random() * 18;
    const typeRand = Math.random();
    const type = typeRand < 0.08 ? "flower" : typeRand < 0.18 ? "spark" : "petal";
    const baseSize = type === "flower" ? 18 + Math.random() * 14 : type === "spark" ? 2 + Math.random() * 3 : 10 + Math.random() * 18;
    return {
      x: Math.random() * canvasW,
      y: yOffset !== 0 ? yOffset : Math.random() * canvasH * 1.2 - canvasH * 0.2,
      size: baseSize,
      speedY: 0.2 + Math.random() * 0.55,
      speedX: -0.15 + Math.random() * 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.015,
      opacity: 0.55 + Math.random() * 0.4,
      hue, sat, light,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.008 + Math.random() * 0.018,
      swayAmp: 0.3 + Math.random() * 0.7,
      type,
      scale: 0.85 + Math.random() * 0.3,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = 50;
    petalsRef.current = Array.from({ length: count }, () => createPetal(canvas.width, canvas.height));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mvx = mouseRef.current.vx;
      const mvy = mouseRef.current.vy;

      for (const p of petalsRef.current) {
        // Mouse interaction — gentle swirl
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          const angle = Math.atan2(dy, dx);
          const swirlAngle = angle + Math.PI / 2;
          p.x += Math.cos(swirlAngle) * force * 1.2 + mvx * force * 0.3;
          p.y += Math.sin(swirlAngle) * force * 1.2 + mvy * force * 0.3;
          p.rotationSpeed += force * 0.025 * (Math.random() > 0.5 ? 1 : -1);
        }

        // Natural drifting
        p.sway += p.swaySpeed;
        p.y += p.speedY * (0.8 + Math.sin(p.sway * 0.7) * 0.2);
        p.x += p.speedX + Math.sin(p.sway) * p.swayAmp;
        p.rotation += p.rotationSpeed;
        p.rotationSpeed *= 0.9995;
        p.scale = 0.85 + Math.sin(p.sway * 0.5 + p.y * 0.001) * 0.15;

        // Wrap
        if (p.y > canvas.height + 40) {
          Object.assign(p, createPetal(canvas.width, canvas.height, -40));
        }
        if (p.x > canvas.width + 40) p.x = -40;
        if (p.x < -40) p.x = canvas.width + 40;

        // Draw
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(p.scale, p.scale);
        ctx.globalAlpha = p.opacity;

        if (p.type === "petal") {
          drawVeinedPetal(ctx, p.size, p.hue, p.sat, p.light);
        } else if (p.type === "flower") {
          drawFlower(ctx, p.size, p.hue, p.sat, p.light);
        } else {
          // Spark/light particle
          const sparkGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
          sparkGrad.addColorStop(0, hsl(p.hue, p.sat - 10, p.light + 25, 0.9));
          sparkGrad.addColorStop(0.4, hsl(p.hue, p.sat, p.light + 15, 0.5));
          sparkGrad.addColorStop(1, hsl(p.hue, p.sat, p.light, 0));
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = sparkGrad;
          ctx.fill();
        }

        ctx.restore();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    const onMouse = (e: MouseEvent) => {
      const px = prevMouse.current.x;
      const py = prevMouse.current.y;
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        vx: e.clientX - px,
        vy: e.clientY - py,
      };
      prevMouse.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", onMouse);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [createPetal]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
