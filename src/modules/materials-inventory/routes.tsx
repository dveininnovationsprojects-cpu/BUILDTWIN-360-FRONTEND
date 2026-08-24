import type { RouteObject } from 'react-router-dom';
import { MaterialsInventoryListPage } from './pages/MaterialsInventoryListPage';

export const materialsInventoryRoutes: RouteObject[] = [
  { path: 'materials', element: <MaterialsInventoryListPage /> },
];
