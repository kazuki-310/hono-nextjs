import type { Project, ProjectId } from "../model/project";

export interface ProjectRepository {
  nextIdentity(): ProjectId;
  save(project: Project): Promise<void>;
  findById(id: ProjectId): Promise<Project | null>;
  findAll(): Promise<Project[]>;
}
