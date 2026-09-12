import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Activity,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';
import {
  Button,
  Table,
  StatusPill,
  Modal,
  Select,
} from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { ROLES } from '@/constants/roles';
import { useHasRole } from '@/context/authStore';
import { projectsApi } from '../api/projectsApi';
import {
  PROJECT_TYPES,
  PROJECT_STATUSES,
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
  formatCurrency,
  formatArea,
} from '../constants';
import { ProjectMetricsBar } from '../components/ProjectMetricsBar';
import { ProjectFormModal } from '../components/ProjectFormModal';
import { ProjectHierarchyWorkspace } from '../components/ProjectHierarchyWorkspace';

// Project & site master — Projects, Sites, Buildings, Floors, Zones, Hierarchy Tree & Validation (FR-010..014)
export function ProjectsListPage() {
  const canManage = useHasRole(ROLES.DIRECTOR, ROLES.PROJECT_MANAGER, ROLES.SYSTEM_ADMIN);
  const canDelete = useHasRole(ROLES.DIRECTOR, ROLES.SYSTEM_ADMIN);
  const pushToast = useToastStore((s) => s.push);
  const queryClient = useQueryClient();

  // Active workspace
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // List filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Project form
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Project status modal
  const [statusProject, setStatusProject] = useState(null);
  const [newProjectStatus, setNewProjectStatus] = useState('ACTIVE');

  // Delete confirmation
  const [deleteProject, setDeleteProject] = useState(null);

  // Fetch projects (GET /api/v1/projects)
  const { data: projects = [], isLoading, refetch } = useQuery({
    queryKey: ['projects', searchQuery, statusFilter, typeFilter],
    queryFn: () =>
      projectsApi.list({
        search: searchQuery || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        projectType: typeFilter !== 'ALL' ? typeFilter : undefined,
      }),
  });

  // Create project mutation (POST /api/v1/projects)
  const createMutation = useMutation({
    mutationFn: (payload) => projectsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-metrics'] });
      pushToast('Project created successfully.', 'success');
      setFormOpen(false);
      setEditingProject(null);
    },
    onError: (err) => pushToast(err.message || 'Failed to create project.', 'error'),
  });

  // Update project mutation (PUT /api/v1/projects/{id})
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => projectsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-metrics'] });
      pushToast('Project updated successfully.', 'success');
      setFormOpen(false);
      setEditingProject(null);
    },
    onError: (err) => pushToast(err.message || 'Failed to update project.', 'error'),
  });

  // Update project status mutation (PATCH /api/v1/projects/{id}/status)
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => projectsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-metrics'] });
      pushToast('Project status updated.', 'success');
      setStatusProject(null);
    },
    onError: (err) => pushToast(err.message || 'Failed to update status.', 'error'),
  });

  // Delete project mutation (DELETE /api/v1/projects/{id})
  const deleteMutation = useMutation({
    mutationFn: (id) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-metrics'] });
      pushToast('Project deleted.', 'success');
      setDeleteProject(null);
    },
    onError: (err) => pushToast(err.message || 'Failed to delete project.', 'error'),
  });

  const openCreate = () => {
    setEditingProject(null);
    setFormOpen(true);
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const handleSave = (values) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, payload: values });
    } else {
      createMutation.mutate(values);
    }
  };

  // If a project is selected → show workspace
  if (selectedProjectId) {
    return (
      <ProjectHierarchyWorkspace
        projectId={selectedProjectId}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  const columns = [
    {
      key: 'code',
      header: 'Project Code',
      render: (row) => (
        <span className="font-mono text-xs font-bold bg-brand-50 text-brand-700 px-2 py-1 rounded">
          {row.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Project Name',
      render: (row) => (
        <div>
          <p className="font-semibold text-ink-900">{row.name}</p>
          {row.location && (
            <p className="text-xs text-ink-400 truncate max-w-[200px]">{row.location}</p>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => {
        const t = row.projectType || row.type;
        return t ? (
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
            {PROJECT_TYPE_LABELS[t] || t}
          </span>
        ) : '-';
      },
    },
    {
      key: 'clientName',
      header: 'Client',
      render: (row) => row.clientName || row.client || '-',
    },
    {
      key: 'estimatedBudget',
      header: 'Budget',
      render: (row) =>
        row.estimatedBudget ? (
          <span className="text-sm font-medium text-emerald-700">
            {formatCurrency(row.estimatedBudget)}
          </span>
        ) : (
          '-'
        ),
    },
    {
      key: 'totalBuiltUpAreaSqFt',
      header: 'Built-Up Area',
      render: (row) => (row.totalBuiltUpAreaSqFt ? formatArea(row.totalBuiltUpAreaSqFt) : '-'),
    },
    {
      key: 'dates',
      header: 'Timeline',
      render: (row) => {
        const start = row.plannedStartDate || row.startDate;
        const end = row.plannedEndDate || row.endDate;
        return start ? (
          <div className="text-xs text-ink-600">
            <p>{start}</p>
            {end && <p>→ {end}</p>}
          </div>
        ) : '-';
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <StatusPill status={row.status} />
          {canManage && (
            <button
              type="button"
              title="Change Status"
              onClick={(e) => {
                e.stopPropagation();
                setStatusProject(row);
                setNewProjectStatus(row.status || 'ACTIVE');
              }}
              className="rounded p-1 text-ink-400 hover:bg-brand-50 hover:text-brand-700"
            >
              <Activity className="h-3.5 w-3.5" />
            </button>
          )}
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
            onClick={() => setSelectedProjectId(row.id)}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span>Explore</span>
          </Button>
          {canManage && (
            <button
              type="button"
              title="Edit Project"
              onClick={() => openEdit(row)}
              className="rounded p-1.5 text-ink-500 hover:bg-black/5"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              title="Delete Project"
              onClick={() => setDeleteProject(row)}
              className="rounded p-1.5 text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-heading">Construction Projects</h1>
          <p className="page-subheading">
            Project master registry — manage sites, buildings, floors, zones and hierarchy.
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={openCreate} className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* KPI Metrics Bar */}
      <ProjectMetricsBar />

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-surface-border bg-white/60 px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            type="text"
            placeholder="Search by name, code, or location…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-ink-400 hover:text-ink-700 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-ink-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-surface-border bg-white/60 px-3 py-2 text-sm text-ink-900 outline-none"
          >
            <option value="ALL">All Statuses</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-surface-border bg-white/60 px-3 py-2 text-sm text-ink-900 outline-none"
        >
          <option value="ALL">All Types</option>
          {PROJECT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Refresh */}
        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-700 font-medium rounded-lg border border-surface-border bg-white/60 px-3 py-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Projects Table */}
      <Table
        columns={columns}
        data={projects}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        onRowClick={(row) => setSelectedProjectId(row.id)}
      />

      {/* Project Create/Edit Form Modal */}
      <ProjectFormModal
        open={isFormOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSave}
        project={editingProject}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      {/* Project Status Update Modal */}
      <Modal
        open={!!statusProject}
        onClose={() => setStatusProject(null)}
        size="sm"
        title="Update Project Status"
        footer={
          <>
            <Button variant="outline" onClick={() => setStatusProject(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => statusMutation.mutate({ id: statusProject.id, status: newProjectStatus })}
              isLoading={statusMutation.isPending}
            >
              Update Status
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 py-2">
          <p className="text-sm text-ink-600">
            Change lifecycle status for{' '}
            <strong className="text-ink-900">{statusProject?.name}</strong>:
          </p>
          <Select
            label="New Status"
            value={newProjectStatus}
            onChange={(e) => setNewProjectStatus(e.target.value)}
            options={PROJECT_STATUSES}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteProject}
        onClose={() => setDeleteProject(null)}
        size="sm"
        title="Delete Project"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteProject(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate(deleteProject.id)}
              isLoading={deleteMutation.isPending}
            >
              Delete Project
            </Button>
          </>
        }
      >
        <div className="py-2 text-sm text-ink-700">
          Permanently delete project{' '}
          <strong>{deleteProject?.name}</strong> ({deleteProject?.code})?
          <p className="mt-2 text-xs text-red-600">
            Warning: All sites, buildings, floors, and zones under this project will also be deleted.
          </p>
        </div>
      </Modal>
    </div>
  );
}
