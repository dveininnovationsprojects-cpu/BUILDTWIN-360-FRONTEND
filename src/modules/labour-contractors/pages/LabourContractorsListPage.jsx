import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table, Button, Modal, Input } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { labourContractorsApi } from '../api/labourContractorsApi';

// Contractor master, daily headcount/allocation and productivity analytics (FR-040..045).
export function LabourContractorsListPage() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const form = useForm({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      contractor: '',
      trade: '',
      headcount: '',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['labour-contractors'],
    queryFn: () => labourContractorsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => labourContractorsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labour-contractors'] });
      pushToast('Labour record added successfully.', 'success');
      setIsOpen(false);
      form.reset();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to add labour record.', 'error');
    },
  });

  const columns = [
    { key: 'date', header: 'Date' },
    { key: 'contractor', header: 'Contractor' },
    { key: 'trade', header: 'Trade' },
    { key: 'headcount', header: 'Headcount' },
  ];

  function handleSubmit(values) {
    createMutation.mutate({
      recordDate: values.date,
      date: values.date,
      contractor: values.contractor,
      tradeCategory: values.trade,
      trade: values.trade,
      headcount: values.headcount,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Labour & Contractors</h1>
          <p className="page-subheading">
            Contractor master, daily headcount/allocation and productivity analytics (FR-040..045).
          </p>
        </div>
        <Button size="sm" onClick={() => setIsOpen(true)}>Add New</Button>
      </div>

      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add New Daily Labour Record"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(handleSubmit)} isLoading={createMutation.isPending}>
              Save Record
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <Input
            label="Date *"
            type="date"
            {...form.register('date', { required: 'Date is required' })}
            error={form.formState.errors.date?.message}
          />
          <Input
            label="Contractor Name *"
            placeholder="e.g. Sri Lakshmi Masonry Works"
            {...form.register('contractor', { required: 'Contractor is required' })}
            error={form.formState.errors.contractor?.message}
          />
          <Input
            label="Trade Category *"
            placeholder="e.g. Masonry & Concrete"
            {...form.register('trade', { required: 'Trade category is required' })}
            error={form.formState.errors.trade?.message}
          />
          <Input
            label="Headcount Summary *"
            placeholder="e.g. 14 Workers (10 Masons, 4 Helpers)"
            {...form.register('headcount', { required: 'Headcount is required' })}
            error={form.formState.errors.headcount?.message}
          />
        </form>
      </Modal>
    </div>
  );
}
