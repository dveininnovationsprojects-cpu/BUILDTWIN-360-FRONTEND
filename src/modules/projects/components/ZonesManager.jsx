import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Activity } from 'lucide-react';
import { Button, Table, StatusPill, Modal, Input, Select } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { zonesApi } from '../api/projectsApi';
import { ZONE_TYPES, ZONE_STATUSES, ZONE_TYPE_LABELS, formatArea } from '../constants';

const EMPTY_ZONE = {
  code: '',
  name: '',
  zoneType: 'RESIDENTIAL_UNIT',
  areaSqFt: '',
  status: 'IN_PROGRESS',
};

export function ZonesManager({ floorId, floorName, projectId }) {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [statusZone, setStatusZone] = useState(null);
  const [deleteZone, setDeleteZone] = useState(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');

  const form = useForm({ defaultValues: EMPTY_ZONE });

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['floors', floorId, 'zones'],
    queryFn: () => zonesApi.listByFloor(floorId),
    enabled: !!floorId,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => zonesApi.create(floorId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floors', floorId, 'zones'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Zone created successfully.', 'success');
      closeModal();
    },
    onError: (err) => pushToast(err.message || 'Failed to create zone.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => zonesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floors', floorId, 'zones'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Zone updated.', 'success');
      closeModal();
    },
    onError: (err) => pushToast(err.message || 'Failed to update zone.', 'error'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => zonesApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floors', floorId, 'zones'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Zone status updated.', 'success');
      setStatusZone(null);
    },
    onError: (err) => pushToast(err.message || 'Failed to update status.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => zonesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floors', floorId, 'zones'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Zone deleted.', 'success');
      setDeleteZone(null);
    },
    onError: (err) => pushToast(err.message || 'Failed to delete zone.', 'error'),
  });

  const openCreate = () => {
    setEditingZone(null);
    form.reset(EMPTY_ZONE);
    setModalOpen(true);
  };

  const openEdit = (zone) => {
    setEditingZone(zone);
    form.reset({
      code: zone.code || '',
      name: zone.name || '',
      zoneType: zone.zoneType || 'RESIDENTIAL_UNIT',
      areaSqFt: zone.areaSqFt != null ? String(zone.areaSqFt) : '',
      status: zone.status || 'IN_PROGRESS',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingZone(null);
    form.reset(EMPTY_ZONE);
  };

  const submitForm = (values) => {
    const payload = {
      ...values,
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      areaSqFt: values.areaSqFt ? Number(values.areaSqFt) : null,
    };
    if (editingZone) {
      updateMutation.mutate({ id: editingZone.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Zone type color map
  const zoneTypeColors = {
    RESIDENTIAL_UNIT: 'bg-emerald-50 text-emerald-700',
    COMMON_AREA: 'bg-sky-50 text-sky-700',
    CORRIDOR: 'bg-gray-50 text-gray-700',
    ELECTRICAL_ROOM: 'bg-yellow-50 text-yellow-700',
    DUCT_SHAFT: 'bg-orange-50 text-orange-700',
    STAIRCASE: 'bg-purple-50 text-purple-700',
  };

  const columns = [
    {
      key: 'code',
      header: 'Zone Code',
      render: (row) => (
        <span className="font-mono text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-1 rounded">
          {row.code}
        </span>
      ),
    },
    { key: 'name', header: 'Zone / Unit Name' },
    {
      key: 'zoneType',
      header: 'Zone Type',
      render: (row) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${zoneTypeColors[row.zoneType] || 'bg-gray-50 text-gray-700'}`}
        >
          {ZONE_TYPE_LABELS[row.zoneType] || row.zoneType || '-'}
        </span>
      ),
    },
    {
      key: 'areaSqFt',
      header: 'Area',
      render: (row) => formatArea(row.areaSqFt),
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
              setStatusZone(row);
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
            onClick={() => setDeleteZone(row)}
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
          <h2 className="text-base font-semibold text-brand-900">Zones / Units — {floorName}</h2>
          <p className="text-xs text-ink-500">
            Manage flats, units, corridors, electrical rooms and other zone types on this floor.
          </p>
        </div>
        <Button size="sm" onClick={openCreate} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Zone
        </Button>
      </div>

      <Table
        columns={columns}
        data={zones}
        rowKey={(row) => row.id}
        isLoading={isLoading}
      />

      {/* Add/Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="sm"
        title={editingZone ? 'Edit Zone / Unit' : 'Create Zone / Unit'}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button
              onClick={form.handleSubmit(submitForm)}
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingZone ? 'Save Changes' : 'Create Zone'}
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(submitForm)}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Zone Code *"
              placeholder="ZN-FL1-A"
              error={form.formState.errors.code?.message}
              {...form.register('code', { required: 'Zone code is required' })}
            />
            <Input
              label="Zone Name *"
              placeholder="Zone A (Flats 101-104)"
              error={form.formState.errors.name?.message}
              {...form.register('name', { required: 'Zone name is required' })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Zone Type" options={ZONE_TYPES} {...form.register('zoneType')} />
            <Select label="Status" options={ZONE_STATUSES} {...form.register('status')} />
          </div>
          <Input
            label="Area (Sq.Ft)"
            type="number"
            placeholder="4500"
            {...form.register('areaSqFt')}
          />
        </form>
      </Modal>

      {/* Status Modal */}
      <Modal
        open={!!statusZone}
        onClose={() => setStatusZone(null)}
        size="sm"
        title="Update Zone Status"
        footer={
          <>
            <Button variant="outline" onClick={() => setStatusZone(null)}>Cancel</Button>
            <Button
              onClick={() => statusMutation.mutate({ id: statusZone.id, status: newStatus })}
              isLoading={statusMutation.isPending}
            >
              Update
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 py-2">
          <p className="text-sm text-ink-600">
            Change status for zone <strong>{statusZone?.name}</strong>:
          </p>
          <Select
            label="Zone Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={ZONE_STATUSES}
          />
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteZone}
        onClose={() => setDeleteZone(null)}
        size="sm"
        title="Delete Zone"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteZone(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate(deleteZone.id)}
              isLoading={deleteMutation.isPending}
            >
              Delete Zone
            </Button>
          </>
        }
      >
        <div className="py-2 text-sm text-ink-700">
          Permanently delete zone <strong>{deleteZone?.name}</strong> ({deleteZone?.code})?
        </div>
      </Modal>
    </div>
  );
}
