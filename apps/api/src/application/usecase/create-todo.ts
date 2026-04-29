import { Todo } from "../../domain/model/todo";
import type { TodoRepository } from "../../domain/repository/todo-repository";

export class CreateTodoUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(input: CreateTodoInput): Promise<Todo> {
    const todo = Todo.createNew(this.todoRepository.nextIdentity().toString(), input.title);
    await this.todoRepository.save(todo);
    return todo;
  }
}

export type CreateTodoInput = {
  title: string;
};
