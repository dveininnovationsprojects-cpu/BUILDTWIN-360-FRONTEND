import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/design-system/utils/cn';
export function Card({ className, ...props }) {
    return _jsx("div", { className: cn('surface-panel p-5', className), ...props });
}
export function CardHeader({ className, ...props }) {
    return _jsx("div", { className: cn('mb-4 flex items-center justify-between', className), ...props });
}
export function CardTitle({ className, ...props }) {
    return _jsx("h3", { className: cn('text-lg font-semibold text-brand-900', className), ...props });
}
