import type { RouteObject } from 'react-router-dom';
import { LabourContractorsListPage } from './pages/LabourContractorsListPage';

export const labourContractorsRoutes: RouteObject[] = [
  { path: 'labour', element: <LabourContractorsListPage /> },
];
