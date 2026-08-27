import { jsx as _jsx } from "react/jsx-runtime";
import { AuditListPage } from './pages/AuditListPage';
import { ROLES } from '@/constants/roles';
export const auditRoutes = [
    { path: 'audit', element: _jsx(AuditListPage, {}) },
];
export const auditAllowedRoles = [ROLES.SYSTEM_ADMIN, ROLES.AUDITOR, ROLES.DIRECTOR];
