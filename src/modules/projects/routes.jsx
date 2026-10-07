import { ProjectsListPage } from './pages/ProjectsListPage';

export const projectsRoutes = [
  // /projects → main projects list + hierarchy workspace (handled inline via state)
  { path: 'projects', element: <ProjectsListPage /> },
];
