import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/design-system/utils/cn';
export const Checkbox = forwardRef(({ className, label, id, ...props }, ref) => (_jsxs("label", { htmlFor: id, className: "flex items-center gap-2 text-sm text-ink-700 cursor-pointer", children: [_jsx("input", { id: id, ref: ref, type: "checkbox", className: cn('h-4 w-4 rounded border-surface-border text-brand-500 focus:ring-brand-400', className), ...props }), label] })));
Checkbox.displayName = 'Checkbox';
