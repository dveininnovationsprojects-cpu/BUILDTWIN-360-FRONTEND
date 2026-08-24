import type { RouteObject } from 'react-router-dom';
import { EquipmentListPage } from './pages/EquipmentListPage';

export const equipmentRoutes: RouteObject[] = [
  { path: 'equipment', element: <EquipmentListPage /> },
];
