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
    const allowed = roles ? hasRole : true;
    if (!roles && !isAuthenticated)
        return _jsx(Outlet, {});
    if (!isAuthenticated)
        return _jsx(Navigate, { to: "/login", replace: true });
    if (!allowed)
        return _jsx(Navigate, { to: "/403", replace: true });
    return _jsx(Outlet, {});
}
