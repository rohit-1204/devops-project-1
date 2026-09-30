import { useEffect, useState } from "react";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo
} from "./api/todoApi";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load todos from backend when application starts
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTodos();
      setTodos(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load todos");
    } finally {
      setLoading(false);
    }
  };

  // Create todo through backend API
  const addTodo = async (text) => {
    try {
      setError("");

      const newTodo = await createTodo(text);

      setTodos((currentTodos) => [
        ...currentTodos,
        newTodo
      ]);
    } catch (error) {
      console.error(error);
      setError("Unable to add todo");
    }
  };

  // Update todo through backend API
  const toggleTodo = async (id) => {
    const todo = todos.find((item) => item.id === id);

    if (!todo) {
      return;
    }

    try {
      setError("");

      const updatedTodo = await updateTodo(id, {
        completed: !todo.completed
      });

      setTodos((currentTodos) =>
        currentTodos.map((item) =>
          item.id === id ? updatedTodo : item
        )
      );
    } catch (error) {
      console.error(error);
      setError("Unable to update todo");
    }
  };

  // Delete todo through backend API
  const handleDeleteTodo = async (id) => {
    try {
      setError("");

      await deleteTodo(id);

      setTodos((currentTodos) =>
        currentTodos.filter((todo) => todo.id !== id)
      );
    } catch (error) {
      console.error(error);
      setError("Unable to delete todo");
    }
  };

  if (loading) {
    return <p>Loading todos...</p>;
  }

  return (
    <main>
      <h1>Todo App</h1>

      {error && <p role="alert">{error}</p>}

      <TodoForm onAdd={addTodo} />

      <TodoList
        todos={todos}
        onToggle={toggleTodo}
        onDelete={handleDeleteTodo}
      />
    </main>
  );
}

export default App;
