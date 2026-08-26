import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@/design-system/components/Button/Button';
export function EmptyState({ icon, title, description, actionLabel, onAction }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center gap-3 py-16 text-center", children: [icon && _jsx("div", { className: "text-ink-300", children: icon }), _jsx("p", { className: "text-sm font-medium text-ink-900", children: title }), description && _jsx("p", { className: "max-w-sm text-sm text-ink-500", children: description }), actionLabel && onAction && (_jsx(Button, { size: "sm", onClick: onAction, className: "mt-1", children: actionLabel }))] }));
}
