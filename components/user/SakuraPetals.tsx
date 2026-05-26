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
  type: "petal" | "flower";
  scale: number;
  depth: number; // 0=far, 1=near
  blur: number;
}

function hsl(h: number, s: number, l: number, a: number = 1): string {
  return `hsla(${h},${s}%,${l}%,${a})`;
}

// Draw a single detailed sakura petal with veins
function drawPetal(
  ctx: CanvasRenderingContext2D,
  size: number,
  hue: number,
  sat: number,
  light: number,
  alpha: number
) {
  const s = size;
  const w = s * 0.5;

  // Main petal gradient — base white/pink to deeper pink edge
  const bodyGrad = ctx.createLinearGradient(0, -s, 0, s * 0.15);
  bodyGrad.addColorStop(0, hsl(hue, sat - 8, light + 22, alpha));
  bodyGrad.addColorStop(0.25, hsl(hue, sat, light + 12, alpha * 0.95));
  bodyGrad.addColorStop(0.55, hsl(hue, sat + 5, light + 3, alpha * 0.85));
  bodyGrad.addColorStop(0.8, hsl(hue, sat + 12, light - 5, alpha * 0.65));
  bodyGrad.addColorStop(1, hsl(hue, sat + 18, light - 12, alpha * 0.3));

  // Elegant sakura petal shape with deep notch
  ctx.beginPath();
  // Start at tip (top)
  ctx.moveTo(0, -s);
  // Right side curve
  ctx.bezierCurveTo(
    w * 0.75, -s * 0.85,
    w * 1.15, -s * 0.45,
    w * 0.85, -s * 0.05
  );
  // Right bottom
  ctx.bezierCurveTo(
    w * 0.65, s * 0.15,
    w * 0.3, s * 0.3,
    0, s * 0.18
  );
  // Left bottom
  ctx.bezierCurveTo(
    -w * 0.3, s * 0.3,
    -w * 0.65, s * 0.15,
    -w * 0.85, -s * 0.05
  );
  // Left side curve
  ctx.bezierCurveTo(
    -w * 1.15, -s * 0.45,
    -w * 0.75, -s * 0.85,
    0, -s
  );
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Delicate edge highlight
  ctx.strokeStyle = hsl(hue, sat + 15, light - 5, alpha * 0.2);
  ctx.lineWidth = 0.35;
  ctx.stroke();

  // Central vein — prominent
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.82);
  ctx.quadraticCurveTo(s * 0.02, -s * 0.1, 0, s * 0.14);
  ctx.strokeStyle = hsl(hue, sat + 20, light + 8, alpha * 0.35);
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Side veins — 3 pairs
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      const ty = -s * 0.5 + i * s * 0.3;
      const tx = side * w * (0.15 + i * 0.15);
      const cy = ty - s * 0.04;
      ctx.beginPath();
      ctx.moveTo(0, ty);
      ctx.quadraticCurveTo(tx * 0.5, cy, tx, ty - s * 0.06);
      ctx.strokeStyle = hsl(hue, sat + 12, light + 10, alpha * 0.22);
      ctx.lineWidth = 0.25;
      ctx.stroke();
    }
  }

  // Subtle vein branching (secondary veins)
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 2; i++) {
      const ty = -s * 0.35 + i * s * 0.4;
      const tx = side * w * 0.12;
      ctx.beginPath();
      ctx.moveTo(tx * 0.3, ty);
      ctx.quadraticCurveTo(tx * 1.2, ty - s * 0.02, tx * 2, ty - s * 0.04);
      ctx.strokeStyle = hsl(hue, sat + 5, light + 15, alpha * 0.15);
      ctx.lineWidth = 0.15;
      ctx.stroke();
    }
  }

  // Deep notch at tip
  ctx.beginPath();
  ctx.moveTo(-w * 0.2, -s * 0.55);
  ctx.bezierCurveTo(-w * 0.05, -s * 0.66, w * 0.05, -s * 0.66, w * 0.2, -s * 0.55);
  ctx.strokeStyle = hsl(hue, sat + 25, light - 8, alpha * 0.3);
  ctx.lineWidth = 0.6;
  ctx.stroke();
}

