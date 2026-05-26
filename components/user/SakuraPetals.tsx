"use client";

import { useEffect, useRef } from "react";

interface Petal {
  x: number;
  y: number;
  img: HTMLCanvasElement;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  sway: number;
  swaySpeed: number;
  swayAmp: number;
  scale: number;
  depth: number;
}

// ── Pre-render a petal to offscreen canvas ──
function renderPetalTexture(size: number, hue: number, sat: number, light: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  const s = size * 2 + 4;
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d")!;
  const cx = s / 2;
  const cy = s / 2;
  const sz = size;
  const w = sz * 0.5;

  // ── body gradient ──
  const bodyGrad = ctx.createLinearGradient(cx, cy - sz, cx, cy + sz * 0.15);
  bodyGrad.addColorStop(0, `hsla(${hue},${sat - 5}%,${light + 24}%,0.92)`);
  bodyGrad.addColorStop(0.2, `hsla(${hue},${sat}%,${light + 14}%,0.88)`);
  bodyGrad.addColorStop(0.5, `hsla(${hue},${sat + 8}%,${light + 2}%,0.78)`);
  bodyGrad.addColorStop(0.78, `hsla(${hue},${sat + 15}%,${light - 10}%,0.55)`);
  bodyGrad.addColorStop(1, `hsla(${hue},${sat + 20}%,${light - 18}%,0.15)`);

  // ── petal shape ──
  ctx.beginPath();
  ctx.moveTo(cx, cy - sz);
  ctx.bezierCurveTo(cx + w * 0.8, cy - sz * 0.82, cx + w * 1.2, cy - sz * 0.38, cx + w * 0.88, cy - sz * 0.02);
  ctx.bezierCurveTo(cx + w * 0.7, cy + sz * 0.14, cx + w * 0.32, cy + sz * 0.28, cx, cy + sz * 0.16);
  ctx.bezierCurveTo(cx - w * 0.32, cy + sz * 0.28, cx - w * 0.7, cy + sz * 0.14, cx - w * 0.88, cy - sz * 0.02);
  ctx.bezierCurveTo(cx - w * 1.2, cy - sz * 0.38, cx - w * 0.8, cy - sz * 0.82, cx, cy - sz);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // ── edge ──
  ctx.strokeStyle = `hsla(${hue},${sat + 18}%,${light - 8}%,0.18)`;
  ctx.lineWidth = 0.4;
  ctx.stroke();

  // ── central vein ──
  ctx.beginPath();
  ctx.moveTo(cx, cy - sz * 0.85);
  ctx.quadraticCurveTo(cx + sz * 0.02, cy - sz * 0.08, cx, cy + sz * 0.12);
  ctx.strokeStyle = `hsla(${hue},${sat + 22}%,${light + 5}%,0.38)`;
  ctx.lineWidth = 0.6;
  ctx.stroke();

  // ── side veins ──
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      const ty = cy - sz * 0.48 + i * sz * 0.28;
      const tx = cx + side * w * (0.18 + i * 0.14);
      ctx.beginPath();
      ctx.moveTo(cx, ty);
      ctx.quadraticCurveTo(tx * 0.5 + cx * 0.5, ty - sz * 0.04, tx, ty - sz * 0.07);
      ctx.strokeStyle = `hsla(${hue},${sat + 10}%,${light + 12}%,0.22)`;
      ctx.lineWidth = 0.28;
      ctx.stroke();
    }
  }

  // ── fine tertiary veins ──
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 2; i++) {
      const ty = cy - sz * 0.3 + i * sz * 0.38;
      const startX = cx + side * w * 0.08;
      const endX = cx + side * w * 0.25;
      ctx.beginPath();
      ctx.moveTo(startX, ty);
      ctx.quadraticCurveTo((startX + endX) / 2, ty - sz * 0.02, endX, ty - sz * 0.03);
      ctx.strokeStyle = `hsla(${hue},${sat + 5}%,${light + 16}%,0.14)`;
      ctx.lineWidth = 0.16;
      ctx.stroke();
    }
  }

  // ── notch ──
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.18, cy - sz * 0.58);
  ctx.bezierCurveTo(cx - w * 0.04, cy - sz * 0.7, cx + w * 0.04, cy - sz * 0.7, cx + w * 0.18, cy - sz * 0.58);
  ctx.strokeStyle = `hsla(${hue},${sat + 25}%,${light - 10}%,0.32)`;
  ctx.lineWidth = 0.7;
  ctx.stroke();

  return c;
}

