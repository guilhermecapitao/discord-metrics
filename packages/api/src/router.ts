import { router } from "./trpc.js"; 
import { eventsRouter } from "./routers/events.js";

export const appRouter = router({
  events: eventsRouter
});

// export type for client
export type AppRouter = typeof appRouter;