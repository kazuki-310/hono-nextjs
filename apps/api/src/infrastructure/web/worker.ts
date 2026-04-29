import { createPrismaClient } from "@packages/database";

import { PrismaTodoRepository } from "../prisma/prisma-todo-repository";
import { createAppWithDependencies } from "./app";

type WorkerEnv = {
  Bindings: {
    DATABASE_URL?: string;
  };
};

export const app = createAppWithDependencies((c) => {
  const prisma = createPrismaClient(resolveDatabaseUrl(c.env as WorkerEnv["Bindings"]));

  return {
    todoRepository: new PrismaTodoRepository(prisma),
    dispose: () => prisma.$disconnect(),
  };
});

function resolveDatabaseUrl(env: WorkerEnv["Bindings"]): string {
  if (env.DATABASE_URL !== undefined) return env.DATABASE_URL;
  throw new Error("DATABASE_URL environment variable is required");
}
