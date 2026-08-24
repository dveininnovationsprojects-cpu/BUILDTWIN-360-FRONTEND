import type { RouteObject } from 'react-router-dom';
import { ReportsListPage } from './pages/ReportsListPage';
import { DashboardPage } from './pages/DashboardPage';

export const reportsRoutes: RouteObject[] = [
  { path: 'dashboard', element: <DashboardPage /> },
  { path: 'reports', element: <ReportsListPage /> },
];
