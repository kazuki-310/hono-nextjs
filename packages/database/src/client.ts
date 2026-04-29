import { createPrismaClient } from "./create-client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma || createPrismaClient(databaseUrl);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
