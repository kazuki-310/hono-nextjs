import { ProjectId, ProjectNotFoundError } from "../../domain/model/project";
import { Todo } from "../../domain/model/todo";
import type { ProjectRepository } from "../../domain/repository/project-repository";
import type { TodoRepository } from "../../domain/repository/todo-repository";

export class CreateTodoUseCase {
  constructor(
    private readonly todoRepository: TodoRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(input: CreateTodoInput): Promise<Todo> {
    if (input.projectId !== undefined) {
      const project = await this.projectRepository.findById(ProjectId.create(input.projectId));
      if (project === null) throw new ProjectNotFoundError(input.projectId);
    }
    const todo = Todo.createNew(
      this.todoRepository.nextIdentity().toString(),
      input.title,
      input.projectId,
    );
    await this.todoRepository.save(todo);
    return todo;
  }
}

export type CreateTodoInput = {
  title: string;
  projectId?: string;
};
