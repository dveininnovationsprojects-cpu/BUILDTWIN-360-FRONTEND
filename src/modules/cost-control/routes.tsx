import type { RouteObject } from 'react-router-dom';
import { CostControlListPage } from './pages/CostControlListPage';
import { ROLES } from '@/constants/roles';

export const costControlRoutes: RouteObject[] = [
  { path: 'cost', element: <CostControlListPage /> },
];

// FR-075: commercial data carries separate approval permissions from ordinary progress data.
export const costControlAllowedRoles = [ROLES.DIRECTOR, ROLES.PROJECT_MANAGER, ROLES.COST_COORDINATOR];
