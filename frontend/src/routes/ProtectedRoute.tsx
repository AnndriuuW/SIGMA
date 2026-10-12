import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  roles?: string[];
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { estaAutenticado, usuario } = useAuth();

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(usuario?.rol ?? "")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
