// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// This is a TypeScript trick to extend the global Node.js object
declare global {
  // We declare a global variable 'prisma' that can be a PrismaClient instance or undefined
  var prisma: PrismaClient | undefined
}

// We export a 'prisma' constant.
// It checks if a global instance already exists (global.prisma).
// If it does, it uses it. If not, it creates a new PrismaClient.
// This prevents creating multiple connections in development due to hot-reloading.
export const prisma = global.prisma || new PrismaClient()

// In non-production environments, we assign the new instance to the global variable.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
