import type { Project } from "../../domain/model/project";
import type { ProjectRepository } from "../../domain/repository/project-repository";

export class ListProjectsUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(): Promise<Project[]> {
    return this.projectRepository.findAll();
  }
}
