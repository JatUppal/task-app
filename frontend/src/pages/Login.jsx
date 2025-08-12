import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login, register, authError } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const ok = mode === "signin"
      ? await login(email, password)
      : await register(email, password);
    setSubmitting(false);
    if (ok) navigate("/tasks", { replace: true });
  }

  return (
    <div style={{ maxWidth: 360, margin: "64px auto", padding: 16 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setMode("signin")}
          disabled={mode === "signin"}
          style={{ padding: "6px 10px" }}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          disabled={mode === "signup"}
          style={{ padding: "6px 10px" }}
        >
          Sign up
        </button>
      </div>

      <h1 style={{ marginBottom: 16 }}>{mode === "signin" ? "Sign in" : "Create your account"}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {authError && (
          <div style={{ color: "crimson", marginBottom: 12 }}>{authError}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{ padding: "8px 12px", width: "100%" }}
        >
          {submitting
            ? mode === "signin" ? "Signing in…" : "Creating account…"
            : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>
    </div>
  );
}
