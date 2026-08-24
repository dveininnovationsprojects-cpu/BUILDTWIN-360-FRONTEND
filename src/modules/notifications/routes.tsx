import type { RouteObject } from 'react-router-dom';
import { NotificationsListPage } from './pages/NotificationsListPage';

export const notificationsRoutes: RouteObject[] = [
  { path: 'notifications', element: <NotificationsListPage /> },
];
