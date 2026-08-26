import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, Input } from '@/design-system';
import { DEMO_ACCOUNTS, ROLE_LABELS, useAuthStore } from '@/context/authStore';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import type { LoginPayload } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const pushToast = useToastStore((s) => s.push);
  const [isSubmitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>();

  async function onSubmit(values: LoginPayload) {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (err) {
      pushToast('Invalid email or password.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Email or mobile"
        type="text"
        error={errors.email?.message}
        {...register('email', { required: 'Email is required' })}
      />
      <Input
        label="Password"
        type="password"
        error={errors.password?.message}
        {...register('password', { required: 'Password is required' })}
      />
      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Sign in
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/register')}>
        Register
      </Button>
      <details className="rounded-md border border-surface-border bg-surface-subtle px-3 py-2 text-xs text-ink-500">
        <summary className="cursor-pointer font-semibold text-brand-800">Demo role access</summary>
        <div className="mt-3 space-y-2">
          {DEMO_ACCOUNTS.map((account) => (
            <div key={account.email} className="grid grid-cols-[1fr_auto] gap-2 border-t border-surface-border pt-2">
              <span>{ROLE_LABELS[account.role]}</span>
              <code className="text-right text-[11px] text-ink-700">{account.email}<br />{account.password}</code>
            </div>
          ))}
        </div>
      </details>
    </form>
  );
}
