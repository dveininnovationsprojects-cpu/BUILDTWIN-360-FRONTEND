import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, useHasRole } from '@/context/authStore';
/**
 * Local/demo mode: allow the home/dashboard shell to render even when no session exists,
 * while still protecting role-gated routes when access checks are required.
 */
export function ProtectedRoute({ roles }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const hasRole = useHasRole(...(roles ?? []));
    
    // If not authenticated, redirect to login page
    if (!isAuthenticated)
        return _jsx(Navigate, { to: "/login", replace: true });
    
    // If specific roles are required, check if user has the required role
    if (roles && !hasRole)
        return _jsx(Navigate, { to: "/403", replace: true });
    
    return _jsx(Outlet, {});
}
