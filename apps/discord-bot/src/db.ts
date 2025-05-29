// apps/discord-bot/src/db.ts
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");

export const prisma = new PrismaClient({
  log: ["error", "warn"],
});