import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("Todo App", () => {
  test("renders application", () => {
    render(<App />);

    expect(screen.getByText("Todo App")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter todo")).toBeInTheDocument();
    expect(screen.getByText("No todos found.")).toBeInTheDocument();
  });

  test("does not add empty todo", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByText("No todos found.")).toBeInTheDocument();
  });

  test("does not add whitespace todo", async () => {
    const user = userEvent.setup();

    render(<App />);

    const input = screen.getByLabelText("todo input");

    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByText("No todos found.")).toBeInTheDocument();
  });

  test("adds todo", async () => {
    const user = userEvent.setup();

    render(<App />);

    const input = screen.getByLabelText("todo input");

    await user.type(input, "Learn Docker");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByText("Learn Docker")).toBeInTheDocument();
    expect(screen.queryByText("No todos found.")).not.toBeInTheDocument();
  });

  test("trims todo text", async () => {
    const user = userEvent.setup();

    render(<App />);

    const input = screen.getByLabelText("todo input");

    await user.type(input, "  Learn Kubernetes  ");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByText("Learn Kubernetes")).toBeInTheDocument();
  });

  test("completes todo", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.type(
      screen.getByLabelText("todo input"),
      "Learn AWS"
    );

    await user.click(screen.getByRole("button", { name: "Add" }));

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  test("uncompletes todo", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.type(
      screen.getByLabelText("todo input"),
      "Learn Terraform"
    );

    await user.click(screen.getByRole("button", { name: "Add" }));

    const checkbox = screen.getByRole("checkbox");

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  test("deletes todo", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.type(
      screen.getByLabelText("todo input"),
      "Learn Jenkins"
    );

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByText("Learn Jenkins")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Delete" })
    );

    expect(screen.queryByText("Learn Jenkins")).not.toBeInTheDocument();
    expect(screen.getByText("No todos found.")).toBeInTheDocument();
  });
});