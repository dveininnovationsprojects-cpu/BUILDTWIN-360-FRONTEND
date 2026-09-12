import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Plus,
  MapPin,
  Building,
  Edit2,
  Trash2,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Button, Table, StatusPill, Modal, Input, Select } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { sitesApi } from '../api/projectsApi';
import {
  SITE_TYPES,
  SITE_STATUSES,
  SITE_TYPE_LABELS,
  formatArea,
} from '../constants';

const EMPTY_SITE = {
  code: '',
  name: '',
  siteType: 'BUILDING_TOWER',
  location: '',
  status: 'ACTIVE',
  latitude: '',
  longitude: '',
  areaSqFt: '',
  siteIncharge: '',
};

export function SitesManager({ projectId, projectName, onSelectSite }) {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [statusSite, setStatusSite] = useState(null);
  const [deleteSite, setDeleteSite] = useState(null);
  const [newStatus, setNewStatus] = useState('ACTIVE');

  const form = useForm({ defaultValues: EMPTY_SITE });

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['projects', projectId, 'sites'],
    queryFn: () => sitesApi.listByProject(projectId),
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => sitesApi.create(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'sites'] });
      queryClient.invalidateQueries({ queryKey: ['projects-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Site added successfully.', 'success');
      closeModal();
    },
    onError: (err) => pushToast(err.message || 'Failed to create site.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => sitesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'sites'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Site updated successfully.', 'success');
      closeModal();
    },
    onError: (err) => pushToast(err.message || 'Failed to update site.', 'error'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => sitesApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'sites'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Site status updated.', 'success');
      setStatusSite(null);
    },
    onError: (err) => pushToast(err.message || 'Failed to update status.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => sitesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'sites'] });
      queryClient.invalidateQueries({ queryKey: ['projects-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy-tree', projectId] });
      pushToast('Site deleted.', 'success');
      setDeleteSite(null);
    },
    onError: (err) => pushToast(err.message || 'Failed to delete site.', 'error'),
  });

  const openCreate = () => {
    setEditingSite(null);
    form.reset(EMPTY_SITE);
    setModalOpen(true);
  };

  const openEdit = (site) => {
    setEditingSite(site);
    form.reset({
      code: site.code || '',
      name: site.name || '',
      siteType: site.siteType || 'BUILDING_TOWER',
      location: site.location || '',
      status: site.status || 'ACTIVE',
      latitude: site.latitude != null ? String(site.latitude) : '',
      longitude: site.longitude != null ? String(site.longitude) : '',
      areaSqFt: site.areaSqFt != null ? String(site.areaSqFt) : '',
      siteIncharge: site.siteIncharge || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSite(null);
    form.reset(EMPTY_SITE);
  };

  const submitForm = (values) => {
    const payload = {
      ...values,
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
    };
    if (editingSite) {
      updateMutation.mutate({ id: editingSite.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns = [
    { key: 'code', header: 'Site Code', render: (row) => <span className="font-semibold text-brand-900">{row.code}</span> },
    { key: 'name', header: 'Site / Tower Name' },
    {
      key: 'siteType',
      header: 'Type',
      render: (row) => (
        <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium">
          {SITE_TYPE_LABELS[row.siteType] || row.siteType}
        </span>
      ),
    },
    { key: 'siteIncharge', header: 'Site Incharge', render: (row) => row.siteIncharge || '-' },
    { key: 'areaSqFt', header: 'Area', render: (row) => formatArea(row.areaSqFt) },
    {
      key: 'coordinates',
      header: 'GPS Coordinates',
      render: (row) =>
        row.latitude && row.longitude ? (
          <span className="inline-flex items-center gap-1 text-xs text-ink-600">
            <MapPin className="h-3 w-3 text-brand-500" />
            {row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}
          </span>
        ) : (
          <span className="text-xs text-ink-400">N/A</span>
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
            title="Change Site Status"
            onClick={(e) => {
              e.stopPropagation();
              setStatusSite(row);
              setNewStatus(row.status || 'ACTIVE');
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
            onClick={() => onSelectSite?.(row)}
          >
            <Building className="h-3.5 w-3.5" />
            <span>Buildings</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <button
            type="button"
            title="Edit Site"
            onClick={() => openEdit(row)}
            className="rounded p-1.5 text-ink-500 hover:bg-black/5"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Delete Site"
            onClick={() => setDeleteSite(row)}
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
          <h2 className="text-base font-semibold text-brand-900">
            Physical Sites & Towers — {projectName}
          </h2>
          <p className="text-xs text-ink-500">
            Manage construction zones, towers, GPS locations, and site engineering leadership.
          </p>
        </div>
        <Button size="sm" onClick={openCreate} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Site / Tower
        </Button>
      </div>

      <Table
        columns={columns}
        data={sites}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        onRowClick={(row) => onSelectSite?.(row)}
      />

      {/* Add/Edit Site Modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="md"
        title={editingSite ? 'Edit Site / Tower' : 'Add Physical Construction Site'}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(submitForm)}
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingSite ? 'Save Changes' : 'Add Site'}
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(submitForm)}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Site Code *"
              placeholder="PADUR-TWR-A"
              error={form.formState.errors.code?.message}
              {...form.register('code', { required: 'Site code is required' })}
            />
            <Input
              label="Site Name *"
              placeholder="Tower A (Stilt + 18 Floors)"
              error={form.formState.errors.name?.message}
              {...form.register('name', { required: 'Site name is required' })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Site Type"
              options={SITE_TYPES}
              {...form.register('siteType')}
            />
            <Select
              label="Status"
              options={SITE_STATUSES}
              {...form.register('status')}
            />
          </div>

          <Input
            label="Location / Campus Zone"
            placeholder="North Zone, Ashok Grandeur Campus"
            {...form.register('location')}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Latitude"
              type="number"
              step="any"
              placeholder="12.7932"
              {...form.register('latitude')}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              placeholder="80.2241"
              {...form.register('longitude')}
            />
            <Input
              label="Area (Sq.Ft)"
              type="number"
              placeholder="85000"
              {...form.register('areaSqFt')}
            />
          </div>

          <Input
            label="Site Incharge / Lead Engineer"
            placeholder="Suresh Kumar"
            {...form.register('siteIncharge')}
          />
        </form>
      </Modal>

      {/* Quick Status Update Modal */}
      <Modal
        open={!!statusSite}
        onClose={() => setStatusSite(null)}
        size="sm"
        title="Update Site Status"
        footer={
          <>
            <Button variant="outline" onClick={() => setStatusSite(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                statusMutation.mutate({ id: statusSite.id, status: newStatus })
              }
              isLoading={statusMutation.isPending}
            >
              Update Status
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 py-2">
          <p className="text-sm text-ink-600">
            Change status for site <strong>{statusSite?.name}</strong>:
          </p>
          <Select
            label="Site Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={SITE_STATUSES}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteSite}
        onClose={() => setDeleteSite(null)}
        size="sm"
        title="Delete Site"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteSite(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate(deleteSite.id)}
              isLoading={deleteMutation.isPending}
            >
              Delete Site
            </Button>
          </>
        }
      >
        <div className="py-2 text-sm text-ink-700">
          Are you sure you want to delete site <strong>{deleteSite?.name}</strong> ({deleteSite?.code})?
          <p className="mt-2 text-xs text-red-600">
            Warning: All associated buildings, floors, and zones under this site will also be deleted.
          </p>
        </div>
      </Modal>
    </div>
  );
}
