"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "@/components/TransitionProvider";

const HISTORY_KEY = "sweetshop_search_history";
const MAX_HISTORY = 5;

function getHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

function saveHistory(term: string) {
  const history = getHistory().filter((t) => t !== term);
  history.unshift(term);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export default function SearchBox() {
  const router = useRouter();
  const { startLoading } = useTransition();
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<{ name: string; count?: number }[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
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

  useEffect(() => {
    setHistory(getHistory());
  }, [showDropdown]);

  // Debounced API suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        const products = (data.products || []).map((p: any) => ({ name: p.name, count: p.sales }));
        setSuggestions(products);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleSearch = (q: string) => {
    setShowDropdown(false);
    if (q.trim()) {
      saveHistory(q.trim());
      startLoading("搜索中...");
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const removeHistoryItem = (term: string) => {
    const updated = history.filter((t) => t !== term);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center bg-sakura-50 rounded-xl px-4 py-2.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400 mr-2 flex-shrink-0" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input
          type="text"
          aria-label="搜索商品"
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
        <div role="listbox" className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-50 overflow-hidden z-50">
          {query ? (
            <>
              <div className="px-4 py-2 text-xs text-gray-300">搜索建议</div>
              {suggestions.length > 0 ? (
                suggestions.map((s) => (
                  <div
                    key={s.name}
                    role="option"
                    tabIndex={0}
                    onClick={() => {
                      setQuery(s.name);
                      handleSearch(s.name);
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") { setQuery(s.name); handleSearch(s.name); } }}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:bg-sakura-50 cursor-pointer flex items-center justify-between"
                  >
                    <span>{s.name}</span>
                    <span className="text-xs text-gray-300">{s.count} 件</span>
                  </div>
                ))
              ) : (
                <div
                  role="option"
                  tabIndex={0}
                  onClick={() => handleSearch(query)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(query); }}
                  className="px-4 py-2.5 text-sm text-gray-600 hover:bg-sakura-50 cursor-pointer flex items-center gap-2"
                >
                  🔍 搜索 &quot;{query}&quot;
                </div>
              )}
            </>
          ) : (
            <>
              {history.length > 0 && (
                <>
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-xs text-gray-300">🕐 搜索历史</span>
                    <button
                      onClick={() => { clearHistory(); setHistory([]); }}
                      className="text-xs text-gray-300 hover:text-red-400 transition-colors"
                    >
                      清空
                    </button>
                  </div>
                  {history.map((term) => (
                    <div
                      key={term}
                      role="option"
                      tabIndex={0}
                      onClick={() => {
                        setQuery(term);
                        handleSearch(term);
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter") { setQuery(term); handleSearch(term); } }}
                      className="px-4 py-2.5 text-sm text-gray-600 hover:bg-sakura-50 cursor-pointer flex items-center justify-between"
                    >
                      <span>{term}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeHistoryItem(term); }}
                        className="text-gray-300 hover:text-gray-500 text-xs"
                        aria-label={`删除搜索记录: ${term}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div className="px-4 py-2 text-xs text-gray-300 border-t border-gray-50 mt-1">🔥 热门搜索</div>
                </>
              )}
              {history.length === 0 && (
                <div className="px-4 py-2 text-xs text-gray-300">🔥 热门搜索</div>
              )}
              {hotSearches.map((term, i) => (
                <div
                  key={term}
                  role="option"
                  tabIndex={0}
                  onClick={() => {
                    setQuery(term);
                    handleSearch(term);
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") { setQuery(term); handleSearch(term); } }}
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
