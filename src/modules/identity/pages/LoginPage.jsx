import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { Button, Input } from '@/design-system';
import { useAuthStore } from '@/context/authStore';
import { useToastStore } from '@/design-system/components/Toast/Toast';

export function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const pushToast = useToastStore((s) => s.push);

  const [isSubmitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      usernameOrEmail: '',
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
    setStatusNotice(null);

    const loginId = values.usernameOrEmail?.trim();
    const pass = values.password;

    if (!loginId || !pass) {
      pushToast('Username or email and password are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(loginId, pass);
      pushToast(`Welcome back, ${user.name || user.username}!`, 'success');
      navigate('/dashboard', { replace: true });
      reset();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';

      if (errorMsg.toLowerCase().includes('pending approval')) {
        setStatusNotice({
          type: 'warning',
          title: 'Account Awaiting Approval',
          message: 'Your registration has been submitted and is awaiting approval by the System Administrator or Project Director.',
        });
      } else if (errorMsg.toLowerCase().includes('inactive') || errorMsg.toLowerCase().includes('suspended')) {
        setStatusNotice({
          type: 'error',
          title: 'Account Inactive',
          message: errorMsg,
        });
      }

      pushToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // Quick fill helper for default Admin user (Backend seed in DataInitializer)
  function fillAdminCredentials() {
    setValue('usernameOrEmail', 'admin', { shouldValidate: true });
    setValue('password', 'Admin@123', { shouldValidate: true });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Dynamic Status / Feedback Notice Banner */}
      {statusNotice && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm transition-all ${
            statusNotice.type === 'warning'
              ? 'border-amber-200 bg-amber-50/90 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200'
              : 'border-rose-200 bg-rose-50/90 text-rose-900 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-200'
          }`}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-medium">{statusNotice.title}</p>
            <p className="mt-0.5 text-xs opacity-90">{statusNotice.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-700">
            Username or Email
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-400">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              autoComplete="username"
              placeholder="e.g. admin or rajesh_kumar"
              disabled={isSubmitting}
              className={`w-full rounded-lg border bg-surface-card py-2 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 ${
                errors.usernameOrEmail ? 'border-rose-500' : 'border-surface-border'
              }`}
              {...register('usernameOrEmail', {
                required: 'Username or email is required',
                validate: (v) => (!v || !v.trim() ? 'Username or email is required' : true),
              })}
            />
          </div>
          {errors.usernameOrEmail && (
            <p className="mt-1 text-xs text-rose-600">{errors.usernameOrEmail.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-700">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your account password"
              disabled={isSubmitting}
              className={`w-full rounded-lg border bg-surface-card py-2 pl-9 pr-10 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 ${
                errors.password ? 'border-rose-500' : 'border-surface-border'
              }`}
              {...register('password', {
                required: 'Password is required',
                validate: (v) => (!v || !v.trim() ? 'Password is required' : true),
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-400 hover:text-ink-700 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="auth-submit-btn sign-in-button mt-2 w-full justify-center shadow-md shadow-brand-700/20"
        >
          <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
          {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>

        <div className="flex items-center justify-between pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/register')}
            disabled={isSubmitting}
            className="text-xs text-brand-700 hover:text-brand-800"
          >
            Create new account
          </Button>

          <button
            type="button"
            onClick={fillAdminCredentials}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 underline underline-offset-2 transition-colors hover:text-brand-700"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Fill Admin (Default)
          </button>
        </div>
      </form>
    </div>
  );
}
