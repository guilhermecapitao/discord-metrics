import { z } from "zod";
import { router, publicProcedure } from "../trpc.js";

export const eventsRouter = router({
  latest: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20)
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.rawEvent.findMany({
        take: input.limit,
        orderBy: { createdAt: "desc" }
      });
    })
});