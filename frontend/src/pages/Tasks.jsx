import { useEffect, useState } from "react";
import api from "../api/client";
import TaskForm from "../components/TaskForm";
import { useAuth } from "../hooks/useAuth";

export default function Tasks() {
  const { logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  async function fetchTasks() {
    setErr("");
    try {
      const { data } = await api.get("/tasks");
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
        if (e?.response?.status === 401) {
            logout();
            return; // don't set error; router will kick to /login
        }
        setErr("Failed to load tasks");
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createTask(title) {
    const { data } = await api.post("/tasks", { title });
    // prepend newest (API returns created task)
    setTasks((prev) => [data, ...prev]);
  }

  async function toggleDone(id, nextDone) {
    // optimistic UI
    setTasks((prev) => prev.map(t => t.id === id ? { ...t, done: nextDone } : t));
    try {
      await api.put(`/tasks/${id}`, { done: nextDone });
    } catch (e) {
      // revert on failure
      setTasks((prev) => prev.map(t => t.id === id ? { ...t, done: !nextDone } : t));
    }
  }

  async function deleteTask(id) {
    // optimistic remove
    const prev = tasks;
    setTasks((p) => p.filter(t => t.id !== id));
    try {
      await api.delete(`/tasks/${id}`);
    } catch (e) {
      setTasks(prev); // revert on failure
    }
  }
  // enter edit mode
  function startEdit(t) {
    setEditingId(t.id);
    setEditingTitle(t.title);
  }

  // cancel edit
  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  // save edit
  async function saveEdit(id) {
    const title = editingTitle.trim();
    if (!title) return; // show validation
    // optimistic update
    const prev = tasks;
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, title } : t)));
    setEditingId(null);
    setEditingTitle("");
    try {
      await api.put(`/tasks/${id}`, { title });
    } catch {
      // revert on failure
      setTasks(prev);
    }
  }

  // keyboard handler for input
  function onEditKeyDown(e, id) {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit(id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>My Tasks</h1>
        <button onClick={logout} style={{ padding: "6px 10px" }}>
          Logout
        </button>
      </div>

      <TaskForm onCreate={createTask} />

      {loading && <div>Loading…</div>}
      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      {!loading && tasks.length === 0 && (
        <div style={{ color: "#666" }}>No tasks yet. Add your first one!</div>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((t) => {
          const isEditing = editingId === t.id;
          return (
            <li
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <input
                type="checkbox"
                checked={!!t.done}
                onChange={(e) => toggleDone(t.id, e.target.checked)}
              />

              {/* TITLE / EDIT INPUT */}
              <div style={{ flex: 1 }}>
                {isEditing ? (
                  <input
                    autoFocus
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => onEditKeyDown(e, t.id)}
                    style={{ width: "100%", padding: 6 }}
                  />
                ) : (
                  <span style={{ textDecoration: t.done ? "line-through" : "none" }}>
                    {t.title}
                  </span>
                )}
              </div>

              {/* NEW: Edit/Save/Cancel + existing Delete */}
              {isEditing ? (
                <>
                  <button onClick={() => saveEdit(t.id)} style={{ padding: "4px 8px" }}>
                    Save
                  </button>
                  <button onClick={cancelEdit} style={{ padding: "4px 8px" }}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(t)} style={{ padding: "4px 8px" }}>
                    Edit
                  </button>
                  <button onClick={() => deleteTask(t.id)} style={{ padding: "4px 8px" }}>
                    Delete
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
