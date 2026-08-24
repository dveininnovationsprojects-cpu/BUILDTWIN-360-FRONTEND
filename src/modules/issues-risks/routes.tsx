import type { RouteObject } from 'react-router-dom';
import { IssuesRisksListPage } from './pages/IssuesRisksListPage';

export const issuesRisksRoutes: RouteObject[] = [
  { path: 'issues', element: <IssuesRisksListPage /> },
];
