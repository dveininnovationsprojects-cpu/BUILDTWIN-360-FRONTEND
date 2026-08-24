import { Routes, Route, Navigate, type RouteObject } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import { AuthLayout } from '@/layouts/AuthLayout';
import { useAuthStore } from '@/context/authStore';
import { ProtectedRoute } from './ProtectedRoute';

import { identityPublicRoutes, identityRoutes, identityAllowedRoles } from '@/modules/identity/routes';
import { projectsRoutes } from '@/modules/projects/routes';
import { wbsScheduleRoutes } from '@/modules/wbs-schedule/routes';
import { progressDprRoutes } from '@/modules/progress-dpr/routes';
import { labourContractorsRoutes } from '@/modules/labour-contractors/routes';
import { materialsInventoryRoutes } from '@/modules/materials-inventory/routes';
import { procurementRoutes } from '@/modules/procurement/routes';
import { costControlRoutes, costControlAllowedRoles } from '@/modules/cost-control/routes';
import { qualityRoutes } from '@/modules/quality/routes';
import { issuesRisksRoutes } from '@/modules/issues-risks/routes';
import { equipmentRoutes } from '@/modules/equipment/routes';
import { documentsRoutes } from '@/modules/documents/routes';
import { notificationsRoutes } from '@/modules/notifications/routes';
import { analyticsRoutes, analyticsAllowedRoles } from '@/modules/analytics/routes';
import { reportsRoutes } from '@/modules/reports/routes';
import { auditRoutes, auditAllowedRoles } from '@/modules/audit/routes';

function toElements(routes: RouteObject[]) {
  return routes.map((r) => <Route key={r.path ?? crypto.randomUUID()} path={r.path} element={r.element as React.ReactElement} />);
}

function RootRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Public — auth module */}
      <Route element={<AuthLayout />}>{toElements(identityPublicRoutes)}</Route>

      {/* Authenticated shell — every domain module mounted here, 1:1 with the backend modules */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          {toElements(reportsRoutes)}
          {toElements(projectsRoutes)}
          {toElements(wbsScheduleRoutes)}
          {toElements(progressDprRoutes)}
          {toElements(labourContractorsRoutes)}
          {toElements(materialsInventoryRoutes)}
          {toElements(procurementRoutes)}
          {toElements(qualityRoutes)}
          {toElements(issuesRisksRoutes)}
          {toElements(equipmentRoutes)}
          {toElements(documentsRoutes)}
          {toElements(notificationsRoutes)}
        </Route>
      </Route>

      {/* Role-restricted subtrees */}
      <Route element={<ProtectedRoute roles={costControlAllowedRoles} />}>
        <Route element={<AppShell />}>{toElements(costControlRoutes)}</Route>
      </Route>
      <Route element={<ProtectedRoute roles={analyticsAllowedRoles} />}>
        <Route element={<AppShell />}>{toElements(analyticsRoutes)}</Route>
      </Route>
      <Route element={<ProtectedRoute roles={auditAllowedRoles} />}>
        <Route element={<AppShell />}>{toElements(auditRoutes)}</Route>
      </Route>
      <Route element={<ProtectedRoute roles={identityAllowedRoles} />}>
        <Route element={<AppShell />}>{toElements(identityRoutes)}</Route>
      </Route>

      <Route path="/403" element={<div className="p-8">You do not have access to this page.</div>} />
      <Route path="*" element={<div className="p-8">Page not found.</div>} />
    </Routes>
  );
}
