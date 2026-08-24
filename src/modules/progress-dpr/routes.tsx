import type { RouteObject } from 'react-router-dom';
import { ProgressDprListPage } from './pages/ProgressDprListPage';

export const progressDprRoutes: RouteObject[] = [
  { path: 'dpr', element: <ProgressDprListPage /> },
];
