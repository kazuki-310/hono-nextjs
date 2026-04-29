import { Todo, TodoId } from "../domain/model/todo";
import type { TodoRepository } from "../domain/repository/todo-repository";

export class InMemoryTodoRepository implements TodoRepository {
  private readonly todos = new Map<string, Todo>();

  constructor(private readonly ids: string[] = []) {}

  nextIdentity(): TodoId {
    return TodoId.create(this.ids.shift() ?? crypto.randomUUID());
  }

  async save(todo: Todo): Promise<void> {
    const snapshot = todo.snapshot();
    this.todos.set(snapshot.id, todo);
  }

  async findById(id: TodoId): Promise<Todo | null> {
    return this.todos.get(id.toString()) ?? null;
  }

  async findAll(): Promise<Todo[]> {
    return [...this.todos.values()];
  }
}
