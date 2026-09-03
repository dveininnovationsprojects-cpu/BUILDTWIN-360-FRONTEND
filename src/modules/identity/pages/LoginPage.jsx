import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, Input } from '@/design-system';
import { DEMO_ACCOUNTS, ROLE_LABELS, useAuthStore } from '@/context/authStore';
import { useToastStore } from '@/design-system/components/Toast/Toast';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const pushToast = useToastStore((s) => s.push);
  const [isSubmitting, setSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function onSubmit(values) {
    // Validate inputs are not empty
    if (!values.email?.trim() || !values.password?.trim()) {
      pushToast('Email and password are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await login(values.email.trim(), values.password);
      // Success - redirect to dashboard
      navigate('/dashboard', { replace: true });
      // Clear form on success
      reset();
    } catch (err) {
      // Handle different error types
      const errorMessage =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      pushToast(errorMessage, 'error');
      // Keep form values for retry (but not password for security)
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Email or mobile"
        type="email"
        placeholder="Enter your email"
        error={errors.email?.message}
        disabled={isSubmitting}
        {...register('email', {
          required: 'Email is required',
          validate: (value) => {
            if (!value.trim()) return 'Email is required';
            return true;
          },
        })}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        error={errors.password?.message}
        disabled={isSubmitting}
        {...register('password', {
          required: 'Password is required',
          validate: (value) => {
            if (!value || !value.trim()) return 'Password is required';
            return true;
          },
        })}
      />

      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        className="mt-2 w-full"
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => navigate('/register')}
        disabled={isSubmitting}
      >
        Don't have an account? Register
      </Button>

      <details className="rounded-md border border-surface-border bg-surface-subtle px-3 py-2 text-xs text-ink-500">
        <summary className="cursor-pointer font-semibold text-brand-800">
          📋 Demo role access
        </summary>
        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
          {DEMO_ACCOUNTS.map((account) => (
            <div
              key={account.email}
              className="grid grid-cols-[1fr_auto] gap-2 border-t border-surface-border pt-2"
            >
              <span className="text-ink-700">{ROLE_LABELS[account.role]}</span>
              <code className="text-right text-[11px] text-ink-600 whitespace-nowrap">
                {account.email}
                <br />
                {account.password}
              </code>
            </div>
          ))}
        </div>
      </details>
    </form>
  );
}
