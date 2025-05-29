"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, type CreateTRPCClientOptions } from "@trpc/react-query";
import { trpc } from "@/lib/trpc";
import superjson from "superjson";
import { ReactNode, useState } from "react";
import type { AppRouter } from "@discord-metrics/api";

const clientOpts = {
  links: [
    httpBatchLink({
      url:
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/trpc",
      transformer: superjson,
    }),
  ],
} satisfies CreateTRPCClientOptions<AppRouter>;

export default function TrpcProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => trpc.createClient(clientOpts));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}