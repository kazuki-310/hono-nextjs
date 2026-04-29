import { Project, ProjectId } from "../domain/model/project";
import type { ProjectRepository } from "../domain/repository/project-repository";

export class InMemoryProjectRepository implements ProjectRepository {
  private readonly projects = new Map<string, Project>();

  constructor(private readonly ids: string[] = []) {}

  nextIdentity(): ProjectId {
    return ProjectId.create(this.ids.shift() ?? crypto.randomUUID());
  }

  async save(project: Project): Promise<void> {
    const snapshot = project.snapshot();
    this.projects.set(snapshot.id, project);
  }

  async findById(id: ProjectId): Promise<Project | null> {
    return this.projects.get(id.toString()) ?? null;
  }

  async findAll(): Promise<Project[]> {
    return [...this.projects.values()];
  }
}
