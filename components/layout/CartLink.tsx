"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTransition } from "@/components/TransitionProvider";

const MESSAGES = [
  "你还没进行登录呢~",
  "你都这么着急了为什么不去登录呢?~",
  "哎哟喂~别搞~老实登录去!",
];

function randomMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

const petals = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 3,
  duration: 3 + Math.random() * 4,
  size: 8 + Math.random() * 10,
  xDrift: (Math.random() - 0.5) * 70,
}));

function FloatingPetals() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: "-10%",
            width: p.size,
            height: p.size,
            opacity: 0.3,
            animation: `petalFall ${p.duration}s ${p.delay}s linear infinite`,
            "--drift": `${p.xDrift}px`,
          } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full fill-pink-200">
            <path d="M12 2C8 2 4 6 4 10c0 4 3 8 8 12 5-4 8-8 8-12 0-4-4-8-8-8z" />
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes petalFall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.35; }
          80% { opacity: 0.25; }
          100% { transform: translateY(500px) translateX(var(--drift)) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ── Japanese-style background decorations ── */

function SeigaihaWave() {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: 72 }}>
      <svg viewBox="0 0 400 72" className="w-full h-full opacity-[0.12]" preserveAspectRatio="none">
        <defs>
          <pattern id="seigaiha" x="0" y="0" width="40" height="24" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="24" r="20" fill="none" stroke="#7c8eb4" strokeWidth="0.8" />
            <circle cx="0" cy="24" r="20" fill="none" stroke="#7c8eb4" strokeWidth="0.8" />
            <circle cx="40" cy="24" r="20" fill="none" stroke="#7c8eb4" strokeWidth="0.8" />
            <circle cx="20" cy="12" r="20" fill="none" stroke="#7c8eb4" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="400" height="72" fill="url(#seigaiha)" />
      </svg>
    </div>
  );
}

