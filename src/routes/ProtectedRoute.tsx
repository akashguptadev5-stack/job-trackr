import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Still checking session — show nothing (or a spinner)
  if (loading) return <div className="loading-screen" />;

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in → render the child route
  return <Outlet />;
}