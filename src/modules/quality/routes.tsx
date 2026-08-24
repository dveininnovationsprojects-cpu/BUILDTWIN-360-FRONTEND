import type { RouteObject } from 'react-router-dom';
import { QualityListPage } from './pages/QualityListPage';

export const qualityRoutes: RouteObject[] = [
  { path: 'quality', element: <QualityListPage /> },
];
