"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import LoadingOverlay from "./LoadingOverlay";

interface TransitionCtx {
  startLoading: (message?: string) => void;
  loading: boolean;
}

const TransitionContext = createContext<TransitionCtx>({
  startLoading: () => {},
  loading: false,
});

export function useTransition() {
  return useContext(TransitionContext);
}

export default function TransitionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("加载中...");
  const [svgKey, setSvgKey] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const counterRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auto-dismiss when route changes (pathname or query params)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLoading(false);
  }, [pathname, searchParams]);

  // Auto-detect link clicks — capture phase to beat next/link's own handler
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const a = target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      // Skip external links, anchors, javascript:, and download links
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        a.hasAttribute("download") ||
        a.getAttribute("target") === "_blank"
      )
        return;
      // Don't show loading for same-page navigation (incl. query params)
      if (href === window.location.pathname + window.location.search) return;
      if (href === pathname) return;
      setSvgKey(++counterRef.current);
      setMessage("加载中...");
      setLoading(true);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [pathname]);

  const startLoading = useCallback((msg?: string) => {
    setSvgKey(++counterRef.current);
    setMessage(msg || "加载中...");
    setLoading(true);
    // Safety fallback: auto-dismiss after 15s if navigation never completes
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLoading(false), 15000);
  }, []);

  return (
    <TransitionContext.Provider value={{ startLoading, loading }}>
      {children}
      {loading && <LoadingOverlay message={message} svgKey={svgKey} />}
    </TransitionContext.Provider>
  );
}
