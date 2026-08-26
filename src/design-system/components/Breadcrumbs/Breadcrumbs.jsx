import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
/** Reflects the project hierarchy: Project > Building > Floor > Zone > Activity. */
export function Breadcrumbs({ items }) {
    return (_jsx("nav", { className: "flex items-center gap-1.5 text-sm text-ink-500", children: items.map((item, i) => (_jsxs("span", { className: "flex items-center gap-1.5", children: [item.to ? (_jsx(Link, { to: item.to, className: "hover:text-brand-600", children: item.label })) : (_jsx("span", { className: "text-ink-900 font-medium", children: item.label })), i < items.length - 1 && _jsx(ChevronRight, { className: "h-3.5 w-3.5" })] }, i))) }));
}