// ── Pre-render a whole flower ──
function renderFlowerTexture(size: number, hue: number, sat: number, light: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  const pad = size * 0.8;
  const s = size * 2 + pad * 2;
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d")!;
  const cx = s / 2;
  const cy = s / 2;

  const petalCount = 5;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2 - Math.PI / 2;
    const petalSize = size * 0.52;
    const dist = petalSize * 0.24;

    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist;

    const petalCanvas = renderPetalTexture(petalSize, hue, sat, light);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    ctx.drawImage(petalCanvas, -petalCanvas.width / 2, -petalCanvas.height / 2);
    ctx.restore();
  }

  // ── golden center ──
  const cr = size * 0.18;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr * 1.6);
  g.addColorStop(0, `hsla(42,90%,74%,0.95)`);
  g.addColorStop(0.35, `hsla(38,78%,58%,0.82)`);
  g.addColorStop(0.7, `hsla(32,60%,42%,0.45)`);
  g.addColorStop(1, `hsla(${hue},${sat}%,${light}%,0)`);
  ctx.beginPath();
  ctx.arc(cx, cy, cr * 1.6, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();

  // ── stamens ──
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r1 = cr * 0.45;
    const r2 = cr * 1.15 + (i % 3) * cr * 0.2;
    const sx = cx + Math.cos(a) * r1;
    const sy = cy + Math.sin(a) * r1;
    const ex = cx + Math.cos(a + 0.12) * r2;
    const ey = cy + Math.sin(a + 0.12) * r2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = `hsla(${40 + (i % 3) * 15},80%,50%,0.72)`;
    ctx.lineWidth = 0.45;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ex, ey, 0.9, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(44,92%,58%,0.88)`;
    ctx.fill();
  }

  return c;
}

// ── Pre-compute a palette of petal textures ──
function buildTextureSet(): { petals: HTMLCanvasElement[]; flowers: HTMLCanvasElement[] } {
  const petals: HTMLCanvasElement[] = [];
  const flowers: HTMLCanvasElement[] = [];

  for (let i = 0; i < 8; i++) {
    const hue = 340 + i * 3;
    const sat = 40 + i * 5;
    const light = 72 + i * 2;
    petals.push(renderPetalTexture(28, hue, sat, light));
    petals.push(renderPetalTexture(20, hue + 2, sat - 5, light + 5));
    petals.push(renderPetalTexture(14, hue - 2, sat + 5, light));
    flowers.push(renderFlowerTexture(22 + i * 2, hue, sat, light));
  }
  return { petals, flowers };
}

// Only build textures once (module-level lazy init)
let textureCache: { petals: HTMLCanvasElement[]; flowers: HTMLCanvasElement[] } | null = null;
function getTextures() {
  if (!textureCache) textureCache = buildTextureSet();
  return textureCache;
}

export default function SakuraPetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, vx: 0, vy: 0 });
  const prevMouse = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const textures = getTextures();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const createPetal = (y?: number): Petal => {
      const depth = Math.random();
      const df = 0.4 + depth * 0.6;
      const isFlower = Math.random() < 0.07;
      const pool = isFlower ? textures.flowers : textures.petals;
      const img = pool[Math.floor(Math.random() * pool.length)];
      return {
        x: Math.random() * canvas.width,
        y: y ?? Math.random() * canvas.height * 1.3 - canvas.height * 0.3,
        img,
        size: isFlower ? 20 + Math.random() * 18 : 10 + Math.random() * 22,
        speedY: (0.18 + depth * 0.5) * df,
        speedX: (-0.1 + Math.random() * 0.2) * df,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01 * df,
        opacity: 0.4 + depth * 0.52,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: (0.005 + Math.random() * 0.012) * df,
        swayAmp: 0.25 + depth * 0.9,
        scale: 0.85 + Math.random() * 0.3,
        depth,
      };
    };

    petalsRef.current = Array.from({ length: 60 }, () => createPetal());

    // Separate into bg/fg layers to avoid sorting
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mvx = mouseRef.current.vx;
      const mvy = mouseRef.current.vy;

      // ── Render background layer first ──
      for (const p of petalsRef.current) {
        if (p.depth >= 0.5) continue; // skip foreground
        updateAndDraw(p, ctx, mx, my, mvx, mvy, canvas.width, canvas.height, createPetal);
      }
      // ── Render foreground layer on top ──
      for (const p of petalsRef.current) {
        if (p.depth < 0.5) continue;
        updateAndDraw(p, ctx, mx, my, mvx, mvy, canvas.width, canvas.height, createPetal);
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}

// ── per-frame update + draw (extracted for reuse in bg/fg passes) ──
function updateAndDraw(
  p: Petal,
  ctx: CanvasRenderingContext2D,
  mx: number, my: number, mvx: number, mvy: number,
  cw: number, ch: number,
  createPetal: (y?: number) => Petal,
) {
  // Mouse swirl
  const dx = p.x - mx;
  const dy = p.y - my;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const range = 75 + p.depth * 110;
  if (dist < range) {
    const f = (range - dist) / range;
    const a = Math.atan2(dy, dx) + Math.PI / 2;
    const s = f * 1.4 * p.depth;
    p.x += Math.cos(a) * s + mvx * f * 0.2 * p.depth;
    p.y += Math.sin(a) * s + mvy * f * 0.2 * p.depth;
    p.rotationSpeed += f * 0.018 * p.depth;
  }

  // Drift
  p.sway += p.swaySpeed;
  p.y += p.speedY + Math.sin(p.sway * 0.45) * 0.12;
  p.x += p.speedX + Math.sin(p.sway) * p.swayAmp * 0.45;
  p.rotation += p.rotationSpeed;
  p.rotationSpeed *= 0.9998;
  p.scale = 0.85 + Math.sin(p.sway * 0.35 + p.depth * 2.5) * 0.15;

  if (p.y > ch + 50) Object.assign(p, createPetal(-50));
  if (p.x > cw + 50) p.x = -50;
  if (p.x < -50) p.x = cw + 50;

  // Draw
  const ds = (0.55 + p.depth * 0.55) * p.scale;
  const dw = p.img.width * ds;
  const dh = p.img.height * ds;

  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.drawImage(p.img, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}
