import { describe, expect, it } from "vitest";

import { Todo, TodoTitle } from "./todo";

describe("TodoTitle", () => {
  it("when title is blank, rejects it", () => {
    expect(() => TodoTitle.create("   ")).toThrow("title is required");
  });

  it("when title has leading spaces, normalizes it", () => {
    const title = TodoTitle.create("  Buy milk  ");

    expect(title.toString()).toBe("Buy milk");
  });
});

describe("Todo", () => {
  it("when completing an active todo, marks it completed", () => {
    const todo = Todo.createNew("todo-1", "Buy milk");

    const completed = todo.complete();

    expect(completed.isCompleted()).toBe(true);
  });
});
