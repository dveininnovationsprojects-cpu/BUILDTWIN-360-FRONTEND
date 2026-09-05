import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastViewport } from '@/design-system/components/Toast/Toast';
export function AppShell() {
    const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia('(min-width: 768px)').matches);
    const closeMobileSidebar = () => {
        if (window.matchMedia('(max-width: 767px)').matches)
            setSidebarOpen(false);
    };
    return (_jsxs("div", { className: "flex h-screen bg-surface-subtle", children: [_jsx(Sidebar, { isOpen: sidebarOpen, onToggle: () => setSidebarOpen((open) => !open), onNavigate: closeMobileSidebar }), _jsxs("div", { className: "flex flex-1 flex-col overflow-hidden bg-surface-subtle", children: [_jsx(Topbar, { onMenuToggle: () => setSidebarOpen((open) => !open) }), _jsxs("main", { className: "flex-1 overflow-y-auto bg-surface-subtle p-4 sm:p-6", children: [_jsx(Outlet, {})] })] }), _jsx(ToastViewport, {})] }));
}
