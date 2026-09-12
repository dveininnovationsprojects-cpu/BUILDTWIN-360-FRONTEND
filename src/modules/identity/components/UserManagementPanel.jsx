import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Users,
  UserCheck,
  UserX,
  KeyRound,
  Shield,
  Search,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Table,
  StatusPill,
  Modal,
  Input,
  Select,
  Tabs,
} from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { ROLES, CANONICAL_ROLES, ROLE_DEFINITIONS, normalizeRole } from '@/constants/roles';
import { useHasRole } from '@/context/authStore';
import { identityApi } from '../api/identityApi';

const ROLE_OPTIONS = CANONICAL_ROLES.map((role) => {
  const def = ROLE_DEFINITIONS[role];
  return {
    value: role,
    label: `${def.label} (${def.backendRole})`,
  };
});

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
];

export function UserManagementPanel() {
  const canManageUsers = useHasRole(ROLES.DIRECTOR, ROLES.ADMIN);
  const pushToast = useToastStore((s) => s.push);
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null); // { user, nextStatus }
  const [rejectTarget, setRejectTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Forms
  const createForm = useForm({
    defaultValues: { username: '', email: '', role: 'SITE_ENGINEER', password: '' },
  });
  const resetForm = useForm({ defaultValues: { password: '', confirmPassword: '' } });
  const rejectForm = useForm({ defaultValues: { reason: '' } });

  // 1. All Users query
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['users', searchQuery, statusFilter],
    queryFn: () => identityApi.listUsers({ search: searchQuery, status: statusFilter }),
    enabled: canManageUsers,
  });

  // 2. Pending Approvals query
  const {
    data: pendingUsers = [],
    isLoading: isLoadingPending,
    refetch: refetchPending,
  } = useQuery({
    queryKey: ['users-pending-approvals'],
    queryFn: () => identityApi.getPendingApprovals(),
    enabled: canManageUsers,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (values) =>
      identityApi.createUser({
        username: values.username.trim(),
        email: values.email.trim().toLowerCase(),
        roles: [values.role],
        password: values.password,
        status: 'ACTIVE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      pushToast('User account created successfully.', 'success');
      setCreateOpen(false);
      createForm.reset();
    },
    onError: (err) => pushToast(err instanceof Error ? err.message : 'Failed to create user.', 'error'),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, role }) => identityApi.approveUser(id, { roles: role ? [role] : [] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users-pending-approvals'] });
      pushToast('User registration approved. Account is now ACTIVE.', 'success');
    },
    onError: (err) => pushToast(err instanceof Error ? err.message : 'Approval failed.', 'error'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => identityApi.rejectUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users-pending-approvals'] });
      pushToast('Registration request rejected.', 'success');
      setRejectTarget(null);
      rejectForm.reset();
    },
    onError: (err) => pushToast(err instanceof Error ? err.message : 'Rejection failed.', 'error'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => identityApi.setUserStatus(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      pushToast(`User status updated to ${status}.`, 'success');
      setStatusTarget(null);
    },
    onError: (err) => pushToast(err instanceof Error ? err.message : 'Status update failed.', 'error'),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }) => identityApi.resetPassword(id, password),
    onSuccess: (_, { user }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      pushToast(`Password reset successfully for ${user.username || user.email}.`, 'success');
      setResetTarget(null);
      resetForm.reset();
    },
    onError: (err) => pushToast(err instanceof Error ? err.message : 'Password reset failed.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => identityApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      pushToast('User deleted successfully.', 'success');
      setDeleteTarget(null);
    },
    onError: (err) => pushToast(err instanceof Error ? err.message : 'Failed to delete user.', 'error'),
  });

  if (!canManageUsers) return null;

  function renderRoleBadge(roleKey) {
    const canonical = normalizeRole(roleKey);
    const def = ROLE_DEFINITIONS[canonical] || {
      label: roleKey,
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    return (
      <span
        key={roleKey}
        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium shadow-xs ${def.badgeClass}`}
      >
        {def.label}
      </span>
    );
  }

  // Columns for All Users table
  const userColumns = [
    {
      key: 'username',
      header: 'User & Email',
      render: (u) => (
        <div className="flex flex-col">
          <span className="font-semibold text-ink-900">{u.username}</span>
          <span className="text-xs text-ink-500">{u.email}</span>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Assigned Roles',
      render: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.roles?.length ? u.roles.map(renderRoleBadge) : <span className="text-xs text-ink-400">None</span>}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => <StatusPill status={u.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (u) => {
        const isPrimaryAdmin = u.username === 'admin';

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetTarget(u)}
              title="Reset user password"
              className="text-xs"
            >
              <KeyRound className="mr-1 h-3.5 w-3.5" />
              Reset Pass
            </Button>

            {u.status === 'ACTIVE' ? (
              <Button
                variant="secondary"
                size="sm"
                disabled={isPrimaryAdmin}
                onClick={() => setStatusTarget({ user: u, nextStatus: 'INACTIVE' })}
                title="Deactivate account"
                className="text-xs text-amber-700 hover:text-amber-800"
              >
                Deactivate
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStatusTarget({ user: u, nextStatus: 'ACTIVE' })}
                title="Activate account"
                className="text-xs text-emerald-700 hover:text-emerald-800"
              >
                Activate
              </Button>
            )}

            {!isPrimaryAdmin && (
              <button
                type="button"
                onClick={() => setDeleteTarget(u)}
                title="Delete User"
                className="p-1 text-ink-400 hover:text-rose-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // Columns for Pending Approvals table
  const pendingColumns = [
    {
      key: 'username',
      header: 'Applicant',
      render: (u) => (
        <div className="flex flex-col">
          <span className="font-semibold text-ink-900">{u.username}</span>
          <span className="text-xs text-ink-500">{u.email}</span>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Requested Role',
      render: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.roles?.length ? u.roles.map(renderRoleBadge) : <span className="text-xs text-ink-400">Site Engineer</span>}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: () => (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          <Clock className="h-3 w-3" />
          Pending Review
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Decision',
      className: 'text-right',
      render: (u) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            onClick={() => approveMutation.mutate({ id: u.id, role: u.roles?.[0] })}
            isLoading={approveMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
          >
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRejectTarget(u)}
            className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            <XCircle className="mr-1 h-3.5 w-3.5" />
            Reject
          </Button>
        </div>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'all-users',
      label: (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>System Users ({users.length})</span>
        </div>
      ),
      content: (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-surface-border bg-surface-card py-2 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="w-48">
                <Select
                  options={STATUS_FILTER_OPTIONS}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>
            </div>

            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Add User
            </Button>
          </div>

          <Table
            columns={userColumns}
            data={users}
            rowKey={(u) => u.id}
            isLoading={isLoadingUsers}
            emptyMessage="No users found matching your criteria."
          />
        </div>
      ),
    },
    {
      key: 'pending-approvals',
      label: (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>Pending Approvals</span>
          {pendingUsers.length > 0 && (
            <span className="ml-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {pendingUsers.length}
            </span>
          )}
        </div>
      ),
      content: (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-200">
            <p className="font-semibold">New Registration Review Queue</p>
            <p className="mt-0.5 text-[11px] opacity-90">
              Users registered through the portal must be approved here before they can log into BuildTwin 360.
              Approving grants them active credentials and their requested system role.
            </p>
          </div>

          <Table
            columns={pendingColumns}
            data={pendingUsers}
            rowKey={(u) => u.id}
            isLoading={isLoadingPending}
            emptyMessage="No pending registrations waiting for approval."
          />
        </div>
      ),
    },
  ];

  return (
    <Card className="liquid-glass w-full rounded-2xl shadow-lg border-surface-border">
      <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-ink-900">
            Identity &amp; Role-Based Access Control (RBAC)
          </CardTitle>
          <p className="mt-1 text-xs text-ink-500">
            Enterprise administration for 10 Ashok Builders construction roles, account lifecycles, and approvals.
          </p>
        </div>
      </CardHeader>

      <div className="p-4 sm:p-6">
        <Tabs items={tabItems} defaultKey="all-users" />
      </div>

      {/* 1. Modal: Add User */}
      <Modal
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New System User"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createForm.handleSubmit((v) => createMutation.mutate(v))}
              isLoading={createMutation.isPending}
            >
              Create Account
            </Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-3.5"
          onSubmit={createForm.handleSubmit((v) => createMutation.mutate(v))}
        >
          <Input
            label="Username"
            placeholder="e.g. suresh_civil"
            error={createForm.formState.errors.username?.message}
            {...createForm.register('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'At least 3 characters' },
            })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="e.g. suresh@ashokbuilders.com"
            error={createForm.formState.errors.email?.message}
            {...createForm.register('email', { required: 'Email is required' })}
          />
          <Select
            label="Assign System Role (10 Roles)"
            options={ROLE_OPTIONS}
            error={createForm.formState.errors.role?.message}
            {...createForm.register('role', { required: 'Role is required' })}
          />
          <Input
            label="Initial Password"
            type="password"
            placeholder="At least 6 characters"
            error={createForm.formState.errors.password?.message}
            {...createForm.register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
          />
        </form>
      </Modal>

      {/* 2. Modal: Reset Password */}
      <Modal
        open={!!resetTarget}
        onClose={() => {
          setResetTarget(null);
          resetForm.reset();
        }}
        title={`Reset Password for ${resetTarget?.username || 'User'}`}
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setResetTarget(null);
                resetForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={resetForm.handleSubmit((v) =>
                resetPasswordMutation.mutate({ id: resetTarget.id, password: v.password, user: resetTarget })
              )}
              isLoading={resetPasswordMutation.isPending}
            >
              Save New Password
            </Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-3.5"
          onSubmit={resetForm.handleSubmit((v) =>
            resetPasswordMutation.mutate({ id: resetTarget.id, password: v.password, user: resetTarget })
          )}
        >
          <Input
            label="New Password"
            type="password"
            placeholder="At least 6 characters"
            error={resetForm.formState.errors.password?.message}
            {...resetForm.register('password', {
              required: 'New password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            error={resetForm.formState.errors.confirmPassword?.message}
            {...resetForm.register('confirmPassword', {
              required: 'Confirm your password',
              validate: (val) => val === resetForm.watch('password') || 'Passwords do not match',
            })}
          />
        </form>
      </Modal>

      {/* 3. Modal: Status Change Confirmation */}
      <Modal
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        title={`${statusTarget?.nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'} User Account`}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setStatusTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={statusTarget?.nextStatus === 'ACTIVE' ? 'primary' : 'danger'}
              onClick={() =>
                statusMutation.mutate({
                  id: statusTarget.user.id,
                  status: statusTarget.nextStatus,
                })
              }
              isLoading={statusMutation.isPending}
            >
              Confirm {statusTarget?.nextStatus === 'ACTIVE' ? 'Activation' : 'Deactivation'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-700">
          Are you sure you want to change the status of <strong>{statusTarget?.user?.username}</strong> to{' '}
          <strong>{statusTarget?.nextStatus}</strong>?
        </p>
      </Modal>

      {/* 4. Modal: Reject Registration */}
      <Modal
        open={!!rejectTarget}
        onClose={() => {
          setRejectTarget(null);
          rejectForm.reset();
        }}
        title="Reject User Registration"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setRejectTarget(null);
                rejectForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={rejectForm.handleSubmit((v) =>
                rejectMutation.mutate({ id: rejectTarget.id, reason: v.reason })
              )}
              isLoading={rejectMutation.isPending}
            >
              Reject Application
            </Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-3"
          onSubmit={rejectForm.handleSubmit((v) =>
            rejectMutation.mutate({ id: rejectTarget.id, reason: v.reason })
          )}
        >
          <p className="text-sm text-ink-700">
            Reject registration for <strong>{rejectTarget?.username}</strong> ({rejectTarget?.email})?
          </p>
          <Input
            label="Reason for rejection (optional)"
            placeholder="e.g. Unverified contractor association"
            {...rejectForm.register('reason')}
          />
        </form>
      </Modal>

      {/* 5. Modal: Delete User Confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User Account"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
              isLoading={deleteMutation.isPending}
            >
              Delete Permanently
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 text-rose-700">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
          <p className="text-sm">
            Are you sure you want to permanently delete user <strong>{deleteTarget?.username}</strong>?
            This will remove all associated project roles. This action cannot be undone.
          </p>
        </div>
      </Modal>
    </Card>
  );
}
