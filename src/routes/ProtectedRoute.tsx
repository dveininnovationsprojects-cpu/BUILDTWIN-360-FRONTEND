import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, useHasRole } from '@/context/authStore';
import type { Role } from '@/constants/roles';

/**
 * Local/demo mode: allow the home/dashboard shell to render even when no session exists,
 * while still protecting role-gated routes when access checks are required.
 */
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasRole = useHasRole(...(roles ?? []));
  const allowed = roles ? hasRole : true;

  if (!roles && !isAuthenticated) return <Outlet />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowed) return <Navigate to="/403" replace />;

  return <Outlet />;
}
