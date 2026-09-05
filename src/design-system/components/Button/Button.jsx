import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
const buttonVariants = cva('liquid-glass-button inline-flex items-center justify-center gap-2 rounded font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1', {
    variants: {
        variant: {
            primary: 'gradient-accent text-white hover:shadow-md',
            secondary: 'bg-brand-100 text-brand-800 hover:bg-brand-200',
            outline: 'border border-surface-border text-ink-900 hover:bg-surface-muted',
            ghost: 'text-ink-700 hover:bg-surface-muted',
            danger: 'bg-status-danger text-white hover:bg-status-critical',
        },
        size: {
            sm: 'h-8 px-3 text-xs',
            md: 'h-9 px-4 text-sm',
            lg: 'h-11 px-5 text-base',
        },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
});
export const Button = forwardRef(({ className, variant, size, isLoading, children, disabled, ...props }, ref) => (_jsxs("button", { ref: ref, className: cn(buttonVariants({ variant, size }), className), disabled: disabled || isLoading, ...props, children: [isLoading && _jsx(Loader2, { className: "h-4 w-4 animate-spin" }), children] })));
Button.displayName = 'Button';
