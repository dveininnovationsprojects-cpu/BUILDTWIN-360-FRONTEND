import type { RouteObject } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { UsersPage } from './pages/UsersPage';
import { ROLES } from '@/constants/roles';

// Public (unauthenticated) route — mounted under AuthLayout in AppRoutes.
export const identityPublicRoutes: RouteObject[] = [{ path: 'login', element: <LoginPage /> }];

// Admin-only route — mounted under ProtectedRoute in AppRoutes.
export const identityRoutes: RouteObject[] = [{ path: 'users', element: <UsersPage /> }];

export const identityAllowedRoles = [ROLES.SYSTEM_ADMIN];
