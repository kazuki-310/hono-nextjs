import type { Project, ProjectSnapshot } from "../domain/model/project";

export function presentProject(project: Project): ProjectSnapshot {
  return project.snapshot();
}

export function presentProjects(projects: Project[]): { projects: ProjectSnapshot[] } {
  return { projects: projects.map(presentProject) };
}
