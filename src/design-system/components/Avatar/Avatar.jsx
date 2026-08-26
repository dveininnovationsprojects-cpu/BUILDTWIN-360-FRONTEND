import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/design-system/utils/cn';
export function Avatar({ name, className }) {
    const initials = name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    return (_jsx("div", { className: cn('flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800', className), children: initials }));
}
