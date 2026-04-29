import { TodoId, type Todo } from "../../domain/model/todo";
import type { TodoRepository } from "../../domain/repository/todo-repository";

export class CompleteTodoUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(input: CompleteTodoInput): Promise<CompleteTodoResult> {
    const todo = await this.todoRepository.findById(TodoId.create(input.id));
    if (todo === null) return { found: false };

    const completed = todo.complete();
    await this.todoRepository.save(completed);
    return { found: true, todo: completed };
  }
}

export type CompleteTodoInput = {
  id: string;
};

export type CompleteTodoResult = { found: true; todo: Todo } | { found: false };