function BokehCircles() {
  const circles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    cx: 10 + Math.random() * 80,
    cy: 8 + Math.random() * 84,
    r: 12 + Math.random() * 28,
    opacity: 0.03 + Math.random() * 0.06,
    delay: Math.random() * 4,
    duration: 3 + Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        {circles.map((c) => (
          <circle key={c.id} cx={c.cx} cy={c.cy} r={c.r} fill="#c8b8d8" opacity={c.opacity}>
            <animate attributeName="opacity" values={`${c.opacity};${c.opacity * 1.8};${c.opacity}`} dur={`${c.duration}s`} begin={`${c.delay}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  );
}

function WindRibbon() {
  return (
    <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: 56 }}>
      <svg viewBox="0 0 400 56" className="w-full h-full opacity-[0.09]" preserveAspectRatio="none">
        <path d="M0 28 Q50 14 100 28 T200 28 T300 28 T400 20" fill="none" stroke="#b8a4c8" strokeWidth="1.5" />
        <path d="M0 36 Q50 22 100 36 T200 36 T300 36 T400 28" fill="none" stroke="#c4a8c0" strokeWidth="1" />
        <path d="M0 44 Q50 34 100 44 T200 44 T300 44 T400 38" fill="none" stroke="#b8a4c8" strokeWidth="0.7" />
      </svg>
    </div>
  );
}

function Fireflies() {
  const dots = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    y: 60 + Math.random() * 35,
    size: 1.5 + Math.random() * 2.5,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 3,
    drift: (Math.random() - 0.5) * 40,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {dots.map((d) => (
        <div
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            background: "radial-gradient(circle, #f0e0a0 0%, transparent 70%)",
            animation: `fireflyFloat ${d.duration}s ${d.delay}s ease-in-out infinite`,
            "--drift": `${d.drift}px`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes fireflyFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          30% { opacity: 0.8; }
          70% { opacity: 0.3; }
          100% { transform: translateY(-60px) translateX(var(--drift)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function CornerFlorals() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {/* Top-right corner floral */}
      <svg viewBox="0 0 120 120" className="absolute top-0 right-0 w-24 h-24 opacity-[0.07]">
        <path d="M120 0 Q90 0 85 15 Q80 30 95 25 Q110 20 120 0Z" fill="#8b6c9e" />
        <path d="M120 0 Q100 10 95 35 Q90 60 75 45 Q100 20 120 0Z" fill="#c4a8b0" />
        <path d="M120 0 Q105 0 100 20 Q95 40 110 30 Q120 15 120 0Z" fill="#9eb4c8" />
        <path d="M110 10 Q95 10 90 30 Q85 50 100 40 Q115 25 110 10Z" fill="none" stroke="#d4c0a8" strokeWidth="0.5" />
        <circle cx="105" cy="15" r="2" fill="#c8b8d8" opacity="0.5">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
      {/* Bottom-left corner floral */}
      <svg viewBox="0 0 120 120" className="absolute bottom-0 left-0 w-20 h-20 opacity-[0.06]">
        <path d="M0 120 Q30 120 35 105 Q40 90 25 95 Q10 100 0 120Z" fill="#8b6c9e" />
        <path d="M0 120 Q20 110 25 85 Q30 60 45 75 Q20 100 0 120Z" fill="#c4a8b0" />
        <path d="M0 120 Q20 110 15 90 Q10 70 20 80 Q30 90 0 120Z" fill="#b8c4d4" />
        <circle cx="15" cy="105" r="2.5" fill="#c8b8d8" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

/* ── Sparkles ── */

const sparkles = [
  { emoji: "✨", left: "8%", top: "15%", delay: "0s" },
  { emoji: "💫", left: "82%", top: "10%", delay: "0.3s" },
  { emoji: "⭐", left: "5%", top: "55%", delay: "0.6s" },
  { emoji: "🌸", left: "85%", top: "50%", delay: "0.9s" },
  { emoji: "💖", left: "12%", top: "75%", delay: "0.15s" },
  { emoji: "✨", left: "80%", top: "78%", delay: "0.45s" },
];

export default function CartLink() {
  const { data: session } = useSession();
  const router = useRouter();
  const { startLoading } = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(randomMessage);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showModal) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [showModal]);

  const handleClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      setMessage(randomMessage());
      setShowModal(true);
    } else {
      startLoading("前往购物车...");
      router.push("/cart");
    }
  };

  const goToLogin = () => {
    setVisible(false);
    setTimeout(() => { startLoading("前往登录..."); router.push("/login?callbackUrl=/cart"); }, 200);
  };

  const close = () => {
    setVisible(false);
    setTimeout(() => setShowModal(false), 300);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="relative p-2 text-gray-500 hover:text-sakura-500 transition-colors cursor-pointer"
        aria-label="购物车"
      >
        🛒
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className={`absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-[#1a1a2e]/60 to-rose-900/50 transition-opacity duration-300 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            onClick={close}
          />

          <div
            className={`relative rounded-3xl shadow-2xl p-0 max-w-sm w-full mx-4 text-center overflow-hidden transition-all duration-500 ${
              visible ? "scale-100 translate-y-0 opacity-100" : "scale-90 translate-y-8 opacity-0"
            }`}
            style={{
              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              background: "linear-gradient(170deg, #fefdfb 0%, #fdf7fa 30%, #f8f4fb 60%, #fdf9f5 100%)",
            }}
          >
            {/* Background decorative layers */}
            <BokehCircles />
            <WindRibbon />
            <CornerFlorals />
            <FloatingPetals />
            <Fireflies />
            <SeigaihaWave />

            <div className="h-1.5 bg-gradient-to-r from-indigo-300 via-rose-300 to-indigo-300" />

            <div className="p-8 relative z-10">
              {/* Character container */}
              <div className="relative inline-block mb-5">
                {/* Glow ring behind character */}
                <div
                  className="absolute w-24 h-24 bg-gradient-to-br from-indigo-200/40 via-rose-200/30 to-pink-200/40 rounded-full blur-2xl animate-pulse mx-auto"
                  style={{
                    animationDuration: "2.5s",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />

                {/* User's provided character SVG */}
                <div
                  className="relative"
                  style={{ animation: "charEntrance 0.7s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
                >
                  <img
                    src="/images/cute-character.svg"
                    alt=""
                    className="w-28 h-28 mx-auto drop-shadow-lg"
                    style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))" }}
                  />
                </div>

                {/* Floating sparkles */}
                {sparkles.map((s, i) => (
                  <span
                    key={i}
                    className="absolute text-sm pointer-events-none"
                    style={{
                      left: s.left,
                      top: s.top,
                      animation: `sparkleFloat 2s ${s.delay} ease-in-out infinite`,
                      opacity: 0,
                    }}
                  >
                    {s.emoji}
                  </span>
                ))}
              </div>

              {/* Message */}
              <p
                className="text-gray-700 text-base font-medium mb-7 leading-relaxed relative"
                style={{ animation: "fadeSlideUp 0.5s 0.2s ease-out both" }}
              >
                <span className="text-rose-400 mr-1">"</span>
                {message}
                <span className="text-rose-400 ml-1">"</span>
              </p>

              {/* Buttons */}
              <div
                className="flex gap-3 justify-center"
                style={{ animation: "fadeSlideUp 0.5s 0.35s ease-out both" }}
              >
                <button
                  onClick={close}
                  className="px-6 py-2.5 text-sm text-gray-400 border border-gray-200 rounded-xl hover:border-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-all duration-300"
                >
                  再看看
                </button>
                <button
                  onClick={goToLogin}
                  className="px-6 py-2.5 text-sm text-white bg-gradient-to-r from-indigo-400 to-rose-400 rounded-xl hover:from-indigo-500 hover:to-rose-500 transition-all duration-300 font-medium shadow-lg shadow-indigo-200 hover:shadow-rose-200 active:scale-95"
                >
                  去登录 ✦
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes charEntrance {
          0% { transform: scale(0.3) translateY(20px); opacity: 0; }
          60% { transform: scale(1.05) translateY(-2px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes sparkleFloat {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
          50% { opacity: 1; transform: translateY(-14px) scale(1.15); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
