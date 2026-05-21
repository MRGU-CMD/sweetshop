"use client";

import { SessionProvider } from "next-auth/react";
import TransitionProvider from "./TransitionProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TransitionProvider>{children}</TransitionProvider>
    </SessionProvider>
  );
}
