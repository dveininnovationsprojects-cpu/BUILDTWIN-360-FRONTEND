import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { create } from 'zustand';
import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
export const useToastStore = create((set) => ({
    toasts: [],
    push: (message, kind = 'info') => set((s) => ({ toasts: [...s.toasts, { id: Date.now(), message, kind }] })),
    dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
const ICONS = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: XCircle,
    info: Info,
};
const TONE = {
    success: 'text-status-success',
    warning: 'text-status-warning',
    error: 'text-status-danger',
    info: 'text-status-info',
};
export function ToastViewport() {
    const { toasts, dismiss } = useToastStore();
    return (_jsx("div", { className: "fixed bottom-4 right-4 z-[100] flex flex-col gap-2", children: toasts.map((t) => (_jsx(ToastRow, { toast: t, onDismiss: () => dismiss(t.id) }, t.id))) }));
}
function ToastRow({ toast, onDismiss }) {
    const Icon = ICONS[toast.kind];
    useEffect(() => {
        const t = setTimeout(onDismiss, 4000);
        return () => clearTimeout(t);
    }, [onDismiss]);
    return (_jsxs("div", { className: "flex items-center gap-2 rounded-md border border-surface-border bg-surface-base px-4 py-3 shadow-popover", children: [_jsx(Icon, { className: cn('h-4 w-4', TONE[toast.kind]) }), _jsx("span", { className: "text-sm text-ink-900", children: toast.message })] }));
}
