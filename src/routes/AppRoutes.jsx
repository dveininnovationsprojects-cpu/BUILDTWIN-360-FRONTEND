import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import { AuthLayout } from '@/layouts/AuthLayout';
import { useAuthStore } from '@/context/authStore';
import { ProtectedRoute } from './ProtectedRoute';
import { identityPublicRoutes, identityRoutes, identityAllowedRoles, identityAccountRoutes } from '@/modules/identity/routes';
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
function toElements(routes) {
    return routes.map((r) => _jsx(Route, { path: r.path, element: r.element }, r.path ?? crypto.randomUUID()));
}
function RootRedirect() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return _jsx(Navigate, { to: isAuthenticated ? '/dashboard' : '/login', replace: true });
}
export function AppRoutes() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(RootRedirect, {}) }), _jsx(Route, { element: _jsx(AuthLayout, {}), children: toElements(identityPublicRoutes) }), _jsx(Route, { element: _jsx(ProtectedRoute, {}), children: _jsxs(Route, { element: _jsx(AppShell, {}), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), toElements(reportsRoutes), toElements(projectsRoutes), toElements(wbsScheduleRoutes), toElements(progressDprRoutes), toElements(labourContractorsRoutes), toElements(materialsInventoryRoutes), toElements(procurementRoutes), toElements(qualityRoutes), toElements(issuesRisksRoutes), toElements(equipmentRoutes), toElements(documentsRoutes), toElements(notificationsRoutes), toElements(identityAccountRoutes)] }) }), _jsx(Route, { element: _jsx(ProtectedRoute, { roles: costControlAllowedRoles }), children: _jsx(Route, { element: _jsx(AppShell, {}), children: toElements(costControlRoutes) }) }), _jsx(Route, { element: _jsx(ProtectedRoute, { roles: analyticsAllowedRoles }), children: _jsx(Route, { element: _jsx(AppShell, {}), children: toElements(analyticsRoutes) }) }), _jsx(Route, { element: _jsx(ProtectedRoute, { roles: auditAllowedRoles }), children: _jsx(Route, { element: _jsx(AppShell, {}), children: toElements(auditRoutes) }) }), _jsx(Route, { element: _jsx(ProtectedRoute, { roles: identityAllowedRoles }), children: _jsx(Route, { element: _jsx(AppShell, {}), children: toElements(identityRoutes) }) }), _jsx(Route, { path: "/403", element: _jsx("div", { className: "p-8", children: "You do not have access to this page." }) }), _jsx(Route, { path: "*", element: _jsx("div", { className: "p-8", children: "Page not found." }) })] }));
}
