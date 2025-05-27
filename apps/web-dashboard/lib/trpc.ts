import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "@discord-metrics/api";

export const trpc = createTRPCReact<AppRouter>();

export function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // client
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";               // SSR dev
}

export const clientOpts = {
  transformer: superjson,
  links: [
    httpBatchLink({
      url:
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/trpc"
    })
  ]
};