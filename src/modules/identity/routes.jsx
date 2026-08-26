import { jsx as _jsx } from "react/jsx-runtime";
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UsersPage } from './pages/UsersPage';
import { ROLES } from '@/constants/roles';
// Public (unauthenticated) route — mounted under AuthLayout in AppRoutes.
export const identityPublicRoutes = [
    { path: 'login', element: _jsx(LoginPage, {}) },
    { path: 'register', element: _jsx(RegisterPage, {}) },
];
// Admin-only route — mounted under ProtectedRoute in AppRoutes.
export const identityRoutes = [{ path: 'users', element: _jsx(UsersPage, {}) }];
export const identityAllowedRoles = [ROLES.SYSTEM_ADMIN];
