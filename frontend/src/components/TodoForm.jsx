import { useState } from "react";

function TodoForm({ onAdd }) {
  const [text, setText] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    onAdd(trimmedText);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} aria-label="todo form">
      <input
        aria-label="todo input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Enter todo"
      />

      <button type="submit">Add</button>
    </form>
  );
}

export default TodoForm;