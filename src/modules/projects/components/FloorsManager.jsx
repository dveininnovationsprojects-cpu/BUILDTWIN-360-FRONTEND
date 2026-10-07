import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Activity, Grid, ArrowRight } from 'lucide-react';
import { Button, Table, StatusPill, Modal, Input, Select } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { floorsApi } from '../api/projectsApi';
import { FLOOR_TYPES, FLOOR_STATUSES, FLOOR_TYPE_LABELS, formatArea } from '../constants';

const EMPTY_FLOOR = {
  floorNumber: '',
  floorName: '',
  floorType: 'TYPICAL',
  builtUpAreaSqFt: '',
  status: 'IN_PROGRESS',
};

export function FloorsManager({ buildingId, buildingName, projectId, onSelectFloor }) {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [statusFloor, setStatusFloor] = useState(null);
  const [deleteFloor, setDeleteFloor] = useState(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');

  const form = useForm({ defaultValues: EMPTY_FLOOR });

  const { data: floors = [], isLoading } = useQuery({
    queryKey: ['buildings', buildingId, 'floors'],
    queryFn: () => floorsApi.listByBuilding(buildingId),
    enabled: !!buildingId,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => floorsApi.create(buildingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings', buildingId, 'floors'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Floor created successfully.', 'success');
      closeModal();
    },
    onError: (err) => pushToast(err.message || 'Failed to create floor.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => floorsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings', buildingId, 'floors'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Floor updated.', 'success');
      closeModal();
    },
    onError: (err) => pushToast(err.message || 'Failed to update floor.', 'error'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => floorsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings', buildingId, 'floors'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Floor status updated.', 'success');
      setStatusFloor(null);
    },
    onError: (err) => pushToast(err.message || 'Failed to update status.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => floorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings', buildingId, 'floors'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Floor deleted.', 'success');
      setDeleteFloor(null);
    },
    onError: (err) => pushToast(err.message || 'Failed to delete floor.', 'error'),
  });

  const openCreate = () => {
    setEditingFloor(null);
    form.reset(EMPTY_FLOOR);
    setModalOpen(true);
  };

  const openEdit = (floor) => {
    setEditingFloor(floor);
    form.reset({
      floorNumber: floor.floorNumber != null ? String(floor.floorNumber) : '',
      floorName: floor.floorName || '',
      floorType: floor.floorType || 'TYPICAL',
      builtUpAreaSqFt: floor.builtUpAreaSqFt != null ? String(floor.builtUpAreaSqFt) : '',
      status: floor.status || 'IN_PROGRESS',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFloor(null);
    form.reset(EMPTY_FLOOR);
  };

  const submitForm = (values) => {
    const payload = {
      ...values,
      floorNumber: Number(values.floorNumber),
      builtUpAreaSqFt: values.builtUpAreaSqFt ? Number(values.builtUpAreaSqFt) : null,
    };
    if (editingFloor) {
      updateMutation.mutate({ id: editingFloor.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getFloorLabel = (num) => {
    if (num < 0) return `Basement B${Math.abs(num)}`;
    if (num === 0) return 'Stilt / Ground Level';
    return `Floor ${num}`;
  };

  const columns = [
    {
      key: 'floorNumber',
      header: 'Floor No.',
      render: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
          {row.floorNumber >= 0 ? row.floorNumber : `B${Math.abs(row.floorNumber)}`}
        </span>
      ),
    },
    {
      key: 'floorName',
      header: 'Floor Name',
      render: (row) => (
        <div>
          <p className="font-medium text-ink-900">{row.floorName}</p>
          <p className="text-xs text-ink-400">{getFloorLabel(row.floorNumber)}</p>
        </div>
      ),
    },
    {
      key: 'floorType',
      header: 'Type',
      render: (row) => (
        <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">
          {FLOOR_TYPE_LABELS[row.floorType] || row.floorType || '-'}
        </span>
      ),
    },
    {
      key: 'builtUpAreaSqFt',
      header: 'Built-Up Area',
      render: (row) => formatArea(row.builtUpAreaSqFt),
    },
    {
      key: 'zonesCount',
      header: 'Zones',
      render: (row) => (
        <span className="text-xs font-medium text-ink-700">
          {row.zonesCount != null ? `${row.zonesCount} Zones` : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <StatusPill status={row.status} />
          <button
            type="button"
            title="Change Status"
            onClick={(e) => {
              e.stopPropagation();
              setStatusFloor(row);
              setNewStatus(row.status || 'IN_PROGRESS');
            }}
            className="rounded p-1 text-ink-400 hover:bg-brand-50 hover:text-brand-700"
          >
            <Activity className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1 text-brand-700 border-brand-200 hover:bg-brand-50"
            onClick={() => onSelectFloor?.(row)}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Zones</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <button
            type="button"
            title="Edit"
            onClick={() => openEdit(row)}
            className="rounded p-1.5 text-ink-500 hover:bg-black/5"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Delete"
            onClick={() => setDeleteFloor(row)}
            className="rounded p-1.5 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/40 p-4 rounded-xl border border-surface-border">
        <div>
          <h2 className="text-base font-semibold text-brand-900">Floors / Slabs — {buildingName}</h2>
          <p className="text-xs text-ink-500">
            Manage floor levels (Basement, Stilt, Typical, Terrace) and their construction status.
          </p>
        </div>
        <Button size="sm" onClick={openCreate} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Floor
        </Button>
      </div>

      <Table
        columns={columns}
        data={floors}
        rowKey={(row) => row.id}
        isLoading={isLoading}
      />

      {/* Add/Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="sm"
        title={editingFloor ? 'Edit Floor / Slab' : 'Add Floor / Slab Level'}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button
              onClick={form.handleSubmit(submitForm)}
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingFloor ? 'Save Changes' : 'Add Floor'}
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(submitForm)}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Floor Number *"
              type="number"
              placeholder="-1 / 0 / 1"
              hint="-1 = B1, 0 = Stilt, 1+ = Floors"
              error={form.formState.errors.floorNumber?.message}
              {...form.register('floorNumber', { required: 'Floor number is required' })}
            />
            <Input
              label="Floor Name *"
              placeholder="First Typical Floor"
              error={form.formState.errors.floorName?.message}
              {...form.register('floorName', { required: 'Floor name is required' })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Floor Type" options={FLOOR_TYPES} {...form.register('floorType')} />
            <Select label="Status" options={FLOOR_STATUSES} {...form.register('status')} />
          </div>
          <Input
            label="Built-Up Area (Sq.Ft)"
            type="number"
            placeholder="10000"
            {...form.register('builtUpAreaSqFt')}
          />
        </form>
      </Modal>

      {/* Status Modal */}
      <Modal
        open={!!statusFloor}
        onClose={() => setStatusFloor(null)}
        size="sm"
        title="Change Floor Status"
        footer={
          <>
            <Button variant="outline" onClick={() => setStatusFloor(null)}>Cancel</Button>
            <Button
              onClick={() => statusMutation.mutate({ id: statusFloor.id, status: newStatus })}
              isLoading={statusMutation.isPending}
            >
              Update
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 py-2">
          <p className="text-sm text-ink-600">
            Change status for <strong>{statusFloor?.floorName}</strong>:
          </p>
          <Select
            label="Floor Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={FLOOR_STATUSES}
          />
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteFloor}
        onClose={() => setDeleteFloor(null)}
        size="sm"
        title="Delete Floor"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteFloor(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate(deleteFloor.id)}
              isLoading={deleteMutation.isPending}
            >
              Delete Floor
            </Button>
          </>
        }
      >
        <div className="py-2 text-sm text-ink-700">
          Delete floor <strong>{deleteFloor?.floorName}</strong>?
          <p className="mt-2 text-xs text-red-600">
            All zones on this floor will also be deleted.
          </p>
        </div>
      </Modal>
    </div>
  );
}
