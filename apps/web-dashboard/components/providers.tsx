"use client";

import SessionProvider from "@/components/session-provider"
import TrpcProvider from "@/components/trpc-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TrpcProvider>
      <SessionProvider>{children}</SessionProvider>
    </TrpcProvider>
  );
}