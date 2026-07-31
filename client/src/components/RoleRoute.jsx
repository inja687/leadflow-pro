import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * Role-based route guard.
 * Wraps child routes to restrict access to specific roles.
 * Redirects unauthorized users to /dashboard.
 *
 * Usage: <RoleRoute roles={["admin"]}><AdminPage /></RoleRoute>
 */
export default function RoleRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
