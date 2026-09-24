import { useState, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Activity,
  Table as TableIcon,
  CalendarDays,
  HardHat,
} from 'lucide-react';
import { Table, StatusPill, Button, Modal } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { formatCurrency } from '@/modules/projects/constants';
import { projectsApi, sitesApi } from '@/modules/projects/api/projectsApi';
import { wbsScheduleApi } from '../api/wbsScheduleApi';
import { WbsScheduleForm } from '../components/WbsScheduleForm';
import { WbsMetricsBar } from '../components/WbsMetricsBar';
import { WbsStatusModal } from '../components/WbsStatusModal';
import { WbsTimelineView } from '../components/WbsTimelineView';
import {
  WBS_DISCIPLINES,
  WBS_STATUSES,
  DISCIPLINE_LABELS,
  DISCIPLINE_BADGES,
} from '../constants/wbsConstants';

// Work Breakdown Structure (WBS) & Work Package Management (FR-020..025)
export function WbsScheduleListPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  // View mode
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'timeline'

  // Selected Project (Defaults to 1 or first available project)
  const [selectedProjectId, setSelectedProjectId] = useState(1);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [siteFilter, setSiteFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [statusPackage, setStatusPackage] = useState(null);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);

  // RBAC Permissions
  const canManage = useHasRole(ROLES.ADMIN, ROLES.DIRECTOR, ROLES.PROJECT_MANAGER);
  const canUpdateStatus = useHasRole(
    ROLES.ADMIN,
    ROLES.DIRECTOR,
    ROLES.PROJECT_MANAGER,
    ROLES.SITE_ENGINEER
  );

  // 1. Fetch available projects for dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list-simple'],
    queryFn: () => projectsApi.list(),
  });

  // Ensure selected project points to a valid project id if available
  const effectiveProjectId = useMemo(() => {
    if (selectedProjectId && projects.some((p) => p.id === selectedProjectId)) {
      return selectedProjectId;
    }
    return projects.length > 0 ? projects[0].id : 1;
  }, [selectedProjectId, projects]);

  // 2. Fetch sites under selected project
  const { data: sites = [] } = useQuery({
    queryKey: ['projects', effectiveProjectId, 'sites'],
    queryFn: () => sitesApi.listByProject(effectiveProjectId),
    enabled: !!effectiveProjectId,
  });

  // 3. Fetch Work Packages under selected project
  const {
    data: rawPackages = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['work-packages', effectiveProjectId, statusFilter, disciplineFilter],
    queryFn: () =>
      wbsScheduleApi.list(effectiveProjectId, {
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        discipline: disciplineFilter !== 'ALL' ? disciplineFilter : undefined,
      }),
    enabled: !!effectiveProjectId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload) => wbsScheduleApi.create(effectiveProjectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-packages'] });
      pushToast('Work package created successfully.', 'success');
      setAddModalOpen(false);
    },
    onError: (err) => {
      pushToast(err.message || 'Failed to create work package.', 'error');
    },
    onSettled: () => setSubmitting(false),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => wbsScheduleApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-packages'] });
      pushToast('Work package updated successfully.', 'success');
      setEditingPackage(null);
    },
    onError: (err) => {
      pushToast(err.message || 'Failed to update work package.', 'error');
    },
    onSettled: () => setSubmitting(false),
  });

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => wbsScheduleApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-packages'] });
      pushToast('Work package status updated.', 'success');
      setStatusPackage(null);
    },
    onError: (err) => {
      pushToast(err.message || 'Failed to update status.', 'error');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => wbsScheduleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-packages'] });
      pushToast('Work package deleted successfully.', 'success');
      setPackageToDelete(null);
    },
    onError: (err) => {
      pushToast(err.message || 'Failed to delete work package.', 'error');
    },
  });

  // Client-side filtering for search query & site
  const filteredPackages = useMemo(() => {
    let list = Array.isArray(rawPackages) ? rawPackages : [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (w) =>
          (w.code && w.code.toLowerCase().includes(q)) ||
          (w.name && w.name.toLowerCase().includes(q)) ||
          (w.assignedContractor && w.assignedContractor.toLowerCase().includes(q)) ||
          (w.description && w.description.toLowerCase().includes(q))
      );
    }
    if (siteFilter !== 'ALL') {
      list = list.filter((w) => String(w.siteId) === String(siteFilter));
    }
    return list;
  }, [rawPackages, searchQuery, siteFilter]);

  // Form submit handlers
  async function handleCreateSubmit(payload) {
    setSubmitting(true);
    createMutation.mutate(payload);
  }

  async function handleUpdateSubmit(payload) {
    if (!editingPackage) return;
    setSubmitting(true);
    updateMutation.mutate({ id: editingPackage.id, payload });
  }

  // Table columns definition
  const columns = [
    {
      key: 'code',
      header: 'WP Code',
      render: (row) => (
        <span className="font-mono text-xs font-bold bg-brand-50 text-brand-700 px-2 py-1 rounded">
          {row.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Scope / Work Package Name',
      render: (row) => (
        <div>
          <p className="font-semibold text-ink-900">{row.name}</p>
          {row.siteName && (
            <p className="text-xs text-ink-500 font-medium">{row.siteName}</p>
          )}
          {row.description && (
            <p className="text-xs text-ink-400 truncate max-w-[280px]">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'discipline',
      header: 'Discipline',
      render: (row) => {
        const badgeClass = DISCIPLINE_BADGES[row.discipline] || 'bg-gray-100 text-gray-700';
        return (
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${badgeClass}`}>
            {DISCIPLINE_LABELS[row.discipline] || row.discipline}
          </span>
        );
      },
    },
    {
      key: 'assignedContractor',
      header: 'Contractor',
      render: (row) => (
        <div>
          <p className="text-xs font-medium text-ink-800">{row.assignedContractor || 'Unassigned'}</p>
          {row.inchargeUserName && (
            <p className="text-[11px] text-ink-400">Lead: {row.inchargeUserName}</p>
          )}
        </div>
      ),
    },
    {
      key: 'budgetAmount',
      header: 'Budget',
      render: (row) =>
        row.budgetAmount ? (
          <span className="text-sm font-semibold text-emerald-700">
            {formatCurrency(row.budgetAmount)}
          </span>
        ) : (
          <span className="text-xs text-ink-400">-</span>
        ),
    },
    {
      key: 'dates',
      header: 'Timeline',
      render: (row) => {
        const start = row.plannedStartDate || row.startDate;
        const end = row.plannedEndDate || row.endDate;
        return start ? (
          <div className="text-xs text-ink-600">
            <p className="font-medium">{start}</p>
            {end && <p className="text-ink-400">→ {end}</p>}
          </div>
        ) : (
          <span className="text-xs text-ink-400">TBD</span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <StatusPill status={row.status} />
          {canUpdateStatus && (
            <button
              type="button"
              title="Change Status"
              onClick={() => setStatusPackage(row)}
              className="rounded p-1 text-ink-400 hover:bg-brand-50 hover:text-brand-700 transition-colors"
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
        <div className="flex items-center justify-end gap-1">
          {canManage && (
            <button
              type="button"
              title="Edit Work Package"
              onClick={() => setEditingPackage(row)}
              className="rounded p-1.5 text-ink-500 hover:bg-black/5 transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          )}
          {canManage && (
            <button
              type="button"
              title="Delete Work Package"
              onClick={() => setPackageToDelete(row)}
              className="rounded p-1.5 text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-heading">WBS &amp; Work Packages</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-surface-border bg-white/60 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Timeline
            </button>
          </div>

          {canManage && (
            <Button
              size="sm"
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New Work Package
            </Button>
          )}
        </div>
      </div>

      {/* KPI Metrics Bar */}
      <WbsMetricsBar workPackages={rawPackages} />

      {/* Project Selector & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Project Selector */}
        <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-1.5">
          <span className="text-xs font-bold text-brand-900 uppercase tracking-wider">Project:</span>
          <select
            value={effectiveProjectId}
            onChange={(e) => {
              setSelectedProjectId(Number(e.target.value));
              setSiteFilter('ALL');
            }}
            className="bg-transparent text-sm font-semibold text-brand-900 outline-none cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-surface-border bg-white/60 px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            type="text"
            placeholder="Search by code, scope, or contractor…"
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

        {/* Site Filter (if project has sites) */}
        {sites.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="rounded-lg border border-surface-border bg-white/60 px-3 py-2 text-sm text-ink-900 outline-none"
            >
              <option value="ALL">All Sites / Towers</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Discipline Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-ink-400" />
          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="rounded-lg border border-surface-border bg-white/60 px-3 py-2 text-sm text-ink-900 outline-none"
          >
            <option value="ALL">All Disciplines</option>
            {WBS_DISCIPLINES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-surface-border bg-white/60 px-3 py-2 text-sm text-ink-900 outline-none"
        >
          <option value="ALL">All Statuses</option>
          {WBS_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Refresh */}
        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-700 font-medium rounded-lg border border-surface-border bg-white/60 px-3 py-2 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Main Content: Table or Timeline */}
      {viewMode === 'table' ? (
        <Table
          columns={columns}
          data={filteredPackages}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="No work packages configured for this project."
        />
      ) : (
        <WbsTimelineView
          workPackages={filteredPackages}
          onEdit={(wp) => setEditingPackage(wp)}
          onUpdateStatus={(wp) => setStatusPackage(wp)}
        />
      )}

      {/* Create Modal */}
      <Modal
        open={isAddModalOpen}
        onClose={() => !isSubmitting && setAddModalOpen(false)}
        title="Create Construction Work Package"
        size="lg"
        footer={null}
      >
        <WbsScheduleForm
          mode="add"
          sites={sites}
          onSubmit={handleCreateSubmit}
          onCancel={() => setAddModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editingPackage}
        onClose={() => !isSubmitting && setEditingPackage(null)}
        title="Edit Construction Work Package"
        size="lg"
        footer={null}
      >
        {editingPackage && (
          <WbsScheduleForm
            mode="edit"
            sites={sites}
            initialData={editingPackage}
            onSubmit={handleUpdateSubmit}
            onCancel={() => setEditingPackage(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* Quick Status Modal */}
      <WbsStatusModal
        workPackage={statusPackage}
        onClose={() => setStatusPackage(null)}
        onUpdate={(id, status) => statusMutation.mutate({ id, status })}
        isUpdating={statusMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!packageToDelete}
        onClose={() => !deleteMutation.isPending && setPackageToDelete(null)}
        title="Delete Work Package"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setPackageToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => packageToDelete && deleteMutation.mutate(packageToDelete.id)}
              isLoading={deleteMutation.isPending}
            >
              Delete Package
            </Button>
          </div>
        }
      >
        <div className="py-2 text-sm text-ink-700">
          Permanently delete work package{' '}
          <strong>{packageToDelete?.code}</strong> ({packageToDelete?.name})?
          <p className="mt-2 text-xs text-status-danger font-medium">
            Warning: Associated activity allocations and tracking logs will be affected.
          </p>
        </div>
      </Modal>
    </div>
  );
}
