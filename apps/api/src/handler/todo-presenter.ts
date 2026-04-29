import type { Todo, TodoSnapshot } from "../domain/model/todo";

export function presentTodo(todo: Todo): TodoSnapshot {
  return todo.snapshot();
}

export function presentTodos(todos: Todo[]): { todos: TodoSnapshot[] } {
  return { todos: todos.map(presentTodo) };
}
