import { ProjectId } from "../../domain/model/project";
import type { Todo } from "../../domain/model/todo";
import type { ProjectRepository } from "../../domain/repository/project-repository";
import type { TodoRepository } from "../../domain/repository/todo-repository";

export class ListTodosByProjectUseCase {
  constructor(
    private readonly todoRepository: TodoRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(input: ListTodosByProjectInput): Promise<ListTodosByProjectResult> {
    const projectId = ProjectId.create(input.projectId);
    const project = await this.projectRepository.findById(projectId);
    if (project === null) return { found: false };

    const todos = await this.todoRepository.findByProjectId(projectId);
    return { found: true, todos };
  }
}

export type ListTodosByProjectInput = {
  projectId: string;
};

export type ListTodosByProjectResult = { found: true; todos: Todo[] } | { found: false };
