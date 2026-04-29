import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const url = new URL(databaseUrl);
const { hostname, username, password, pathname } = url;
const port = url.port ? Number(url.port) : undefined;

if (port !== undefined && (!Number.isInteger(port) || port < 1 || port > 65535)) {
  throw new Error(`DATABASE_URL port must be an integer between 1 and 65535: ${url.port}`);
}

const adapter = new PrismaMariaDb({
  host: hostname,
  ...(port !== undefined ? { port } : {}),
  user: username,
  password: password,
  database: pathname.replace(/^\//, ""),
  connectionLimit: 5,
});

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
