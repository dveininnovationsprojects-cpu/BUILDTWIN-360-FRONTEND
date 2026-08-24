import type { RouteObject } from 'react-router-dom';
import { AuditListPage } from './pages/AuditListPage';
import { ROLES } from '@/constants/roles';

export const auditRoutes: RouteObject[] = [
  { path: 'audit', element: <AuditListPage /> },
];

export const auditAllowedRoles = [ROLES.SYSTEM_ADMIN, ROLES.AUDITOR, ROLES.DIRECTOR];
