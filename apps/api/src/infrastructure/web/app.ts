import { Hono } from "hono";
import type { Context } from "hono";

import { CompleteTodoUseCase } from "../../application/usecase/complete-todo";
import { CreateProjectUseCase } from "../../application/usecase/create-project";
import { CreateTodoUseCase } from "../../application/usecase/create-todo";
import { ListProjectsUseCase } from "../../application/usecase/list-projects";
import { ListTodosByProjectUseCase } from "../../application/usecase/list-todos-by-project";
import { ListTodosUseCase } from "../../application/usecase/list-todos";
import type { ProjectRepository } from "../../domain/repository/project-repository";
import type { TodoRepository } from "../../domain/repository/todo-repository";
import { createProjectRoutes } from "./project-routes";
import { createTodoRoutes } from "./todo-routes";

export type AppDependencies = {
  todoRepository: TodoRepository;
  projectRepository: ProjectRepository;
  dispose?: () => Promise<void>;
};

export function createApp(dependencies: AppDependencies): Hono {
  return createAppWithDependencies(() => dependencies);
}

export function createAppWithDependencies(dependenciesProvider: AppDependenciesProvider): Hono {
  const app = new Hono();
  const dependenciesByContext = new WeakMap<Context, AppDependencies>();

  app.use(async (c, next) => {
    try {
      await next();
    } finally {
      const dependencies = dependenciesByContext.get(c);
      dependenciesByContext.delete(c);

      if (dependencies?.dispose !== undefined) {
        const disposal = dependencies.dispose();
        c.executionCtx.waitUntil(disposal);
      }
    }
  });

  app.get("/", (c) => c.text("Hello Hono!"));

  app.route(
    "/todos",
    createTodoRoutes((c) => {
      const deps = resolveDependencies(c, dependenciesProvider, dependenciesByContext);
      return createTodoUseCases(deps.todoRepository, deps.projectRepository);
    }),
  );

  app.route(
    "/projects",
    createProjectRoutes((c) => {
      const deps = resolveDependencies(c, dependenciesProvider, dependenciesByContext);
      return createProjectUseCases(deps.projectRepository, deps.todoRepository);
    }),
  );

  return app;
}

export type AppDependenciesProvider = (c: Context) => AppDependencies;

function resolveDependencies(
  c: Context,
  dependenciesProvider: AppDependenciesProvider,
  dependenciesByContext: WeakMap<Context, AppDependencies>,
): AppDependencies {
  const existingDependencies = dependenciesByContext.get(c);
  if (existingDependencies !== undefined) return existingDependencies;

  const dependencies = dependenciesProvider(c);
  dependenciesByContext.set(c, dependencies);
  return dependencies;
}

function createTodoUseCases(todoRepository: TodoRepository, projectRepository: ProjectRepository) {
  return {
    createTodo: new CreateTodoUseCase(todoRepository, projectRepository),
    listTodos: new ListTodosUseCase(todoRepository),
    completeTodo: new CompleteTodoUseCase(todoRepository),
  };
}

function createProjectUseCases(
  projectRepository: ProjectRepository,
  todoRepository: TodoRepository,
) {
  return {
    createProject: new CreateProjectUseCase(projectRepository),
    listProjects: new ListProjectsUseCase(projectRepository),
    listTodosByProject: new ListTodosByProjectUseCase(todoRepository, projectRepository),
  };
}
