import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table, Button, Modal, Input, StatusPill } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { procurementApi } from '../api/procurementApi';

// Supplier profile, PO tracking, delivery status and supplier performance (FR-060..063).
export function ProcurementListPage() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const canManage = useHasRole(
    ROLES.PROCUREMENT_STORE,
    ROLES.PROJECT_MANAGER,
    ROLES.DIRECTOR,
    ROLES.ADMIN
  );

  const form = useForm({
    defaultValues: {
      poNumber: `PO-${new Date().getFullYear()}-00${Math.floor(Math.random() * 90 + 10)}`,
      supplier: '',
      deliveryDate: new Date().toISOString().slice(0, 10),
      status: 'PENDING',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['procurement'],
    queryFn: () => procurementApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => procurementApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
      pushToast('Purchase Order created successfully.', 'success');
      setIsOpen(false);
      form.reset();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to create Purchase Order.', 'error');
    },
  });

  const columns = [
    { key: 'poNumber', header: 'PO Number' },
    { key: 'supplier', header: 'Supplier' },
    { key: 'deliveryDate', header: 'Delivery Date' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status || 'PENDING'} /> },
  ];

  function handleSubmit(values) {
    createMutation.mutate({
      poNumber: values.poNumber,
      supplier: values.supplier,
      deliveryDate: values.deliveryDate,
      status: values.status,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Procurement & Suppliers</h1>
        </div>
        {canManage && <Button size="sm" onClick={() => setIsOpen(true)}>Add New</Button>}
      </div>

      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Purchase Order (PO)"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(handleSubmit)} isLoading={createMutation.isPending}>
              Create PO
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <Input
            label="PO Number *"
            placeholder="e.g. PO-2026-005"
            {...form.register('poNumber', { required: 'PO number is required' })}
            error={form.formState.errors.poNumber?.message}
          />
          <Input
            label="Supplier Name *"
            placeholder="e.g. UltraTech Cement Distributors"
            {...form.register('supplier', { required: 'Supplier is required' })}
            error={form.formState.errors.supplier?.message}
          />
          <Input
            label="Expected Delivery Date *"
            type="date"
            {...form.register('deliveryDate', { required: 'Delivery date is required' })}
            error={form.formState.errors.deliveryDate?.message}
          />
        </form>
      </Modal>
    </div>
  );
}
