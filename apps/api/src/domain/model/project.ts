export class ProjectId {
  private constructor(private readonly value: string) {}

  static create(value: string): ProjectId {
    const normalized = value.trim();
    if (normalized.length === 0) throw new ProjectValidationError("project id is required");
    return new ProjectId(normalized);
  }

  toString(): string {
    return this.value;
  }
}

export class ProjectName {
  private constructor(private readonly value: string) {}

  static create(value: string): ProjectName {
    const normalized = value.trim();
    if (normalized.length === 0) throw new ProjectValidationError("name is required");
    if (normalized.length > 100) {
      throw new ProjectValidationError("name must be 100 characters or less");
    }
    return new ProjectName(normalized);
  }

  toString(): string {
    return this.value;
  }
}

export class Project {
  private constructor(
    private readonly id: ProjectId,
    private readonly name: ProjectName,
  ) {}

  static createNew(id: string, name: string): Project {
    return new Project(ProjectId.create(id), ProjectName.create(name));
  }

  static restore(id: string, name: string): Project {
    return new Project(ProjectId.create(id), ProjectName.create(name));
  }

  snapshot(): ProjectSnapshot {
    return {
      id: this.id.toString(),
      name: this.name.toString(),
    };
  }
}

export type ProjectSnapshot = {
  id: string;
  name: string;
};

export class ProjectValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectValidationError";
  }
}

export class ProjectNotFoundError extends Error {
  constructor(id: string) {
    super(`Project not found: ${id}`);
    this.name = "ProjectNotFoundError";
  }
}
