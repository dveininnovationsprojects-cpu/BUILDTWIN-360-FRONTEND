import type { RouteObject } from 'react-router-dom';
import { ProjectsListPage } from './pages/ProjectsListPage';

export const projectsRoutes: RouteObject[] = [
  { path: 'projects', element: <ProjectsListPage /> },
];
