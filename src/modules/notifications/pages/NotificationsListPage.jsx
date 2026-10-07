import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table, Button, Modal, Input, StatusPill } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { notificationsApi } from '../api/notificationsApi';

// In-app alerts for overdue activities, low stock, pending approvals (FR-120..123).
export function NotificationsListPage() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const canManage = useHasRole(ROLES.PROJECT_MANAGER, ROLES.DIRECTOR, ROLES.ADMIN);

  const form = useForm({
    defaultValues: {
      message: '',
      severity: 'HIGH',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => notificationsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      pushToast('Notification alert created successfully.', 'success');
      setIsOpen(false);
      form.reset();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to create notification alert.', 'error');
    },
  });

  const columns = [
    { key: 'message', header: 'Alert Message' },
    { key: 'severity', header: 'Severity' },
    { key: 'createdAt', header: 'Triggered Time', render: (row) => row.createdAt || 'Just now' },
    { key: 'readStatus', header: 'Status', render: (row) => <StatusPill status={row.readStatus || 'UNREAD'} /> },
  ];

  function handleSubmit(values) {
    createMutation.mutate({
      message: values.message,
      severity: values.severity,
      readStatus: 'UNREAD',
      createdAt: new Date().toLocaleString(),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Notifications & Alerts</h1>
        </div>
        {canManage && <Button size="sm" onClick={() => setIsOpen(true)}>Add New</Button>}
      </div>

      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Notification Alert"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(handleSubmit)} isLoading={createMutation.isPending}>
              Create Alert
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <Input
            label="Alert Message *"
            placeholder="e.g. ALERT: Cement Stock Shortage predicted in 4 days"
            {...form.register('message', { required: 'Message is required' })}
            error={form.formState.errors.message?.message}
          />
        </form>
      </Modal>
    </div>
  );
}
