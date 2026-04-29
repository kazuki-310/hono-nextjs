import { Project, ProjectId } from "../../domain/model/project";
import type { ProjectRepository } from "../../domain/repository/project-repository";

type ProjectRecord = {
  id: string;
  name: string;
};

type PrismaProjectClient = {
  project: {
    findMany(input: { orderBy: { createdAt: "asc" } }): Promise<ProjectRecord[]>;
    findUnique(input: { where: { id: string } }): Promise<ProjectRecord | null>;
    upsert(input: {
      where: { id: string };
      create: ProjectRecord;
      update: Omit<ProjectRecord, "id">;
    }): Promise<ProjectRecord>;
  };
};

export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaProjectClient) {}

  nextIdentity(): ProjectId {
    return ProjectId.create(crypto.randomUUID());
  }

  async save(project: Project): Promise<void> {
    const snapshot = project.snapshot();
    await this.prisma.project.upsert({
      where: { id: snapshot.id },
      create: snapshot,
      update: { name: snapshot.name },
    });
  }

  async findById(id: ProjectId): Promise<Project | null> {
    const record = await this.prisma.project.findUnique({ where: { id: id.toString() } });
    if (record === null) return null;
    return toProject(record);
  }

  async findAll(): Promise<Project[]> {
    const records = await this.prisma.project.findMany({ orderBy: { createdAt: "asc" } });
    return records.map(toProject);
  }
}

function toProject(record: ProjectRecord): Project {
  return Project.restore(record.id, record.name);
}
