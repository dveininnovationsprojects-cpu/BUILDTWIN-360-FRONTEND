import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table, Button, Modal, Input, StatusPill } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { qualityApi } from '../api/qualityApi';

// Inspection checklists, NCR/snag workflow, evidence and closure (FR-080..084).
export function QualityListPage() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const canManage = useHasRole(
    ROLES.QUALITY_ENGINEER,
    ROLES.SITE_ENGINEER,
    ROLES.PROJECT_MANAGER,
    ROLES.DIRECTOR,
    ROLES.ADMIN
  );

  const form = useForm({
    defaultValues: {
      code: `NCR-00${Math.floor(Math.random() * 90 + 10)}`,
      project: 'PRJ-001 Padur Residence',
      title: '',
      severity: 'HIGH',
      status: 'OPEN',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['quality'],
    queryFn: () => qualityApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => qualityApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quality'] });
      pushToast('Quality NCR created successfully.', 'success');
      setIsOpen(false);
      form.reset();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to create Quality issue.', 'error');
    },
  });

  const columns = [
    { key: 'code', header: 'NCR Ref' },
    { key: 'project', header: 'Project' },
    { key: 'title', header: 'Issue Description' },
    { key: 'severity', header: 'Severity' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status || 'OPEN'} /> },
  ];

  function handleSubmit(values) {
    createMutation.mutate({
      code: values.code,
      project: values.project,
      title: values.title,
      severity: values.severity,
      status: values.status,
      ageingDays: '0 Days',
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Quality & Inspections (NCR)</h1>
        </div>
        {canManage && <Button size="sm" onClick={() => setIsOpen(true)}>Add New</Button>}
      </div>

      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Raise Quality Issue / NCR"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(handleSubmit)} isLoading={createMutation.isPending}>
              Raise NCR
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <Input
            label="NCR Ref Code *"
            placeholder="e.g. NCR-045"
            {...form.register('code', { required: 'NCR Code is required' })}
            error={form.formState.errors.code?.message}
          />
          <Input
            label="Project Name *"
            placeholder="e.g. Padur Residence - Block A"
            {...form.register('project', { required: 'Project is required' })}
            error={form.formState.errors.project?.message}
          />
          <Input
            label="Issue Title / Description *"
            placeholder="e.g. Rebar Cover Block Displacement"
            {...form.register('title', { required: 'Issue title is required' })}
            error={form.formState.errors.title?.message}
          />
        </form>
      </Modal>
    </div>
  );
}
