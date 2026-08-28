import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);
    if (!open)
        return null;
    const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
    return createPortal(_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-brand-950/40 p-4", children: _jsxs("div", { className: cn('flex max-h-[90vh] w-full flex-col rounded-lg bg-surface-base shadow-popover', widths[size]), children: [_jsxs("div", { className: "flex shrink-0 items-center justify-between border-b border-surface-border px-5 py-4", children: [_jsx("h3", { className: "text-lg font-semibold text-brand-900", children: title }), _jsx("button", { onClick: onClose, className: "text-ink-500 hover:text-ink-900", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsx("div", { className: "min-h-0 flex-1 overflow-y-auto px-5 py-4", children: children }), footer && _jsx("div", { className: "flex shrink-0 justify-end gap-2 border-t border-surface-border px-5 py-4", children: footer })] }) }), document.body);
}
