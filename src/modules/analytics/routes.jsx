import { jsx as _jsx } from "react/jsx-runtime";
import { AnalyticsListPage } from './pages/AnalyticsListPage';
import { ROLES } from '@/constants/roles';
export const analyticsRoutes = [
    { path: 'analytics', element: _jsx(AnalyticsListPage, {}) },
];
export const analyticsAllowedRoles = [ROLES.DIRECTOR, ROLES.PROJECT_MANAGER, ROLES.DATA_ANALYST];
