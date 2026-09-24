import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table, Button, Modal, Input } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { auditApi } from '../api/auditApi';

// Read-only history of create/update/approve actions (FR-005).
export function AuditListPage() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  // Auditor, Admin, Director, and Project Manager can log audit events
  const canAddLog = useHasRole(ROLES.AUDITOR, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.PROJECT_MANAGER);

  const form = useForm({
    defaultValues: {
      action: 'SITE_AUDIT',
      user: 'Quality Auditor',
      entityType: '',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: () => auditApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => auditApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit'] });
      pushToast('Audit log record created.', 'success');
      setIsOpen(false);
      form.reset();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to add audit record.', 'error');
    },
  });

  const columns = [
    { key: 'user', header: 'User' },
    { key: 'action', header: 'Action Code' },
    { key: 'entityType', header: 'Entity / Target' },
    { key: 'timestamp', header: 'Timestamp', render: (row) => row.timestamp || 'Just now' },
  ];

  function handleSubmit(values) {
    createMutation.mutate({
      action: values.action,
      user: values.user,
      entityType: values.entityType,
      timestamp: new Date().toLocaleString(),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Audit Trail & Logs</h1>
        </div>
        {canAddLog && <Button size="sm" onClick={() => setIsOpen(true)}>Add New</Button>}
      </div>

      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Record Audit Log Event"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(handleSubmit)} isLoading={createMutation.isPending}>
              Record Event
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <Input
            label="Action Code *"
            placeholder="e.g. APPROVE_DPR / SITE_INSPECTION"
            {...form.register('action', { required: 'Action code is required' })}
            error={form.formState.errors.action?.message}
          />
          <Input
            label="Auditor / User Name *"
            placeholder="e.g. Eng. Rajesh (PM)"
            {...form.register('user', { required: 'User name is required' })}
            error={form.formState.errors.user?.message}
          />
          <Input
            label="Entity Target / Description *"
            placeholder="e.g. DPR Header #105"
            {...form.register('entityType', { required: 'Entity target is required' })}
            error={form.formState.errors.entityType?.message}
          />
        </form>
      </Modal>
    </div>
  );
}
