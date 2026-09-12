import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, KeyRound, Shield, User } from 'lucide-react';
import { Avatar, Button, Card, CardHeader, CardTitle, Input } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { ROLE_LABELS, useAuthStore } from '@/context/authStore';
import { normalizeRole, ROLE_DEFINITIONS } from '@/constants/roles';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const MOBILE_PATTERN = /^[0-9]{10}$/;

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const changePassword = useAuthStore((s) => s.changePassword);
  const pushToast = useToastStore((s) => s.push);

  const [isSubmittingProfile, setSubmittingProfile] = useState(false);
  const [isChangingPassword, setChangingPassword] = useState(false);
  const fileInputRef = useRef(null);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: { name: user?.name ?? user?.username ?? '', mobile: user?.mobile ?? '' },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const mobileField = registerProfile('mobile', {
    validate: (value) => !value || MOBILE_PATTERN.test(value) || 'Enter a valid 10-digit mobile number',
  });

  function onProfileSubmit(values) {
    setSubmittingProfile(true);
    updateProfile({ name: values.name.trim(), mobile: values.mobile.trim() });
    pushToast('Profile information saved.', 'success');
    setSubmittingProfile(false);
  }

  async function onPasswordSubmit(values) {
    setChangingPassword(true);
    try {
      await changePassword(values.currentPassword, values.newPassword);
      pushToast('Password changed successfully.', 'success');
      resetPasswordForm();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to change password.';
      pushToast(msg, 'error');
    } finally {
      setChangingPassword(false);
    }
  }

  function handleAvatarFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      pushToast('Please choose an image file.', 'error');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      pushToast('Image must be smaller than 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatar: reader.result });
      pushToast('Profile photo updated.', 'success');
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveAvatar() {
    updateProfile({ avatar: null });
    pushToast('Profile photo removed.', 'success');
  }

  const roleList = user?.roles?.map((r) => {
    const canonical = normalizeRole(r);
    return ROLE_DEFINITIONS[canonical]?.label || r;
  }) || [];

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      <div className="w-full max-w-2xl text-center">
        <h1 className="page-heading">My Profile</h1>
        <p className="page-subheading">Manage personal details, view system roles and update security credentials.</p>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        {/* Profile Card */}
        <Card className="liquid-glass w-full rounded-2xl p-6 shadow-md border-surface-border">
          <CardHeader className="justify-center border-b border-surface-border pb-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="relative">
                <Avatar
                  name={user?.name ?? user?.username ?? 'User'}
                  src={user?.avatar}
                  className="h-20 w-20 bg-brand-600 text-lg text-white ring-4 ring-brand-100 dark:ring-brand-900/30"
                />
                <button
                  type="button"
                  aria-label="Change profile photo"
                  title="Change profile photo"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface-base bg-brand-600 text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </div>

              <div>
                <CardTitle className="text-lg font-bold text-ink-900">
                  {user?.name || user?.username || 'User'}
                </CardTitle>
                <p className="text-xs text-ink-500 font-mono mt-0.5">@{user?.username}</p>

                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {roleList.map((roleLabel, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 border border-brand-200 dark:bg-brand-950/50 dark:text-brand-300 dark:border-brand-800/40"
                    >
                      <Shield className="h-3 w-3" />
                      {roleLabel}
                    </span>
                  ))}
                </div>

                {user?.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="mt-2 text-xs font-medium text-rose-600 hover:underline"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="mt-6 flex flex-col gap-4">
            <Input
              label="Full Display Name"
              error={profileErrors.name?.message}
              {...registerProfile('name', { required: 'Name is required' })}
            />
            <Input
              label="Registered Email"
              defaultValue={user?.email ?? ''}
              disabled
              hint="Email address is governed by system administrator."
            />
            <Input
              label="Mobile Number"
              placeholder="10-digit contact number"
              inputMode="numeric"
              maxLength={10}
              error={profileErrors.mobile?.message}
              {...mobileField}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                mobileField.onChange(e);
              }}
            />

            <Button type="submit" isLoading={isSubmittingProfile} className="mt-2 self-start">
              Save Profile Changes
            </Button>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card className="liquid-glass w-full rounded-2xl p-6 shadow-md border-surface-border">
          <CardHeader className="border-b border-surface-border pb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-brand-600" />
              <div>
                <CardTitle className="text-base font-bold text-ink-900">Security &amp; Password</CardTitle>
                <p className="text-xs text-ink-500">Update your account password with Spring Boot backend.</p>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="mt-5 flex flex-col gap-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              error={passwordErrors.currentPassword?.message}
              {...registerPassword('currentPassword', { required: 'Current password is required' })}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="At least 6 characters"
              error={passwordErrors.newPassword?.message}
              {...registerPassword('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              error={passwordErrors.confirmPassword?.message}
              {...registerPassword('confirmPassword', {
                required: 'Please confirm your new password',
                validate: (v) => v === watchPassword('newPassword') || 'Passwords do not match',
              })}
            />

            <Button
              type="submit"
              variant="outline"
              isLoading={isChangingPassword}
              className="mt-2 self-start"
            >
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
