// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <p className="text-center mt-10">Checking auth...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children; // ✅ children ছাড়া অন্য কিছু render করবেন না
}
