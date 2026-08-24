import type { RouteObject } from 'react-router-dom';
import { ProcurementListPage } from './pages/ProcurementListPage';

export const procurementRoutes: RouteObject[] = [
  { path: 'procurement', element: <ProcurementListPage /> },
];
