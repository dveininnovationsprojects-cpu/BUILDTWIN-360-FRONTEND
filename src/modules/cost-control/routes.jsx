import { jsx as _jsx } from "react/jsx-runtime";
import { CostControlListPage } from './pages/CostControlListPage';
import { ROLES } from '@/constants/roles';
export const costControlRoutes = [
    { path: 'cost', element: _jsx(CostControlListPage, {}) },
];
// FR-075: commercial data carries separate approval permissions from ordinary progress data.
export const costControlAllowedRoles = [ROLES.DIRECTOR, ROLES.PROJECT_MANAGER, ROLES.COST_COORDINATOR];
