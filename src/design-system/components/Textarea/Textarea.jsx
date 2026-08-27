import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/design-system/utils/cn';
export const Textarea = forwardRef(({ className, label, error, id, ...props }, ref) => (_jsxs("div", { className: "flex flex-col gap-1.5", children: [label && (_jsx("label", { htmlFor: id, className: "text-sm font-medium text-ink-700", children: label })), _jsx("textarea", { id: id, ref: ref, className: cn('min-h-[88px] rounded border border-surface-border bg-surface-base px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300', 'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400', error && 'border-status-danger focus:ring-status-danger', className), ...props }), error && _jsx("span", { className: "text-xs text-status-danger", children: error })] })));
Textarea.displayName = 'Textarea';
