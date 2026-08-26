import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, Input } from '@/design-system';
import { DEMO_ACCOUNTS, ROLE_LABELS, useAuthStore } from '@/context/authStore';
import { useToastStore } from '@/design-system/components/Toast/Toast';
export function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.login);
    const pushToast = useToastStore((s) => s.push);
    const [isSubmitting, setSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, } = useForm();
    async function onSubmit(values) {
        setSubmitting(true);
        try {
            await login(values.email, values.password);
            navigate('/dashboard');
        }
        catch (err) {
            pushToast('Invalid email or password.', 'error');
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "flex flex-col gap-4", children: [_jsx(Input, { label: "Email or mobile", type: "text", error: errors.email?.message, ...register('email', { required: 'Email is required' }) }), _jsx(Input, { label: "Password", type: "password", error: errors.password?.message, ...register('password', { required: 'Password is required' }) }), _jsx(Button, { type: "submit", isLoading: isSubmitting, className: "mt-2 w-full", children: "Sign in" }), _jsx(Button, { type: "button", variant: "outline", className: "w-full", onClick: () => navigate('/register'), children: "Register" }), _jsxs("details", { className: "rounded-md border border-surface-border bg-surface-subtle px-3 py-2 text-xs text-ink-500", children: [_jsx("summary", { className: "cursor-pointer font-semibold text-brand-800", children: "Demo role access" }), _jsx("div", { className: "mt-3 space-y-2", children: DEMO_ACCOUNTS.map((account) => (_jsxs("div", { className: "grid grid-cols-[1fr_auto] gap-2 border-t border-surface-border pt-2", children: [_jsx("span", { children: ROLE_LABELS[account.role] }), _jsxs("code", { className: "text-right text-[11px] text-ink-700", children: [account.email, _jsx("br", {}), account.password] })] }, account.email))) })] })] }));
}
