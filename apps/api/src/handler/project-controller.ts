import type { CreateProjectUseCase } from "../application/usecase/create-project";
import type { ListProjectsUseCase } from "../application/usecase/list-projects";
import type { ListTodosByProjectUseCase } from "../application/usecase/list-todos-by-project";
import { ProjectValidationError } from "../domain/model/project";
import { presentTodos } from "./todo-presenter";
import { presentProject, presentProjects } from "./project-presenter";

export type ProjectControllerDependencies = {
  createProject: CreateProjectUseCase;
  listProjects: ListProjectsUseCase;
  listTodosByProject: ListTodosByProjectUseCase;
};

export class ProjectController {
  constructor(private readonly dependencies: ProjectControllerDependencies) {}

  async listProjects(): Promise<ProjectResponse> {
    const projects = await this.dependencies.listProjects.execute();
    return { status: 200, body: presentProjects(projects) };
  }

  async createProject(request: Request): Promise<ProjectResponse> {
    const body = await readCreateProjectBody(request);
    if (body === null) return { status: 400, body: { message: "name is required" } };

    try {
      const project = await this.dependencies.createProject.execute(body);
      return { status: 201, body: presentProject(project) };
    } catch (error) {
      if (error instanceof ProjectValidationError) {
        return { status: 400, body: { message: error.message } };
      }
      throw error;
    }
  }

  async listTodosByProject(id: string): Promise<ProjectResponse> {
    const result = await this.dependencies.listTodosByProject.execute({ projectId: id });
    if (!result.found) return { status: 404, body: { message: "Project not found" } };
    return { status: 200, body: presentTodos(result.todos) };
  }
}

export type ProjectResponse = {
  status: 200 | 201 | 400 | 404;
  body: unknown;
};

async function readCreateProjectBody(request: Request): Promise<{ name: string } | null> {
  const body = await request.json().catch(() => null);
  if (!isCreateProjectBody(body)) return null;
  return { name: body.name };
}

function isCreateProjectBody(body: unknown): body is { name: string } {
  if (typeof body !== "object" || body === null) return false;
  if (!Object.hasOwn(body, "name")) return false;
  const candidate = body as Record<string, unknown>;
  return typeof candidate.name === "string";
}
