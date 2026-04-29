import type { Todo } from "../../domain/model/todo";
import type { TodoRepository } from "../../domain/repository/todo-repository";

export class ListTodosUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(): Promise<Todo[]> {
    return this.todoRepository.findAll();
  }
}
