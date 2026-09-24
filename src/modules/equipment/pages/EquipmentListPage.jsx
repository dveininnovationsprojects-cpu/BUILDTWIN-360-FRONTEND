import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table, Button, Modal, Input, StatusPill } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { equipmentApi } from '../api/equipmentApi';

// Equipment/asset register, site allocation, downtime and usage hours (FR-100..102).
export function EquipmentListPage() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const canManage = useHasRole(
    ROLES.SITE_ENGINEER,
    ROLES.PROJECT_MANAGER,
    ROLES.DIRECTOR,
    ROLES.ADMIN,
    ROLES.PROCUREMENT_STORE
  );

  const form = useForm({
    defaultValues: {
      assetCode: `EQ-00${Math.floor(Math.random() * 90 + 10)}`,
      type: '',
      site: 'PRJ-001 Padur Residence',
      status: 'ACTIVE',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => equipmentApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => equipmentApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      pushToast('Equipment asset registered successfully.', 'success');
      setIsOpen(false);
      form.reset();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to register equipment.', 'error');
    },
  });

  const columns = [
    { key: 'assetCode', header: 'Asset Code' },
    { key: 'type', header: 'Equipment Type' },
    { key: 'site', header: 'Assigned Site' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status || 'ACTIVE'} /> },
  ];

  function handleSubmit(values) {
    createMutation.mutate({
      assetCode: values.assetCode,
      type: values.type,
      site: values.site,
      status: values.status,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Equipment & Machinery</h1>
        </div>
        {canManage && <Button size="sm" onClick={() => setIsOpen(true)}>Add New</Button>}
      </div>

      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Register Equipment Asset"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(handleSubmit)} isLoading={createMutation.isPending}>
              Register Equipment
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <Input
            label="Asset Code *"
            placeholder="e.g. EQ-TC-05"
            {...form.register('assetCode', { required: 'Asset code is required' })}
            error={form.formState.errors.assetCode?.message}
          />
          <Input
            label="Equipment Type / Model *"
            placeholder="e.g. Tower Crane 5T"
            {...form.register('type', { required: 'Equipment type is required' })}
            error={form.formState.errors.type?.message}
          />
          <Input
            label="Assigned Site *"
            placeholder="e.g. PRJ-001 Padur Residence"
            {...form.register('site', { required: 'Site is required' })}
            error={form.formState.errors.site?.message}
          />
        </form>
      </Modal>
    </div>
  );
}
