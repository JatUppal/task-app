import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const isAuthed = !!token;

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    async function validateToken() {
      if (!token) return;
      try {
        // hit a backend endpoint that confirms token validity
        await api.get("/auth/me");
      } catch {
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      }
    }
    validateToken();
    return () => { cancelled = true; };
  }, [token]);

  async function login(email, password) {
    setAuthError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setToken(data.access_token);
      setUser({ id: "me" });
      return true;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 401 ? "Invalid email or password" : "Login failed");
      setAuthError(msg);
      return false;
    }
  }

  // register -> then log in
  async function register(email, password) {
    setAuthError(null);
    try {
      await api.post("/auth/register", { email, password });
      // auto-login after successful signup
      return await login(email, password);
    } catch (err) {
      const msg = err?.response?.data?.message || "Sign up failed";
      setAuthError(msg);
      return false;
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  // auto-logout on 401 globally
  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error?.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, [token]); // reattach when token changes

  const value = useMemo(
    () => ({ user, token, isAuthed, authError, login, register, logout }),
    [user, token, isAuthed, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
