// lib/trpc.ts ---------------------------------------------------
import { httpBatchLink, createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';
import type { AppRouter } from '@discord-metrics/api';

export const trpc = createTRPCReact<AppRouter>();

export const clientOpts = {
  links: [
    httpBatchLink({
      url: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/trpc',
      transformer: superjson,
    }),
  ],
} as const;