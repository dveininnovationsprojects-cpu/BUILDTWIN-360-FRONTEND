import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Button, Table, StatusPill, Modal, Input, Select, Textarea } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { ROLES } from '@/constants/roles';
import { useHasRole } from '@/context/authStore';
import { projectsApi } from '../api/projectsApi';
import { PROJECT_TYPES, PROJECT_STATUSES, PROJECT_TYPE_LABELS } from '../constants';

const EMPTY_PROJECT = {
  code: '',
  name: '',
  type: '',
  client: '',
  location: '',
  status: 'PLANNING',
  startDate: '',
  endDate: '',
  description: '',
};

// Project & site master — code, type, client, buildings/floors/zones (FR-010..014).
export function ProjectsListPage() {
  const canManageProjects = useHasRole(ROLES.DIRECTOR, ROLES.PROJECT_MANAGER, ROLES.SYSTEM_ADMIN);
  const pushToast = useToastStore((s) => s.push);
  const queryClient = useQueryClient();

  const [isFormOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // null = creating a new project

  const { data, isLoading } = useQuery({ queryKey: ['projects'], queryFn: () => projectsApi.list() });

  const form = useForm({ defaultValues: EMPTY_PROJECT });

  const createMutation = useMutation({
    mutationFn: (payload) => projectsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      pushToast('Project created.', 'success');
      closeFormModal();
    },
    onError: (error) => pushToast(error instanceof Error ? error.message : 'Unable to create project.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => projectsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      pushToast('Project updated.', 'success');
      closeFormModal();
    },
    onError: (error) => pushToast(error instanceof Error ? error.message : 'Unable to update project.', 'error'),
  });

  function openCreateModal() {
    setEditingProject(null);
    form.reset(EMPTY_PROJECT);
    setFormOpen(true);
  }

  function openEditModal(project) {
    setEditingProject(project);
    form.reset({
      code: project.code ?? '',
      name: project.name ?? '',
      type: project.type ?? '',
      client: project.client ?? '',
      location: project.location ?? '',
      status: project.status ?? 'PLANNING',
      startDate: project.startDate ?? '',
      endDate: project.endDate ?? '',
      description: project.description ?? '',
    });
    setFormOpen(true);
  }

  function closeFormModal() {
    setFormOpen(false);
    setEditingProject(null);
    form.reset(EMPTY_PROJECT);
  }

  function submitForm(values) {
    const payload = {
      code: values.code.trim(),
      name: values.name.trim(),
      type: values.type,
      client: values.client.trim(),
      location: values.location.trim(),
      status: values.status,
      startDate: values.startDate,
      endDate: values.endDate || '',
      description: values.description?.trim() ?? '',
    };
    if (editingProject) updateMutation.mutate({ id: editingProject.id, payload });
    else createMutation.mutate(payload);
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'type', header: 'Type', render: (row) => PROJECT_TYPE_LABELS[row.type] ?? row.type },
    { key: 'client', header: 'Client' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
    ...(canManageProjects
      ? [
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (row) => (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => openEditModal(row)}>
                  Edit
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Projects</h1>
          <p className="page-subheading">
            Project & site master — code, type, client, buildings/floors/zones (FR-010..014).
          </p>
        </div>
        {canManageProjects && (
          <Button size="sm" onClick={openCreateModal}>
            Add New
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        data={data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        onRowClick={canManageProjects ? openEditModal : undefined}
      />

      <Modal
        open={isFormOpen}
        onClose={closeFormModal}
        title={editingProject ? 'Edit project' : 'Add project'}
        footer={
          <>
            <Button variant="outline" onClick={closeFormModal}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(submitForm)} isLoading={isSaving}>
              {editingProject ? 'Save changes' : 'Create project'}
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(submitForm)}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Project code"
              placeholder="PRJ-001"
              error={form.formState.errors.code?.message}
              {...form.register('code', { required: 'Project code is required' })}
            />
            <Select
              label="Status"
              options={PROJECT_STATUSES}
              error={form.formState.errors.status?.message}
              {...form.register('status', { required: 'Status is required' })}
            />
          </div>

          <Input
            label="Project name"
            error={form.formState.errors.name?.message}
            {...form.register('name', { required: 'Project name is required' })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              placeholder="Select a type"
              options={PROJECT_TYPES}
              error={form.formState.errors.type?.message}
              {...form.register('type', { required: 'Project type is required' })}
            />
            <Input
              label="Client"
              error={form.formState.errors.client?.message}
              {...form.register('client', { required: 'Client is required' })}
            />
          </div>

          <Input label="Location / site address" {...form.register('location')} />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start date"
              type="date"
              error={form.formState.errors.startDate?.message}
              {...form.register('startDate', { required: 'Start date is required' })}
            />
            <Input
              label="End date"
              type="date"
              hint="Leave blank while the project is ongoing."
              error={form.formState.errors.endDate?.message}
              {...form.register('endDate', {
                validate: (value) =>
                  !value || !form.getValues('startDate') || value >= form.getValues('startDate')
                    || 'End date must be on or after the start date',
              })}
            />
          </div>

          <Textarea
            label="Buildings / floors / zones"
            hint="Summarize the site structure, e.g. 3 buildings, 12 floors, 4 zones."
            {...form.register('description')}
          />
        </form>
      </Modal>
    </div>
  );
}
