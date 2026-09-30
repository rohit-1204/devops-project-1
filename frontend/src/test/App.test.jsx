import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import App from "../App";

import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo
} from "../api/todoApi";

vi.mock("../api/todoApi", () => ({
  getTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn()
}));

describe("Todo App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTodos.mockResolvedValue([]);
  });

  test("renders application", async () => {
    render(<App />);

    expect(
      screen.getByText("Loading todos...")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("Todo App")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByPlaceholderText("Enter todo")
    ).toBeInTheDocument();

    expect(
      screen.getByText("No todos found.")
    ).toBeInTheDocument();

    expect(getTodos).toHaveBeenCalledTimes(1);
  });

  test("does not show error alert when there is no error", async () => {
    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText("Todo App")
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("alert")
    ).not.toBeInTheDocument();
  });

  test("loads existing todos", async () => {
    getTodos.mockResolvedValue([
      {
        id: 1,
        text: "Learn Docker",
        completed: false
      },
      {
        id: 2,
        text: "Learn Kubernetes",
        completed: true
      }
    ]);

    render(<App />);

    expect(
      await screen.findByText("Learn Docker")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Learn Kubernetes")
    ).toBeInTheDocument();
  });

  test("handles get todos API error", async () => {
    getTodos.mockRejectedValue(
      new Error("Backend unavailable")
    );

    render(<App />);

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Unable to load todos");
  });

  test("does not add empty todo", async () => {
    const user = userEvent.setup();

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText("Todo App")
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: "Add" })
    );

    expect(
      screen.getByText("No todos found.")
    ).toBeInTheDocument();

    expect(createTodo).not.toHaveBeenCalled();
  });

  test("does not add whitespace todo", async () => {
    const user = userEvent.setup();

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText("Todo App")
      ).toBeInTheDocument();
    });

    const input = screen.getByLabelText("todo input");

    await user.type(input, "   ");

    await user.click(
      screen.getByRole("button", { name: "Add" })
    );

    expect(
      screen.getByText("No todos found.")
    ).toBeInTheDocument();

    expect(createTodo).not.toHaveBeenCalled();
  });

  test("adds todo using backend API", async () => {
    const user = userEvent.setup();

    createTodo.mockResolvedValue({
      id: 1,
      text: "Learn Docker",
      completed: false
    });

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText("Todo App")
      ).toBeInTheDocument();
    });

    const input = screen.getByLabelText("todo input");

    await user.type(input, "Learn Docker");

    await user.click(
      screen.getByRole("button", { name: "Add" })
    );

    expect(
      await screen.findByText("Learn Docker")
    ).toBeInTheDocument();

    expect(createTodo).toHaveBeenCalledWith(
      "Learn Docker"
    );
  });

  test("handles create todo API error", async () => {
    const user = userEvent.setup();

    createTodo.mockRejectedValue(
      new Error("Create todo failed")
    );

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText("Todo App")
      ).toBeInTheDocument();
    });

    const input = screen.getByLabelText("todo input");

    await user.type(input, "Learn Docker");

    await user.click(
      screen.getByRole("button", { name: "Add" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Unable to add todo");
  });

  test("trims todo text", async () => {
    const user = userEvent.setup();

    createTodo.mockResolvedValue({
      id: 1,
      text: "Learn Kubernetes",
      completed: false
    });

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText("Todo App")
      ).toBeInTheDocument();
    });

    const input = screen.getByLabelText("todo input");

    await user.type(
      input,
      "  Learn Kubernetes  "
    );

    await user.click(
      screen.getByRole("button", { name: "Add" })
    );

    expect(createTodo).toHaveBeenCalledWith(
      "Learn Kubernetes"
    );
  });

  test("completes todo", async () => {
    const user = userEvent.setup();

    getTodos.mockResolvedValue([
      {
        id: 1,
        text: "Learn AWS",
        completed: false
      }
    ]);

    updateTodo.mockResolvedValue({
      id: 1,
      text: "Learn AWS",
      completed: true
    });

    render(<App />);

    const checkbox =
      await screen.findByRole("checkbox");

    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });

    expect(updateTodo).toHaveBeenCalledWith(1, {
      completed: true
    });
  });

  test("uncompletes todo", async () => {
    const user = userEvent.setup();

    getTodos.mockResolvedValue([
      {
        id: 1,
        text: "Learn Terraform",
        completed: true
      }
    ]);

    updateTodo.mockResolvedValue({
      id: 1,
      text: "Learn Terraform",
      completed: false
    });

    render(<App />);

    const checkbox =
      await screen.findByRole("checkbox");

    expect(checkbox).toBeChecked();

    await user.click(checkbox);

    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
    });

    expect(updateTodo).toHaveBeenCalledWith(1, {
      completed: false
    });
  });

  test("handles update todo API error", async () => {
    const user = userEvent.setup();

    getTodos.mockResolvedValue([
      {
        id: 1,
        text: "Learn AWS",
        completed: false
      }
    ]);

    updateTodo.mockRejectedValue(
      new Error("Update failed")
    );

    render(<App />);

    const checkbox =
      await screen.findByRole("checkbox");

    await user.click(checkbox);

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to update todo"
    );
  });

  test("deletes todo", async () => {
    const user = userEvent.setup();

    getTodos.mockResolvedValue([
      {
        id: 1,
        text: "Learn Jenkins",
        completed: false
      }
    ]);

    deleteTodo.mockResolvedValue({
      message: "Todo deleted successfully"
    });

    render(<App />);

    expect(
      await screen.findByText("Learn Jenkins")
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Delete" })
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Learn Jenkins")
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByText("No todos found.")
    ).toBeInTheDocument();

    expect(deleteTodo).toHaveBeenCalledWith(1);
  });

  test("handles delete todo API error", async () => {
    const user = userEvent.setup();

    getTodos.mockResolvedValue([
      {
        id: 1,
        text: "Learn Jenkins",
        completed: false
      }
    ]);

    deleteTodo.mockRejectedValue(
      new Error("Delete failed")
    );

    render(<App />);

    expect(
      await screen.findByText("Learn Jenkins")
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Delete" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to delete todo"
    );

    expect(
      screen.getByText("Learn Jenkins")
    ).toBeInTheDocument();
  });
});
