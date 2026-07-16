"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, action?: { label: string; onClick: () => void }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "info", action?: { label: string; onClick: () => void }) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type, action }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl text-sm shadow-lg animate-[toastSlideIn_0.3s_ease] max-w-xs flex items-center gap-3 ${
              t.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : t.type === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-white text-gray-700 border border-gray-100"
            }`}
          >
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <button
                onClick={t.action.onClick}
                className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-lg transition-colors ${
                  t.type === "success" ? "bg-green-100 hover:bg-green-200 text-green-800" :
                  t.type === "error" ? "bg-red-100 hover:bg-red-200 text-red-800" :
                  "bg-sakura-50 hover:bg-sakura-100 text-sakura-500"
                }`}
              >
                {t.action.label}
              </button>
            )}
            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 text-current opacity-50 hover:opacity-100 text-xs"
              aria-label="关闭通知"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
