import { jsx as _jsx } from "react/jsx-runtime";
import { Loader2 } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
export function Spinner({ className }) {
    return _jsx(Loader2, { className: cn('h-5 w-5 animate-spin text-brand-500', className) });
}
