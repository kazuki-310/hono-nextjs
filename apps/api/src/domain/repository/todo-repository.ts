import type { ProjectId } from "../model/project";
import type { Todo, TodoId } from "../model/todo";

export interface TodoRepository {
  nextIdentity(): TodoId;
  save(todo: Todo): Promise<void>;
  findById(id: TodoId): Promise<Todo | null>;
  findAll(): Promise<Todo[]>;
  findByProjectId(projectId: ProjectId): Promise<Todo[]>;
}
