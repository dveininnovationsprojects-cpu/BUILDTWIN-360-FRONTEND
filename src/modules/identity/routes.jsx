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

// Director / Management and System Administrator only — mounted under
// ProtectedRoute in AppRoutes (FR-002: create, activate, deactivate and
// reset user accounts). Also embedded in Settings — see SettingsPage.
export const identityRoutes = [{ path: 'users', element: <UsersPage /> }];
export const identityAllowedRoles = [ROLES.SYSTEM_ADMIN, ROLES.DIRECTOR];

// Any authenticated user's own account pages — mounted alongside the
// unrestricted module routes in AppRoutes (no role gate).
export const identityAccountRoutes = [
  { path: 'profile', element: <ProfilePage /> },
  { path: 'settings', element: <SettingsPage /> },
];
