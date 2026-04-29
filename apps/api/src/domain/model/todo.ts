export class TodoId {
  private constructor(private readonly value: string) {}

  static create(value: string): TodoId {
    const normalized = value.trim();
    if (normalized.length === 0) throw new TodoValidationError("todo id is required");
    return new TodoId(normalized);
  }

  toString(): string {
    return this.value;
  }
}

export class TodoTitle {
  private constructor(private readonly value: string) {}

  static create(value: string): TodoTitle {
    const normalized = value.trim();
    if (normalized.length === 0) throw new TodoValidationError("title is required");
    if (normalized.length > 120) {
      throw new TodoValidationError("title must be 120 characters or less");
    }
    return new TodoTitle(normalized);
  }

  toString(): string {
    return this.value;
  }
}

export class Todo {
  private constructor(
    private readonly id: TodoId,
    private readonly title: TodoTitle,
    private readonly completed: boolean,
  ) {}

  static createNew(id: string, title: string): Todo {
    return new Todo(TodoId.create(id), TodoTitle.create(title), false);
  }

  static restore(id: string, title: string, completed: boolean): Todo {
    return new Todo(TodoId.create(id), TodoTitle.create(title), completed);
  }

  complete(): Todo {
    return new Todo(this.id, this.title, true);
  }

  isCompleted(): boolean {
    return this.completed;
  }

  snapshot(): TodoSnapshot {
    return {
      id: this.id.toString(),
      title: this.title.toString(),
      completed: this.completed,
    };
  }
}

export type TodoSnapshot = {
  id: string;
  title: string;
  completed: boolean;
};

export class TodoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TodoValidationError";
  }
}
