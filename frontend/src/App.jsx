import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Tasks from "./pages/Tasks";
import { useAuth } from "./hooks/useAuth";

function ProtectedRoute({ children }) {
  const { isAuthed } = useAuth();
  console.log("[ProtectedRoute] isAuthed =", isAuthed);   // <— add
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/tasks/" replace />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/tasks/"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route path="/tasks" element={<Navigate to="/tasks/" replace />} />
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </BrowserRouter>
  );
}