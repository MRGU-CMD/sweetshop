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
import { usePathname } from "next/navigation";
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
  const counterRef = useRef(0);

  // Auto-dismiss when route changes
  useEffect(() => {
    setLoading(false);
  }, [pathname]);

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
      setSvgKey(++counterRef.current);
      setMessage("加载中...");
      setLoading(true);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  const startLoading = useCallback((msg?: string) => {
    setSvgKey(++counterRef.current);
    setMessage(msg || "加载中...");
    setLoading(true);
  }, []);

  return (
    <TransitionContext.Provider value={{ startLoading, loading }}>
      {children}
      {loading && <LoadingOverlay message={message} svgKey={svgKey} />}
    </TransitionContext.Provider>
  );
}
