import type { RouteObject } from 'react-router-dom';
import { DocumentsListPage } from './pages/DocumentsListPage';

export const documentsRoutes: RouteObject[] = [
  { path: 'documents', element: <DocumentsListPage /> },
];
