"use client";

import { SessionProvider } from "next-auth/react";
import TransitionProvider from "./TransitionProvider";
import { ToastProvider } from "./ui/Toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <TransitionProvider>{children}</TransitionProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
