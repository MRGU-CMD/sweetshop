"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function LogoutButton({ className, label }: { className?: string; label?: string }) {
  const [exiting, setExiting] = useState(false);

  const handleLogout = async () => {
    setExiting(true);
    await new Promise((r) => setTimeout(r, 500));
    await signOut({ redirectTo: "/" });
  };

  const sparkles = ["✨", "💫", "⭐", "💖", "🌟", "🌸", "🍡", "💕"];

  return (
    <>
      <button
        onClick={handleLogout}
        className={className || "text-xs text-gray-400 hover:text-sakura-500 transition-colors"}
      >
        {label || "退出"}
      </button>

      {exiting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
          {/* Backdrop — layered lighting */}
          <div className="absolute inset-0 backdrop-blur-md bg-gradient-to-br from-sakura-900/25 via-sakura-800/35 to-sakura-900/45" />

          {/* Light rays */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 right-1/4 w-[500px] h-[600px] bg-gradient-to-b from-white/[0.06] to-transparent -skew-x-12 rotate-12" />
            <div className="absolute -top-20 left-1/3 w-[400px] h-[500px] bg-gradient-to-b from-sakura-300/[0.05] to-transparent -skew-x-6 -rotate-6" />
            <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-gradient-to-t from-sakura-200/[0.04] to-transparent" />
          </div>

          {/* Soft glow orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-sakura-400/10 rounded-full blur-3xl" style={{ animation: "orbFloat 3s ease-in-out infinite" }} />
            <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-sakura-300/8 rounded-full blur-3xl" style={{ animation: "orbFloat 3s ease-in-out infinite 1.5s" }} />
            <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl" style={{ animation: "orbFloat 2.5s ease-in-out infinite 0.7s" }} />
          </div>

          {/* Floating background particles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="absolute text-lg"
                style={{
                  left: `${8 + i * 7.5}%`,
                  top: `${10 + (i * 17) % 85}%`,
                  animation: `floatUp ${2 + (i % 3) * 0.6}s ease-in-out infinite ${i * 0.18}s`,
                  opacity: 0,
                }}
              >
                {sparkles[i % sparkles.length]}
              </span>
            ))}
          </div>

          {/* Center card */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            {/* Glow halo behind character */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-48 h-48 rounded-full bg-sakura-300/20 blur-3xl pointer-events-none"
              style={{ animation: "haloPulse 1s ease-in-out infinite" }}
            />

            {/* SVG character with bounce */}
            <div
              style={{
                animation: "bounceSquish 0.6s ease-in-out infinite",
                transformOrigin: "bottom center",
              }}
            >
              <img
                src="/images/cute-character.svg"
                alt=""
                className="w-28 h-28 drop-shadow-xl"
                style={{ animation: "wiggle 0.8s ease-in-out infinite" }}
              />
            </div>

            {/* Ring of orbiting sparkles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] pointer-events-none">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className="absolute text-xs"
                  style={{
                    animation: `orbit 1.5s linear infinite ${i * 0.25}s`,
                    transform: `rotate(${i * 60}deg) translateY(-64px)`,
                  }}
                >
                  💫
                </span>
              ))}
            </div>

            <p
              className="text-sm text-sakura-700 font-medium tracking-widest select-none"
              style={{ animation: "textPulse 1s ease-in-out infinite" }}
            >
              正在退出...
            </p>
          </div>

          <style>{`
            @keyframes bounceSquish {
              0%, 100% { transform: translateY(0) scaleY(1) scaleX(1); }
              20%  { transform: translateY(-22px) scaleY(0.82) scaleX(1.12); }
              45%  { transform: translateY(0) scaleY(1.12) scaleX(0.9); }
              60%  { transform: translateY(-6px) scaleY(0.96) scaleX(1.04); }
              75%  { transform: translateY(0) scaleY(1) scaleX(1); }
            }
            @keyframes wiggle {
              0%, 100% { transform: rotate(0deg); }
              15%  { transform: rotate(3deg); }
              30%  { transform: rotate(-2deg); }
              45%  { transform: rotate(1deg); }
              60%  { transform: rotate(0deg); }
            }
            @keyframes haloPulse {
              0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
              50% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
            }
            @keyframes floatUp {
              0%   { opacity: 0; transform: translateY(0) scale(0.3); }
              20%  { opacity: 1; transform: translateY(-12px) scale(1); }
              60%  { opacity: 0.5; transform: translateY(-30px) scale(0.7); }
              100% { opacity: 0; transform: translateY(-48px) scale(0.2); }
            }
            @keyframes orbit {
              0%   { transform: rotate(0deg) translateY(-64px) rotate(0deg); }
              100% { transform: rotate(360deg) translateY(-64px) rotate(-360deg); }
            }
            @keyframes orbFloat {
              0%, 100% { transform: translate(0, 0) scale(1); }
              50% { transform: translate(10px, -16px) scale(1.15); }
            }
            @keyframes textPulse {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
