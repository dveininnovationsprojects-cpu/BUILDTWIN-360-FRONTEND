import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, Input } from '@/design-system';
import { useAuthStore } from '@/context/authStore';
import { useToastStore } from '@/design-system/components/Toast/Toast';
export function RegisterPage() {
    const navigate = useNavigate();
    const registerAccount = useAuthStore((state) => state.register);
    const pushToast = useToastStore((state) => state.push);
    const [isSubmitting, setSubmitting] = useState(false);
    const { register, handleSubmit, watch, formState: { errors }, } = useForm();
    async function onSubmit(values) {
        setSubmitting(true);
        try {
            await registerAccount(values.name, values.email, values.password);
            pushToast('Account created. You can sign in now.', 'success');
            navigate('/login');
        }
        catch (error) {
            pushToast(error instanceof Error ? error.message : 'Unable to create account.', 'error');
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "flex flex-col gap-4", children: [_jsx(Input, { label: "Full name", error: errors.name?.message, ...register('name', { required: 'Name is required' }) }), _jsx(Input, { label: "Email", type: "email", error: errors.email?.message, ...register('email', { required: 'Email is required' }) }), _jsx(Input, { label: "Password", type: "password", error: errors.password?.message, hint: "Use at least 8 characters. New accounts start with site engineer access.", ...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                }) }), _jsx(Input, { label: "Confirm password", type: "password", error: errors.confirmPassword?.message, ...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === watch('password') || 'Passwords do not match',
                }) }), _jsx(Button, { type: "submit", isLoading: isSubmitting, className: "mt-2 w-full", children: "Create account" }), _jsx(Button, { type: "button", variant: "ghost", className: "w-full", onClick: () => navigate('/login'), children: "Back to sign in" })] }));
}
