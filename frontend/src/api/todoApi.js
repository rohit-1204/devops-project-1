const API_BASE_URL = "http://localhost:8000";

export const getTodos = async () => {
  const response = await fetch(`${API_BASE_URL}/api/todos`);

  if (!response.ok) {
    throw new Error("Failed to fetch todos");
  }

  return response.json();
};

export const createTodo = async (text) => {
  const response = await fetch(`${API_BASE_URL}/api/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error("Failed to create todo");
  }

  return response.json();
};

export const updateTodo = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Failed to update todo");
  }

  return response.json();
};

export const deleteTodo = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Failed to delete todo");
  }

  return response.json();
};
