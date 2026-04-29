import { describe, expect, it } from "vitest";

import { InMemoryProjectRepository } from "../../testing/in-memory-project-repository";
import { InMemoryTodoRepository } from "../../testing/in-memory-todo-repository";
import { createApp } from "./app";

function makeApp(todoIds: string[] = [], projectIds: string[] = []) {
  return createApp({
    todoRepository: new InMemoryTodoRepository(todoIds),
    projectRepository: new InMemoryProjectRepository(projectIds),
  });
}

describe("todo routes", () => {
  it("when creating a todo, returns the created todo", async () => {
    const app = makeApp(["todo-1"]);

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
    const app = makeApp(["todo-1"]);

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
    const app = makeApp(["todo-1"]);

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
    const app = makeApp(["todo-1"]);

    const response = await app.request("/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "   " }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "title is required" });
  });

  it("when completing a missing todo, returns not found", async () => {
    const app = makeApp();

    const response = await app.request("/todos/missing/complete", {
      method: "PATCH",
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: "Todo not found" });
  });

  it("when creating a todo with a project, returns the todo with projectId", async () => {
    const app = makeApp(["todo-1"], ["project-1"]);

    await app.request("/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "My Project" }),
    });

    const response = await app.request("/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Buy milk", projectId: "project-1" }),
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: "todo-1",
      title: "Buy milk",
      completed: false,
      projectId: "project-1",
    });
  });

  it("when creating a todo with a non-existent project, returns not found", async () => {
    const app = makeApp(["todo-1"]);

    const response = await app.request("/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Buy milk", projectId: "no-such-project" }),
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: "Project not found" });
  });
});
