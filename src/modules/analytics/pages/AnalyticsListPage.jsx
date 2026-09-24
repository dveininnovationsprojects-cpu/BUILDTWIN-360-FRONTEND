import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table, Button, Modal, Input } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { analyticsApi } from '../api/analyticsApi';

export function AnalyticsListPage() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const canManage = useHasRole(
    ROLES.DATA_ANALYST,
    ROLES.DIRECTOR,
    ROLES.PROJECT_MANAGER,
    ROLES.ADMIN
  );

  const form = useForm({
    defaultValues: {
      project: '',
      healthIndex: '85.0 / 100 (Green)',
      delayRisk: '20.0 (Low Risk)',
      forecastCompletion: 'Dec 31, 2026 (On Schedule)',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => analyticsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      pushToast('Analytics KPI record added.', 'success');
      setIsOpen(false);
      form.reset();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to add analytics KPI.', 'error');
    },
  });

  const columns = [
    { key: 'project', header: 'Project' },
    { key: 'healthIndex', header: 'Health Index' },
    { key: 'delayRisk', header: 'Delay Risk Score' },
    { key: 'forecastCompletion', header: 'Forecast Completion' },
  ];

  function handleSubmit(values) {
    createMutation.mutate({
      project: values.project,
      healthIndex: values.healthIndex,
      delayRisk: values.delayRisk,
      forecastCompletion: values.forecastCompletion,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Executive Analytics</h1>
        </div>
        {canManage && <Button size="sm" onClick={() => setIsOpen(true)}>Add New</Button>}
      </div>

      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id || row.project} isLoading={isLoading} />

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Analytics KPI Record"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(handleSubmit)} isLoading={createMutation.isPending}>
              Add Analytics Entry
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <Input
            label="Project Name *"
            placeholder="e.g. PRJ-003 Guindy Tech Park"
            {...form.register('project', { required: 'Project name is required' })}
            error={form.formState.errors.project?.message}
          />
          <Input
            label="Health Index Rating *"
            placeholder="e.g. 88.5 / 100 (Green)"
            {...form.register('healthIndex', { required: 'Health index is required' })}
            error={form.formState.errors.healthIndex?.message}
          />
          <Input
            label="Forecast Completion *"
            placeholder="e.g. Nov 15, 2026 (On Schedule)"
            {...form.register('forecastCompletion', { required: 'Forecast completion is required' })}
            error={form.formState.errors.forecastCompletion?.message}
          />
        </form>
      </Modal>
    </div>
  );
}
