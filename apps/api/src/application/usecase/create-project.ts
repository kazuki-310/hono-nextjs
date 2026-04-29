import { Project } from "../../domain/model/project";
import type { ProjectRepository } from "../../domain/repository/project-repository";

export class CreateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(input: CreateProjectInput): Promise<Project> {
    const project = Project.createNew(this.projectRepository.nextIdentity().toString(), input.name);
    await this.projectRepository.save(project);
    return project;
  }
}

export type CreateProjectInput = {
  name: string;
};
