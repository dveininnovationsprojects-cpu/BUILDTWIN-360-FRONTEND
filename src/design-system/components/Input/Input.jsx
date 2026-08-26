import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
export const Input = forwardRef(({ className, label, error, hint, id, ...props }, ref) => {
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const inputId = id ?? props.name;
    const isPassword = props.type === 'password';
    const inputType = isPassword && isPasswordVisible ? 'text' : props.type;
    return (_jsxs("div", { className: "flex flex-col gap-1.5", children: [label && (_jsx("label", { htmlFor: inputId, className: "text-sm font-medium text-ink-700", children: label })), _jsxs("div", { className: "relative", children: [_jsx("input", { ...props, id: inputId, ref: ref, type: inputType, className: cn('h-9 w-full rounded border border-surface-border bg-surface-base px-3 text-sm text-ink-900 placeholder:text-ink-300', isPassword && 'pr-10', 'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400', error && 'border-status-danger focus:ring-status-danger', className) }), isPassword && (_jsx("button", { type: "button", onClick: () => setPasswordVisible((visible) => !visible), "aria-label": isPasswordVisible ? 'Hide password' : 'Show password', title: isPasswordVisible ? 'Hide password' : 'Show password', className: "absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400", children: isPasswordVisible ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) }))] }), hint && !error && _jsx("span", { className: "text-xs text-ink-500", children: hint }), error && _jsx("span", { className: "text-xs text-status-danger", children: error })] }));
});
Input.displayName = 'Input';
