import { Component } from "../../lib/Component";
import { UIDefinition } from "../../lib/UIDefinition";

export class NewTodo extends Component {
  static $definition = UIDefinition.root("div.new-todo", "new-todo")
    .withDescendant("input", "input-field")
    .withDescendant("button", "submit-button");
}

export class TodoList extends Component {
  static $definition = UIDefinition.root(".todo-list");
}

export class TodoApp extends Component {
  static $definition = UIDefinition.root("div.todo-app")
    .withDescendant(NewTodo)
    .withDescendant(TodoList, "todo-list");
}
