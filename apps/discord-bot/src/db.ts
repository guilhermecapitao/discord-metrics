// apps/discord-bot/src/db.ts
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

export const prisma = new PrismaClient({
  log: ["error", "warn"],
});