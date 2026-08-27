import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera } from 'lucide-react';
import { Avatar, Button, Card, CardHeader, CardTitle, Input } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { ROLE_LABELS, useAuthStore } from '@/context/authStore';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const MOBILE_PATTERN = /^[0-9]{10}$/;

// Self-service account details — display name, mobile and photo are
// editable, email and role stay read-only (managed by System Admin, FR-002).
export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const pushToast = useToastStore((s) => s.push);
  const [isSubmitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name ?? '', mobile: user?.mobile ?? '' },
  });

  const mobileField = register('mobile', {
    validate: (value) => !value || MOBILE_PATTERN.test(value) || 'Enter a valid 10-digit mobile number',
  });

  function onSubmit(values) {
    setSubmitting(true);
    updateProfile({ name: values.name.trim(), mobile: values.mobile.trim() });
    pushToast('Profile updated.', 'success');
    setSubmitting(false);
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

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="page-heading">My Profile</h1>
        <p className="page-subheading">View and update your account details.</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar
                name={user?.name ?? 'Guest'}
                src={user?.avatar}
                className="h-16 w-16 bg-brand-600 text-base text-white"
              />
              <button
                type="button"
                aria-label="Change profile photo"
                title="Change profile photo"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface-base bg-brand-500 text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                <Camera className="h-3.5 w-3.5" />
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
              <CardTitle>{user?.name ?? 'Guest'}</CardTitle>
              <p className="text-xs text-ink-500">{user ? ROLE_LABELS[user.roles[0]] : 'Local access'}</p>
              {user?.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="mt-1 text-xs font-medium text-status-danger hover:underline"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Full name"
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />
          <Input label="Email" defaultValue={user?.email ?? ''} disabled hint="Contact an administrator to change your email." />
          <Input
            label="Mobile number"
            placeholder="10-digit mobile number"
            inputMode="numeric"
            maxLength={10}
            error={errors.mobile?.message}
            {...mobileField}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
              mobileField.onChange(e);
            }}
          />
          <Input label="Role" defaultValue={user ? ROLE_LABELS[user.roles[0]] : ''} disabled />
          <Button type="submit" isLoading={isSubmitting} className="self-start">
            Save changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
