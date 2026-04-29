import type { ProjectId } from "../../domain/model/project";
import { Todo, TodoId } from "../../domain/model/todo";
import type { TodoRepository } from "../../domain/repository/todo-repository";

type TodoRecord = {
  id: string;
  title: string;
  completed: boolean;
  projectId: string | null;
};

type PrismaTodoClient = {
  todo: {
    findMany(input: {
      orderBy: { createdAt: "asc" };
      where?: { projectId: string };
    }): Promise<TodoRecord[]>;
    findUnique(input: { where: { id: string } }): Promise<TodoRecord | null>;
    upsert(input: {
      where: { id: string };
      create: { id: string; title: string; completed: boolean; projectId?: string | null };
      update: { title: string; completed: boolean; projectId?: string | null };
    }): Promise<TodoRecord>;
  };
};

export class PrismaTodoRepository implements TodoRepository {
  constructor(private readonly prisma: PrismaTodoClient) {}

  nextIdentity(): TodoId {
    return TodoId.create(crypto.randomUUID());
  }

  async save(todo: Todo): Promise<void> {
    const snapshot = todo.snapshot();
    await this.prisma.todo.upsert({
      where: { id: snapshot.id },
      create: { id: snapshot.id, title: snapshot.title, completed: snapshot.completed, projectId: snapshot.projectId },
      update: { title: snapshot.title, completed: snapshot.completed, projectId: snapshot.projectId },
    });
  }

  async findById(id: TodoId): Promise<Todo | null> {
    const record = await this.prisma.todo.findUnique({ where: { id: id.toString() } });
    if (record === null) return null;
    return toTodo(record);
  }

  async findAll(): Promise<Todo[]> {
    const records = await this.prisma.todo.findMany({ orderBy: { createdAt: "asc" } });
    return records.map(toTodo);
  }

  async findByProjectId(projectId: ProjectId): Promise<Todo[]> {
    const records = await this.prisma.todo.findMany({
      orderBy: { createdAt: "asc" },
      where: { projectId: projectId.toString() },
    });
    return records.map(toTodo);
  }
}

function toTodo(record: TodoRecord): Todo {
  return Todo.restore(record.id, record.title, record.completed, record.projectId ?? undefined);
}
