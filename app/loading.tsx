export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf9f0]">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning sakura ring */}
        <div className="relative w-16 h-16">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="absolute top-0 left-1/2 -translate-x-1/2 text-xs"
              style={{
                transform: `rotate(${i * 60}deg) translateY(-6px)`,
                transformOrigin: "center 32px",
                animation: `spinSakura 1.5s linear infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              🌸
            </span>
          ))}
        </div>
        <p className="text-sm text-[#b8942f] animate-pulse">加载中...</p>
      </div>
      <style>{`
        @keyframes spinSakura {
          0% { opacity: 1; }
          50% { opacity: 0.2; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
