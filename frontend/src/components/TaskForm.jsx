import { useState } from "react";

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setSubmitting(true);
    setError("");
    try {
      await onCreate(t);
      setTitle("");
    } catch (err) {
      setError(err?.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <input
        type="text"
        placeholder="Add a task…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ flex: 1, padding: 8 }}
      />
      <button type="submit" disabled={submitting} style={{ padding: "8px 12px" }}>
        {submitting ? "Adding…" : "Add"}
      </button>
      {error && <span style={{ color: "crimson" }}>{error}</span>}
    </form>
  );
}
