import { jsx as _jsx } from "react/jsx-runtime";
import { ReportsListPage } from './pages/ReportsListPage';
import { DashboardPage } from './pages/DashboardPage';
export const reportsRoutes = [
    { path: 'dashboard', element: _jsx(DashboardPage, {}) },
    { path: 'reports', element: _jsx(ReportsListPage, {}) },
];
