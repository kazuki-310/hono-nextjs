import { describe, expect, it } from "vitest";

import { InMemoryProjectRepository } from "../../testing/in-memory-project-repository";
import { InMemoryTodoRepository } from "../../testing/in-memory-todo-repository";
import { createApp } from "./app";

function makeApp(projectIds: string[] = [], todoIds: string[] = []) {
  return createApp({
    todoRepository: new InMemoryTodoRepository(todoIds),
    projectRepository: new InMemoryProjectRepository(projectIds),
  });
}

describe("project routes", () => {
  it("when creating a project, returns the created project", async () => {
    const app = makeApp(["project-1"]);

    const response = await app.request("/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "My Project" }),
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: "project-1",
      name: "My Project",
    });
  });

  it("when listing projects, returns created projects", async () => {
    const app = makeApp(["project-1"]);

    await app.request("/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "My Project" }),
    });

    const response = await app.request("/projects");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      projects: [{ id: "project-1", name: "My Project" }],
    });
  });

  it("when name is blank, returns bad request", async () => {
    const app = makeApp(["project-1"]);

    const response = await app.request("/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "   " }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "name is required" });
  });

  it("when listing todos of a project, returns only that project's todos", async () => {
    const app = makeApp(["project-1"], ["todo-1", "todo-2"]);

    await app.request("/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "My Project" }),
    });

    await app.request("/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "In project", projectId: "project-1" }),
    });

    await app.request("/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "No project" }),
    });

    const response = await app.request("/projects/project-1/todos");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      todos: [{ id: "todo-1", title: "In project", completed: false, projectId: "project-1" }],
    });
  });

  it("when listing todos of a missing project, returns not found", async () => {
    const app = makeApp();

    const response = await app.request("/projects/no-such-project/todos");

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: "Project not found" });
  });
});
