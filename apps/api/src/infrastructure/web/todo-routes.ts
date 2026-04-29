import { Hono } from "hono";
import type { Context } from "hono";

import { TodoController, type TodoControllerDependencies } from "../../handler/todo-controller";

export type TodoRouteDependenciesProvider = (c: Context) => TodoControllerDependencies;

export function createTodoRoutes(dependenciesProvider: TodoRouteDependenciesProvider): Hono {
  const routes = new Hono();

  routes.get("/", async (c) => {
    const response = await createController(dependenciesProvider, c).listTodos();
    return c.json(response.body, response.status);
  });

  routes.post("/", async (c) => {
    const response = await createController(dependenciesProvider, c).createTodo(c.req.raw);
    return c.json(response.body, response.status);
  });

  routes.patch("/:id/complete", async (c) => {
    const response = await createController(dependenciesProvider, c).completeTodo(
      c.req.param("id"),
    );
    return c.json(response.body, response.status);
  });

  return routes;
}

function createController(
  dependenciesProvider: TodoRouteDependenciesProvider,
  c: Context,
): TodoController {
  return new TodoController(dependenciesProvider(c));
}