// Draw a complete sakura flower with 5 petals + golden center
function drawFlower(
  ctx: CanvasRenderingContext2D,
  size: number,
  hue: number,
  sat: number,
  light: number,
  alpha: number
) {
  const petalCount = 5;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2 - Math.PI / 2;
    const petalSize = size * 0.52;
    const dist = petalSize * 0.22;

    ctx.save();
    ctx.translate(Math.cos(angle) * dist, Math.sin(angle) * dist);
    ctx.rotate(angle);
    drawPetal(ctx, petalSize, hue, sat, light, alpha);
    ctx.restore();
  }

  // Golden stamen cluster
  const centerR = size * 0.15;
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, centerR * 1.5);
  grad.addColorStop(0, hsl(42, 90, 72, alpha * 0.95));
  grad.addColorStop(0.4, hsl(38, 75, 55, alpha * 0.8));
  grad.addColorStop(0.8, hsl(30, 60, 40, alpha * 0.4));
  grad.addColorStop(1, hsl(hue, sat + 15, light, 0));
  ctx.beginPath();
  ctx.arc(0, 0, centerR * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Golden stamen filaments
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r1 = centerR * 0.5;
    const r2 = centerR * 1.1 + Math.random() * centerR * 0.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
    ctx.lineTo(Math.cos(a + 0.15) * r2, Math.sin(a + 0.15) * r2);
    ctx.strokeStyle = hsl(40 + Math.random() * 15, 80, 55, alpha * 0.7);
    ctx.lineWidth = 0.4;
    ctx.stroke();
  }

  // Stamen tips (anthers)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = centerR * 1.1 + (i % 3) * centerR * 0.25;
    ctx.beginPath();
    ctx.arc(Math.cos(a + 0.15) * r, Math.sin(a + 0.15) * r, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = hsl(45, 90, 60, alpha * 0.85);
    ctx.fill();
  }
}

export default function SakuraPetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, vx: 0, vy: 0 });
  const prevMouse = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);

  const createPetal = useCallback((canvasW: number, canvasH: number, yStart?: number): Petal => {
    const hue = 340 + Math.random() * 22;
    const sat = 35 + Math.random() * 45;
    const light = 70 + Math.random() * 20;
    const typeRand = Math.random();
    const type = typeRand < 0.08 ? "flower" : "petal";

    // Depth layers: 0=far background, 1=near foreground
    const depth = Math.random();
    const depthFactor = 0.4 + depth * 0.6;

    const baseSize = type === "flower"
      ? 14 + Math.random() * 16
      : 7 + Math.random() * 20;

    return {
      x: Math.random() * canvasW,
      y: yStart ?? Math.random() * canvasH * 1.3 - canvasH * 0.3,
      size: baseSize * depthFactor,
      speedY: (0.15 + depth * 0.55) * depthFactor,
      speedX: (-0.12 + Math.random() * 0.24) * depthFactor,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.012 * depthFactor,
      opacity: (0.35 + depth * 0.55),
      hue, sat, light,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: (0.006 + Math.random() * 0.014) * depthFactor,
      swayAmp: (0.3 + depth * 1.0),
      type,
      scale: 0.85 + Math.random() * 0.3,
      depth,
      blur: (1 - depth) * 3.5,
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

    // More petals for richer effect
    const count = 65;
    petalsRef.current = Array.from({ length: count }, () =>
      createPetal(canvas.width, canvas.height)
    );

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mvx = mouseRef.current.vx;
      const mvy = mouseRef.current.vy;

      // Sort by depth for proper layering
      const sorted = [...petalsRef.current].sort((a, b) => a.depth - b.depth);

      for (const p of sorted) {
        // Mouse interaction — stronger on foreground petals
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const interactionRange = 80 + p.depth * 100;

        if (dist < interactionRange) {
          const force = (interactionRange - dist) / interactionRange;
          const swirlAngle = Math.atan2(dy, dx) + Math.PI / 2;
          const strength = force * 1.5 * p.depth;
          p.x += Math.cos(swirlAngle) * strength + mvx * force * 0.2 * p.depth;
          p.y += Math.sin(swirlAngle) * strength + mvy * force * 0.2 * p.depth;
          p.rotationSpeed += force * 0.02 * p.depth * (Math.random() > 0.5 ? 1 : -1);
        }

        // Natural drift
        p.sway += p.swaySpeed;
        p.y += p.speedY + Math.sin(p.sway * 0.5) * 0.15;
        p.x += p.speedX + Math.sin(p.sway) * p.swayAmp * 0.5;
        p.rotation += p.rotationSpeed;
        p.rotationSpeed *= 0.9997;
        p.scale = 0.85 + Math.sin(p.sway * 0.4 + p.depth * 3) * 0.15;

        // Wrap
        if (p.y > canvas.height + 50) {
          Object.assign(p, createPetal(canvas.width, canvas.height, -50));
        }
        if (p.x > canvas.width + 50) p.x = -50;
        if (p.x < -50) p.x = canvas.width + 50;

        // Draw with depth effects
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        // Parallax-ish scale variation
        const depthScale = 0.6 + p.depth * 0.6;
        ctx.scale(p.scale * depthScale, p.scale * depthScale);

        // Apply blur for background petals
        if (p.blur > 0.3) {
          ctx.filter = `blur(${p.blur}px)`;
        }
        ctx.globalAlpha = p.opacity;

        if (p.type === "petal") {
          drawPetal(ctx, p.size, p.hue, p.sat, p.light, 1);
        } else {
          drawFlower(ctx, p.size, p.hue, p.sat, p.light, 1);
        }

        ctx.filter = "none";
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    const onMouse = (e: MouseEvent) => {
      const px = prevMouse.current.x;
      const py = prevMouse.current.y;
      mouseRef.current = { x: e.clientX, y: e.clientY, vx: e.clientX - px, vy: e.clientY - py };
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
