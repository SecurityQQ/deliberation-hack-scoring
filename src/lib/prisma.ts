// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Ensure the PrismaClient is re-used during hot-reloading
  // Otherwise, a new client is created on every call
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export { prisma };
