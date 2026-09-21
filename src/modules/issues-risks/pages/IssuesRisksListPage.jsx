import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table, Button, Modal, Input, StatusPill } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { issuesRisksApi } from '../api/issuesRisksApi';

// Issue/blocker tracking, escalation and project risk register (FR-090..093).
export function IssuesRisksListPage() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const canManage = useHasRole(
    ROLES.SITE_ENGINEER,
    ROLES.QUALITY_ENGINEER,
    ROLES.PROJECT_MANAGER,
    ROLES.DIRECTOR,
    ROLES.ADMIN
  );

  const form = useForm({
    defaultValues: {
      title: '',
      priority: 'HIGH',
      owner: 'Site Engineer',
      status: 'OPEN',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['issues-risks'],
    queryFn: () => issuesRisksApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => issuesRisksApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues-risks'] });
      pushToast('Issue logged successfully.', 'success');
      setIsOpen(false);
      form.reset();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to log issue.', 'error');
    },
  });

  const columns = [
    { key: 'title', header: 'Issue Title' },
    { key: 'priority', header: 'Priority' },
    { key: 'owner', header: 'Assigned Owner' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status || 'OPEN'} /> },
  ];

  function handleSubmit(values) {
    createMutation.mutate({
      title: values.title,
      priority: values.priority,
      owner: values.owner,
      status: values.status,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Issues & Risks</h1>
          <p className="page-subheading">
            Issue/blocker tracking, escalation and project risk register (FR-090..093).
          </p>
        </div>
        {canManage && <Button size="sm" onClick={() => setIsOpen(true)}>Add New</Button>}
      </div>

      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Log New Issue / Blocker"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(handleSubmit)} isLoading={createMutation.isPending}>
              Log Issue
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <Input
            label="Issue Title *"
            placeholder="e.g. Material Shortage for Concreting"
            {...form.register('title', { required: 'Issue title is required' })}
            error={form.formState.errors.title?.message}
          />
          <Input
            label="Assigned Owner *"
            placeholder="e.g. Procurement Officer"
            {...form.register('owner', { required: 'Owner is required' })}
            error={form.formState.errors.owner?.message}
          />
        </form>
      </Modal>
    </div>
  );
}
