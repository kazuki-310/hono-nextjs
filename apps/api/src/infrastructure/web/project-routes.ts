import { Hono } from "hono";
import type { Context } from "hono";

import { ProjectController, type ProjectControllerDependencies } from "../../handler/project-controller";

export type ProjectRouteDependenciesProvider = (c: Context) => ProjectControllerDependencies;

export function createProjectRoutes(dependenciesProvider: ProjectRouteDependenciesProvider): Hono {
  const routes = new Hono();

  routes.get("/", async (c) => {
    const response = await createController(dependenciesProvider, c).listProjects();
    return c.json(response.body, response.status);
  });

  routes.post("/", async (c) => {
    const response = await createController(dependenciesProvider, c).createProject(c.req.raw);
    return c.json(response.body, response.status);
  });

  routes.get("/:id/todos", async (c) => {
    const response = await createController(dependenciesProvider, c).listTodosByProject(
      c.req.param("id"),
    );
    return c.json(response.body, response.status);
  });

  return routes;
}

function createController(
  dependenciesProvider: ProjectRouteDependenciesProvider,
  c: Context,
): ProjectController {
  return new ProjectController(dependenciesProvider(c));
}
