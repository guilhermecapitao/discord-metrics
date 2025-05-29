import { PrismaClient } from "@prisma/client";

// Singleton para evitar múltiplas conexões em hot-reload
export const prisma = new PrismaClient({
  log: ["error", "warn"]
});