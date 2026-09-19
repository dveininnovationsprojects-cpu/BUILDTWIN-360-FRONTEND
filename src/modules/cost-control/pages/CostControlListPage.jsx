import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table, Button, Modal, Input } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { costControlApi } from '../api/costControlApi';

// Cost heads, budget revisions, committed/actual cost, PV/EV/AC/SPI/CPI (FR-070..075).
export function CostControlListPage() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const form = useForm({
    defaultValues: {
      code: '',
      category: '',
      bac: '',
      pv: '',
      ev: '',
      ac: '',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['cost-control'],
    queryFn: () => costControlApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => costControlApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-control'] });
      pushToast('Budget head added successfully.', 'success');
      setIsOpen(false);
      form.reset();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to add budget head.', 'error');
    },
  });

  const columns = [
    { key: 'code', header: 'WBS Code' },
    { key: 'category', header: 'Cost Head / Category' },
    { key: 'bac', header: 'Budget at Completion (BAC)' },
    { key: 'ac', header: 'Actual Cost (AC)' },
    { key: 'cpi', header: 'Cost Performance (CPI)', render: (row) => row.cpi || '1.00 (On Budget)' },
  ];

  function handleSubmit(values) {
    createMutation.mutate({
      code: values.code,
      category: values.category,
      bac: values.bac,
      pv: values.pv || values.bac,
      ev: values.ev || values.bac,
      ac: values.ac,
      cpi: '1.00 (On Budget)',
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Cost & Budget</h1>
          <p className="page-subheading">
            Cost heads, budget revisions, committed/actual cost, PV/EV/AC/SPI/CPI (FR-070..075).
          </p>
        </div>
        <Button size="sm" onClick={() => setIsOpen(true)}>Add New</Button>
      </div>

      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add New Cost / Budget Head"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(handleSubmit)} isLoading={createMutation.isPending}>
              Save Budget Head
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <Input
            label="WBS Code *"
            placeholder="e.g. WBS-1.4"
            {...form.register('code', { required: 'WBS Code is required' })}
            error={form.formState.errors.code?.message}
          />
          <Input
            label="Category / Cost Head *"
            placeholder="e.g. Substructure Foundation"
            {...form.register('category', { required: 'Category is required' })}
            error={form.formState.errors.category?.message}
          />
          <Input
            label="Budget at Completion (BAC) *"
            placeholder="e.g. ₹5,000,000"
            {...form.register('bac', { required: 'BAC is required' })}
            error={form.formState.errors.bac?.message}
          />
          <Input
            label="Actual Cost (AC) *"
            placeholder="e.g. ₹3,850,000"
            {...form.register('ac', { required: 'Actual Cost is required' })}
            error={form.formState.errors.ac?.message}
          />
        </form>
      </Modal>
    </div>
  );
}
