import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import { ToastViewport } from '@/design-system/components/Toast/Toast';
export function AuthLayout() {
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex min-h-screen items-center justify-center bg-brand-900 px-4", children: _jsxs("div", { className: "w-full max-w-sm rounded-lg bg-surface-base p-8 shadow-popover", children: [_jsxs("div", { className: "mb-6 flex flex-col items-center gap-2", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded bg-brand-500 font-bold text-white", children: "B" }), _jsx("h1", { className: "text-xl font-semibold text-brand-900", children: "BuildTwin 360" }), _jsx("p", { className: "text-sm text-ink-500", children: "Construction Progress Intelligence & Site Control" })] }), _jsx(Outlet, {})] }) }), _jsx(ToastViewport, {})] }));
}
