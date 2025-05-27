"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, clientOpts } from "@/lib/trpc";
import type { TRPCClientInit } from "@trpc/react-query";
import { ReactNode, useState } from "react";

export default function TrpcProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient(clientOpts as TRPCClientInit)
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}