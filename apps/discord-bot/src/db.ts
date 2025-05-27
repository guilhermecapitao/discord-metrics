import { PrismaClient } from '@prisma/client';

// Singleton para evitar múltiplas conexões em hot-reload local
export const prisma = new PrismaClient({
  log: ['error', 'warn']
});
