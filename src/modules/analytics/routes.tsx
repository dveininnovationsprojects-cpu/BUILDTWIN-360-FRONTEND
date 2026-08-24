import type { RouteObject } from 'react-router-dom';
import { AnalyticsListPage } from './pages/AnalyticsListPage';
import { ROLES } from '@/constants/roles';

export const analyticsRoutes: RouteObject[] = [
  { path: 'analytics', element: <AnalyticsListPage /> },
];

export const analyticsAllowedRoles = [ROLES.DIRECTOR, ROLES.PROJECT_MANAGER, ROLES.DATA_ANALYST];
