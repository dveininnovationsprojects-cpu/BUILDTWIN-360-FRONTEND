import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Button, Card, CardHeader, CardTitle, Table, StatusPill, Modal, Input, Select } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { ROLES } from '@/constants/roles';
import { ROLE_LABELS, useHasRole } from '@/context/authStore';
import { identityApi } from '../api/identityApi';

const ROLE_OPTIONS = Object.values(ROLES).map((role) => ({ value: role, label: ROLE_LABELS[role] }));

const CONFIRM_COPY = {
  deactivate: { title: 'Deactivate account', confirmLabel: 'Deactivate', variant: 'danger', body: (u) => `${u.name} will immediately lose access to BuildTwin 360.` },
  activate: { title: 'Activate account', confirmLabel: 'Activate', variant: 'primary', body: (u) => `${u.name} will regain access to BuildTwin 360.` },
};

// Settings > User Management — Director / Management and System
// Administrator only (FR-002: create, activate, deactivate and reset user
// accounts). Also mounted as its own page at /identity/users.
export function UserManagementPanel() {
  const canManageUsers = useHasRole(ROLES.DIRECTOR, ROLES.SYSTEM_ADMIN);
  const pushToast = useToastStore((s) => s.push);
  const queryClient = useQueryClient();

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { user, kind: 'deactivate' | 'activate' }
  const [resetTarget, setResetTarget] = useState(null); // user being given a new password

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: identityApi.listUsers,
    enabled: canManageUsers,
  });

  const createForm = useForm({ defaultValues: { name: '', email: '', role: '', password: '' } });
  const resetForm = useForm({ defaultValues: { password: '', confirmPassword: '' } });

  const createMutation = useMutation({
    mutationFn: (values) =>
      identityApi.createUser({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        roles: [values.role],
        password: values.password,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      pushToast('User account created.', 'success');
      setCreateOpen(false);
      createForm.reset();
    },
    onError: (error) => pushToast(error instanceof Error ? error.message : 'Unable to create user.', 'error'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => identityApi.setUserStatus(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      pushToast(status === 'active' ? 'Account activated.' : 'Account deactivated.', 'success');
    },
    onError: (error) => pushToast(error instanceof Error ? error.message : 'Unable to update account status.', 'error'),
  });

  const resetMutation = useMutation({
    mutationFn: ({ id, password }) => identityApi.resetPassword(id, password),
    // The admin sets the new password directly here (FR-002) - no email
    // link involved, the same as setting a temporary password on create.
    onSuccess: (_, { user }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      pushToast(`Password reset for ${user.name}.`, 'success');
      setResetTarget(null);
      resetForm.reset();
    },
    onError: (error) => pushToast(error instanceof Error ? error.message : 'Unable to reset password.', 'error'),
  });

  // Not one of the two controlling roles - nothing to render. The route
  // guard and the Settings gate already keep this from mounting for anyone
  // else; this is the last line of defense.
  if (!canManageUsers) return null;

  function runConfirmedAction() {
    const { user, kind } = confirmAction;
    statusMutation.mutate({ id: user.id, status: kind === 'activate' ? 'active' : 'inactive' });
    setConfirmAction(null);
  }

  function closeResetModal() {
    setResetTarget(null);
    resetForm.reset();
  }

  function submitReset(values) {
    resetMutation.mutate({ id: resetTarget.id, password: values.password, user: resetTarget });
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'roles', header: 'Roles', render: (u) => u.roles.map((r) => ROLE_LABELS[r] ?? r).join(', ') },
    { key: 'status', header: 'Status', render: (u) => <StatusPill status={u.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (u) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setResetTarget(u)}>
            Reset password
          </Button>
          {u.status === 'active' ? (
            <Button variant="danger" size="sm" onClick={() => setConfirmAction({ user: u, kind: 'deactivate' })}>
              Deactivate
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setConfirmAction({ user: u, kind: 'activate' })}>
              Activate
            </Button>
          )}
        </div>
      ),
    },
  ];

  const confirmCopy = confirmAction && CONFIRM_COPY[confirmAction.kind];

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          Add user
        </Button>
      </CardHeader>
      <p className="-mt-3 mb-4 text-sm text-ink-500">
        Create accounts and control who can sign in. Only Director / Management and System
        Administrator can manage users.
      </p>

      <Table columns={columns} data={users ?? []} rowKey={(u) => u.id} isLoading={isLoading} />

      <Modal
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        title="Add user"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createForm.handleSubmit((v) => createMutation.mutate(v))} isLoading={createMutation.isPending}>
              Create account
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={createForm.handleSubmit((v) => createMutation.mutate(v))}>
          <Input
            label="Full name"
            error={createForm.formState.errors.name?.message}
            {...createForm.register('name', { required: 'Name is required' })}
          />
          <Input
            label="Email"
            type="email"
            error={createForm.formState.errors.email?.message}
            {...createForm.register('email', { required: 'Email is required' })}
          />
          <Select
            label="Role"
            placeholder="Select a role"
            options={ROLE_OPTIONS}
            error={createForm.formState.errors.role?.message}
            {...createForm.register('role', { required: 'Role is required' })}
          />
          <Input
            label="Temporary password"
            type="password"
            hint="The user will be asked to change this on first sign-in."
            error={createForm.formState.errors.password?.message}
            {...createForm.register('password', {
              required: 'Temporary password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
          />
        </form>
      </Modal>

      <Modal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmCopy?.title}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button variant={confirmCopy?.variant} onClick={runConfirmedAction}>
              {confirmCopy?.confirmLabel}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-700">{confirmAction && confirmCopy.body(confirmAction.user)}</p>
      </Modal>

      <Modal
        open={!!resetTarget}
        onClose={closeResetModal}
        title="Reset password"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeResetModal}>
              Cancel
            </Button>
            <Button onClick={resetForm.handleSubmit(submitReset)} isLoading={resetMutation.isPending}>
              Reset password
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={resetForm.handleSubmit(submitReset)}>
          <Input
            label="New password"
            type="password"
            hint="The user will be asked to change this on next sign-in."
            error={resetForm.formState.errors.password?.message}
            {...resetForm.register('password', {
              required: 'New password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
          />
          <Input
            label="Confirm password"
            type="password"
            error={resetForm.formState.errors.confirmPassword?.message}
            {...resetForm.register('confirmPassword', {
              required: 'Please confirm the new password',
              validate: (value) => value === resetForm.getValues('password') || 'Passwords do not match',
            })}
          />
        </form>
      </Modal>
    </Card>
  );
}
