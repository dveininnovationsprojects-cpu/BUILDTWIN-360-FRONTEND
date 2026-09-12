import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Activity, Layers, ArrowRight } from 'lucide-react';
import { Button, Table, StatusPill, Modal, Input, Select } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { buildingsApi } from '../api/projectsApi';
import {
  BUILDING_TYPES,
  BUILDING_STATUSES,
  BUILDING_TYPE_LABELS,
  formatArea,
} from '../constants';

const EMPTY_BUILDING = {
  code: '',
  name: '',
  buildingType: 'RESIDENTIAL_TOWER',
  totalFloors: '',
  totalBuiltUpAreaSqFt: '',
  status: 'UNDER_CONSTRUCTION',
  description: '',
};

export function BuildingsManager({ siteId, siteName, projectId, onSelectBuilding }) {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [statusBuilding, setStatusBuilding] = useState(null);
  const [deleteBuilding, setDeleteBuilding] = useState(null);
  const [newStatus, setNewStatus] = useState('UNDER_CONSTRUCTION');

  const form = useForm({ defaultValues: EMPTY_BUILDING });

  const { data: buildings = [], isLoading } = useQuery({
    queryKey: ['sites', siteId, 'buildings'],
    queryFn: () => buildingsApi.listBySite(siteId),
    enabled: !!siteId,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => buildingsApi.create(siteId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites', siteId, 'buildings'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Building created successfully.', 'success');
      closeModal();
    },
    onError: (err) => pushToast(err.message || 'Failed to create building.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => buildingsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites', siteId, 'buildings'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Building updated.', 'success');
      closeModal();
    },
    onError: (err) => pushToast(err.message || 'Failed to update building.', 'error'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => buildingsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites', siteId, 'buildings'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Building status updated.', 'success');
      setStatusBuilding(null);
    },
    onError: (err) => pushToast(err.message || 'Failed to update status.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => buildingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites', siteId, 'buildings'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Building deleted.', 'success');
      setDeleteBuilding(null);
    },
    onError: (err) => pushToast(err.message || 'Failed to delete building.', 'error'),
  });

  const openCreate = () => {
    setEditingBuilding(null);
    form.reset(EMPTY_BUILDING);
    setModalOpen(true);
  };

  const openEdit = (building) => {
    setEditingBuilding(building);
    form.reset({
      code: building.code || '',
      name: building.name || '',
      buildingType: building.buildingType || 'RESIDENTIAL_TOWER',
      totalFloors: building.totalFloors != null ? String(building.totalFloors) : '',
      totalBuiltUpAreaSqFt: building.totalBuiltUpAreaSqFt != null ? String(building.totalBuiltUpAreaSqFt) : '',
      status: building.status || 'UNDER_CONSTRUCTION',
      description: building.description || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBuilding(null);
    form.reset(EMPTY_BUILDING);
  };

  const submitForm = (values) => {
    const payload = {
      ...values,
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      totalFloors: values.totalFloors ? Number(values.totalFloors) : null,
      totalBuiltUpAreaSqFt: values.totalBuiltUpAreaSqFt ? Number(values.totalBuiltUpAreaSqFt) : null,
    };
    if (editingBuilding) {
      updateMutation.mutate({ id: editingBuilding.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns = [
    {
      key: 'code',
      header: 'Code',
      render: (row) => <span className="font-semibold text-brand-900">{row.code}</span>,
    },
    { key: 'name', header: 'Building Name' },
    {
      key: 'buildingType',
      header: 'Type',
      render: (row) => (
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          {BUILDING_TYPE_LABELS[row.buildingType] || row.buildingType || '-'}
        </span>
      ),
    },
    {
      key: 'totalFloors',
      header: 'Planned Floors',
      render: (row) => (row.totalFloors != null ? `${row.totalFloors} Floors` : '-'),
    },
    {
      key: 'floorsCount',
      header: 'Registered Floors',
      render: (row) => (row.floorsCount != null ? `${row.floorsCount} Floors` : '-'),
    },
    {
      key: 'totalBuiltUpAreaSqFt',
      header: 'Built-Up Area',
      render: (row) => formatArea(row.totalBuiltUpAreaSqFt),
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
              setStatusBuilding(row);
              setNewStatus(row.status || 'UNDER_CONSTRUCTION');
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
            onClick={() => onSelectBuilding?.(row)}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Floors</span>
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
            onClick={() => setDeleteBuilding(row)}
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
          <h2 className="text-base font-semibold text-brand-900">Buildings / Towers — {siteName}</h2>
          <p className="text-xs text-ink-500">
            Manage buildings, towers, blocks and their floor counts under this site.
          </p>
        </div>
        <Button size="sm" onClick={openCreate} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Building
        </Button>
      </div>

      <Table
        columns={columns}
        data={buildings}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        onRowClick={(row) => onSelectBuilding?.(row)}
      />

      {/* Add/Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="md"
        title={editingBuilding ? 'Edit Building' : 'Create Building / Tower'}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button
              onClick={form.handleSubmit(submitForm)}
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingBuilding ? 'Save Changes' : 'Create Building'}
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(submitForm)}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Building Code *"
              placeholder="BLD-TWR-A"
              error={form.formState.errors.code?.message}
              {...form.register('code', { required: 'Building code is required' })}
            />
            <Input
              label="Building Name *"
              placeholder="Tower A - Residential"
              error={form.formState.errors.name?.message}
              {...form.register('name', { required: 'Building name is required' })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Building Type" options={BUILDING_TYPES} {...form.register('buildingType')} />
            <Select label="Status" options={BUILDING_STATUSES} {...form.register('status')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Planned Floors"
              type="number"
              placeholder="18"
              {...form.register('totalFloors')}
            />
            <Input
              label="Total Built-Up Area (Sq.Ft)"
              type="number"
              placeholder="180000"
              {...form.register('totalBuiltUpAreaSqFt')}
            />
          </div>
          <Input label="Description / Notes" placeholder="Main residential block..." {...form.register('description')} />
        </form>
      </Modal>

      {/* Status Modal */}
      <Modal
        open={!!statusBuilding}
        onClose={() => setStatusBuilding(null)}
        size="sm"
        title="Update Building Status"
        footer={
          <>
            <Button variant="outline" onClick={() => setStatusBuilding(null)}>Cancel</Button>
            <Button
              onClick={() => statusMutation.mutate({ id: statusBuilding.id, status: newStatus })}
              isLoading={statusMutation.isPending}
            >
              Update
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 py-2">
          <p className="text-sm text-ink-600">
            Change status for <strong>{statusBuilding?.name}</strong>:
          </p>
          <Select
            label="Building Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={BUILDING_STATUSES}
          />
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteBuilding}
        onClose={() => setDeleteBuilding(null)}
        size="sm"
        title="Delete Building"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteBuilding(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate(deleteBuilding.id)}
              isLoading={deleteMutation.isPending}
            >
              Delete Building
            </Button>
          </>
        }
      >
        <div className="py-2 text-sm text-ink-700">
          Delete building <strong>{deleteBuilding?.name}</strong>?
          <p className="mt-2 text-xs text-red-600">
            All floors and zones under this building will also be deleted.
          </p>
        </div>
      </Modal>
    </div>
  );
}
