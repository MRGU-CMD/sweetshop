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
  color: string;
  sway: number;
  swaySpeed: number;
}

const COLORS = [
  "rgba(255, 183, 197, 0.8)",
  "rgba(255, 154, 172, 0.7)",
  "rgba(255, 138, 160, 0.6)",
  "rgba(255, 200, 210, 0.75)",
  "rgba(255, 170, 185, 0.65)",
];

export default function SakuraPetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);

  const drawPetal = useCallback((ctx: CanvasRenderingContext2D, p: Petal) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;

    // Draw sakura petal shape
    ctx.beginPath();
    const s = p.size;
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.5, -s * 0.8, s * 0.8, -s * 0.3, s * 0.3, 0);
    ctx.bezierCurveTo(s * 0.8, s * 0.2, s * 0.5, s * 0.7, 0, s * 0.3);
    ctx.bezierCurveTo(-s * 0.5, s * 0.7, -s * 0.8, s * 0.2, -s * 0.3, 0);
    ctx.bezierCurveTo(-s * 0.8, -s * 0.3, -s * 0.5, -s * 0.8, 0, -s);
    ctx.fillStyle = p.color;
    ctx.fill();

    // Small notch at top
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.3);
    ctx.lineTo(-s * 0.08, -s * 0.6);
    ctx.lineTo(s * 0.08, -s * 0.6);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fill();

    ctx.restore();
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

    // Init petals
    const count = 45;
    petalsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 6 + Math.random() * 14,
      speedY: 0.3 + Math.random() * 0.8,
      speedX: -0.2 + Math.random() * 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      opacity: 0.3 + Math.random() * 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      sway: 0,
      swaySpeed: 0.01 + Math.random() * 0.02,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of petalsRef.current) {
        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 2;
          p.y += (dy / dist) * force * 2;
          p.rotationSpeed += force * 0.03;
        }

        // Natural movement
        p.sway += p.swaySpeed;
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.sway) * 0.3;
        p.rotation += p.rotationSpeed;
        p.rotationSpeed *= 0.999;

        // Wrap around
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.x < -20) p.x = canvas.width + 20;

        drawPetal(ctx, p);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", onMouse);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [drawPetal]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
