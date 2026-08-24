import type { RouteObject } from 'react-router-dom';
import { WbsScheduleListPage } from './pages/WbsScheduleListPage';

export const wbsScheduleRoutes: RouteObject[] = [
  { path: 'wbs-schedule', element: <WbsScheduleListPage /> },
];
