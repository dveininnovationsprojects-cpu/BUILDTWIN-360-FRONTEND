import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UsersPage } from './pages/UsersPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ROLES } from '@/constants/roles';

// Public (unauthenticated) route — mounted under AuthLayout in AppRoutes.
export const identityPublicRoutes = [
  { path: 'login', element: <LoginPage /> },
  { path: 'register', element: <RegisterPage /> },
];

// Admin-only route — mounted under ProtectedRoute in AppRoutes.
export const identityRoutes = [{ path: 'users', element: <UsersPage /> }];
export const identityAllowedRoles = [ROLES.SYSTEM_ADMIN];

// Any authenticated user's own account pages — mounted alongside the
// unrestricted module routes in AppRoutes (no role gate).
export const identityAccountRoutes = [
  { path: 'profile', element: <ProfilePage /> },
  { path: 'settings', element: <SettingsPage /> },
];
