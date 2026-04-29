import { describe, expect, it } from "vitest";

import { InMemoryTodoRepository } from "../../testing/in-memory-todo-repository";
import { createApp } from "./app";

describe("todo routes", () => {
  it("when creating a todo, returns the created todo", async () => {
    const app = createApp({ todoRepository: new InMemoryTodoRepository(["todo-1"]) });

    const response = await app.request("/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Buy milk" }),
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: "todo-1",
      title: "Buy milk",
      completed: false,
    });
  });

  it("when listing todos, returns created todos", async () => {
    const app = createApp({ todoRepository: new InMemoryTodoRepository(["todo-1"]) });

    await app.request("/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Buy milk" }),
    });

    const response = await app.request("/todos");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      todos: [{ id: "todo-1", title: "Buy milk", completed: false }],
    });
  });

  it("when completing an existing todo, returns completed todo", async () => {
    const app = createApp({ todoRepository: new InMemoryTodoRepository(["todo-1"]) });

    await app.request("/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Buy milk" }),
    });

    const response = await app.request("/todos/todo-1/complete", {
      method: "PATCH",
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: "todo-1",
      title: "Buy milk",
      completed: true,
    });
  });

  it("when title is blank, returns bad request", async () => {
    const app = createApp({ todoRepository: new InMemoryTodoRepository(["todo-1"]) });

    const response = await app.request("/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "   " }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "title is required" });
  });

  it("when completing a missing todo, returns not found", async () => {
    const app = createApp({ todoRepository: new InMemoryTodoRepository() });

    const response = await app.request("/todos/missing/complete", {
      method: "PATCH",
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: "Todo not found" });
  });
});
