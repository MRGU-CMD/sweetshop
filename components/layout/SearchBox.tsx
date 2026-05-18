"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const hotSearches = [
    "鬼灭之刃 炭治郎手办",
    "间谍过家家 阿尼亚",
    "初音未来 十周年",
    "咒术回战 五条悟",
    "樱花和风羽织",
  ];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (q: string) => {
    setShowDropdown(false);
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center bg-sakura-50 rounded-xl px-4 py-2.5">
        <span className="text-gray-400 mr-2">🔍</span>
        <input
          type="text"
          placeholder="搜索你喜欢的动漫好物..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch(query);
          }}
          className="bg-transparent flex-1 outline-none text-sm text-gray-700 placeholder-gray-300"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-50 overflow-hidden z-50">
          {query ? (
            <>
              <div className="px-4 py-2 text-xs text-gray-300">搜索建议</div>
              <div
                onClick={() => handleSearch(query)}
                className="px-4 py-2.5 text-sm text-gray-600 hover:bg-sakura-50 cursor-pointer flex items-center gap-2"
              >
                🔍 搜索 &quot;{query}&quot;
              </div>
            </>
          ) : (
            <>
              <div className="px-4 py-2 text-xs text-gray-300">🔥 热门搜索</div>
              {hotSearches.map((term, i) => (
                <div
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    handleSearch(term);
                  }}
                  className="px-4 py-2.5 text-sm text-gray-600 hover:bg-sakura-50 cursor-pointer flex items-center gap-3"
                >
                  <span className={`w-5 h-5 rounded text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0 ${
                    i < 3 ? "bg-sakura-500" : "bg-gray-300"
                  }`}>
                    {i + 1}
                  </span>
                  {term}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
