import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, CheckCircle2, Shield, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, Select } from '@/design-system';
import { useAuthStore } from '@/context/authStore';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { CANONICAL_ROLES, ROLE_DEFINITIONS } from '@/constants/roles';

const ROLE_SELECT_OPTIONS = CANONICAL_ROLES.map((role) => {
  const def = ROLE_DEFINITIONS[role];
  return {
    value: role,
    label: `${def.label} — ${def.description.split(',')[0]}`,
  };
});

export function RegisterPage() {
  const navigate = useNavigate();
  const registerAccount = useAuthStore((state) => state.register);
  const pushToast = useToastStore((state) => state.push);

  const [isSubmitting, setSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      username: '',
      email: '',
      role: 'SITE_ENGINEER',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordVal = watch('password');

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      const response = await registerAccount({
        username: values.username.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        roles: [values.role],
      });

      setRegisteredSuccess({
        username: values.username.trim(),
        email: values.email.trim().toLowerCase(),
        role: values.role,
        data: response,
      });

      pushToast('Registration submitted! Account awaiting Admin approval.', 'success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to complete registration.';
      pushToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // Success view explaining PENDING_APPROVAL workflow
  if (registeredSuccess) {
    const roleDef = ROLE_DEFINITIONS[registeredSuccess.role];

    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h2 className="text-lg font-bold text-ink-900">Registration Submitted!</h2>
        <p className="mt-1 text-xs text-ink-500">
          Account created for <span className="font-semibold text-ink-800">{registeredSuccess.username}</span>
        </p>

        <div className="my-5 w-full rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-left dark:border-amber-800/40 dark:bg-amber-950/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
            <Shield className="h-4 w-4 text-amber-600" />
            <span>Status: PENDING_APPROVAL</span>
          </div>
          <p className="mt-2 text-xs text-amber-800/90 dark:text-amber-300/80">
            Under BuildTwin 360 site security governance, new user registrations must be approved by a
            <strong> Project Director</strong> or <strong>System Administrator</strong> before access is granted.
          </p>
          <div className="mt-3 border-t border-amber-200/60 pt-2 text-[11px] text-amber-700 dark:border-amber-800/40 dark:text-amber-300">
            Requested Role: <span className="font-semibold">{roleDef?.label || registeredSuccess.role}</span>
          </div>
        </div>

        <Button
          onClick={() => navigate('/login')}
          className="w-full justify-center"
        >
          <span>Return to Sign In</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-700">
          Username
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-400">
            <User className="h-4 w-4" />
          </div>
          <input
            type="text"
            autoComplete="username"
            placeholder="e.g. rajesh_kumar"
            disabled={isSubmitting}
            className={`w-full rounded-lg border bg-surface-card py-2 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 ${
              errors.username ? 'border-rose-500' : 'border-surface-border'
            }`}
            {...register('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'Must be at least 3 characters' },
              maxLength: { value: 50, message: 'Cannot exceed 50 characters' },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Username can only contain letters, numbers, and underscores',
              },
            })}
          />
        </div>
        {errors.username && (
          <p className="mt-1 text-xs text-rose-600">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-700">
          Official Email
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-400">
            <Mail className="h-4 w-4" />
          </div>
          <input
            type="email"
            autoComplete="email"
            placeholder="e.g. rajesh@ashokbuilders.com"
            disabled={isSubmitting}
            className={`w-full rounded-lg border bg-surface-card py-2 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 ${
              errors.email ? 'border-rose-500' : 'border-surface-border'
            }`}
            {...register('email', {
              required: 'Email address is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email address format',
              },
            })}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Select
          label="Desired Role (10 Specification Roles)"
          options={ROLE_SELECT_OPTIONS}
          disabled={isSubmitting}
          error={errors.role?.message}
          {...register('role', { required: 'Please select a role' })}
        />
        <p className="mt-1 text-[11px] text-ink-500">
          Select your primary operational role in Ashok Builders construction workflow.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-700">
          Password
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            disabled={isSubmitting}
            className={`w-full rounded-lg border bg-surface-card py-2 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 ${
              errors.password ? 'border-rose-500' : 'border-surface-border'
            }`}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-700">
          Confirm Password
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            disabled={isSubmitting}
            className={`w-full rounded-lg border bg-surface-card py-2 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 ${
              errors.confirmPassword ? 'border-rose-500' : 'border-surface-border'
            }`}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) => val === passwordVal || 'Passwords do not match',
            })}
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        className="mt-1 w-full justify-center shadow-md shadow-brand-700/20"
      >
        <span>{isSubmitting ? 'Submitting Registration...' : 'Create Account'}</span>
        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-center text-xs text-ink-600"
        onClick={() => navigate('/login')}
        disabled={isSubmitting}
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Already have an account? Sign in
      </Button>
    </form>
  );
}
