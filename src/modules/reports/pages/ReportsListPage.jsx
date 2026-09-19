import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table, Button, Modal, Input } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { reportsApi } from '../api/reportsApi';

// Executive/project/site dashboards and scheduled/exportable reports (FR-130..135).
export function ReportsListPage() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const form = useForm({
    defaultValues: {
      name: '',
      period: 'Aug 2026',
      format: 'PDF Document',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => reportsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      pushToast('Report scheduled & generated successfully.', 'success');
      setIsOpen(false);
      form.reset();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to generate report.', 'error');
    },
  });

  const columns = [
    { key: 'name', header: 'Report Name' },
    { key: 'period', header: 'Reporting Period' },
    { key: 'generatedAt', header: 'Generated At', render: (row) => row.generatedAt || 'Just now' },
    { key: 'format', header: 'Format' },
  ];

  function handleSubmit(values) {
    createMutation.mutate({
      name: values.name,
      period: values.period,
      format: values.format,
      generatedAt: new Date().toLocaleString(),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Reports & Exports</h1>
          <p className="page-subheading">
            Executive/project/site dashboards and scheduled/exportable reports (FR-130..135).
          </p>
        </div>
        <Button size="sm" onClick={() => setIsOpen(true)}>Add New</Button>
      </div>

      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Generate / Schedule New Report"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(handleSubmit)} isLoading={createMutation.isPending}>
              Generate Report
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <Input
            label="Report Name *"
            placeholder="e.g. Weekly Executive Portfolio S-Curve Progress Report"
            {...form.register('name', { required: 'Report name is required' })}
            error={form.formState.errors.name?.message}
          />
          <Input
            label="Reporting Period *"
            placeholder="e.g. Aug 18 - Aug 25, 2026"
            {...form.register('period', { required: 'Period is required' })}
            error={form.formState.errors.period?.message}
          />
        </form>
      </Modal>
    </div>
  );
}
