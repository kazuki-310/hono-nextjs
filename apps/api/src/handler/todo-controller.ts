import type { CompleteTodoUseCase } from "../application/usecase/complete-todo";
import type { CreateTodoUseCase } from "../application/usecase/create-todo";
import type { ListTodosUseCase } from "../application/usecase/list-todos";
import { TodoValidationError } from "../domain/model/todo";
import { presentTodo, presentTodos } from "./todo-presenter";

export type TodoControllerDependencies = {
  createTodo: CreateTodoUseCase;
  listTodos: ListTodosUseCase;
  completeTodo: CompleteTodoUseCase;
};

export class TodoController {
  constructor(private readonly dependencies: TodoControllerDependencies) {}

  async listTodos(): Promise<TodoResponse> {
    const todos = await this.dependencies.listTodos.execute();
    return { status: 200, body: presentTodos(todos) };
  }

  async createTodo(request: Request): Promise<TodoResponse> {
    const body = await readCreateTodoBody(request);
    if (body === null) return { status: 400, body: { message: "title is required" } };

    const result = await createTodo(body, this.dependencies.createTodo);
    if (!result.created) return { status: 400, body: { message: result.message } };

    return { status: 201, body: presentTodo(result.todo) };
  }

  async completeTodo(id: string): Promise<TodoResponse> {
    const result = await this.dependencies.completeTodo.execute({ id });
    if (!result.found) return { status: 404, body: { message: "Todo not found" } };
    return { status: 200, body: presentTodo(result.todo) };
  }
}

export type TodoResponse = {
  status: 200 | 201 | 400 | 404;
  body: unknown;
};

async function createTodo(
  body: { title: string },
  useCase: CreateTodoUseCase,
): Promise<CreateTodoResult> {
  try {
    return { created: true, todo: await useCase.execute(body) };
  } catch (error) {
    if (error instanceof TodoValidationError) return { created: false, message: error.message };
    throw error;
  }
}

type CreateTodoResult =
  | { created: true; todo: Awaited<ReturnType<CreateTodoUseCase["execute"]>> }
  | { created: false; message: string };

async function readCreateTodoBody(request: Request): Promise<{ title: string } | null> {
  const body = await request.json().catch(() => null);
  if (!isCreateTodoBody(body)) return null;
  return { title: body.title };
}

function isCreateTodoBody(body: unknown): body is { title: string } {
  if (typeof body !== "object" || body === null) return false;
  if (!Object.hasOwn(body, "title")) return false;
  const candidate = body as Record<string, unknown>;
  return typeof candidate.title === "string";
}
