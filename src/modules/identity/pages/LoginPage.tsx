import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, Input } from '@/design-system';
import { useAuthStore } from '@/context/authStore';
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
    </form>
  );
}
