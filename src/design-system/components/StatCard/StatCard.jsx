import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/design-system/utils/cn';
/** KPI tile for executive/project/site dashboards (Physical Progress %, SPI, CPI, open issues, etc). */
export function StatCard({ label, value, delta, deltaTone = 'neutral', icon }) {
    const deltaClass = {
        success: 'text-status-success',
        warning: 'text-status-warning',
        danger: 'text-status-danger',
        neutral: 'text-ink-500',
    }[deltaTone];
    return (_jsxs("div", { className: "surface-panel p-4 flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-medium uppercase tracking-wide text-ink-500", children: label }), icon && _jsx("span", { className: "text-brand-500", children: icon })] }), _jsx("span", { className: "text-2xl font-semibold text-brand-900", children: value }), delta && _jsx("span", { className: cn('text-xs font-medium', deltaClass), children: delta })] }));
}
