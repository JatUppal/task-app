import { useEffect, useState } from "react";
import api from "../api/client";
import TaskForm from "../components/TaskForm";
import { useAuth } from "../hooks/useAuth";

export default function Tasks() {
  const { logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      {/* Top bar */}
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
        {tasks.map((t) => (
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
            <div style={{ flex: 1, textDecoration: t.done ? "line-through" : "none" }}>
              {t.title}
            </div>
            <button onClick={() => deleteTask(t.id)} style={{ padding: "4px 8px" }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
