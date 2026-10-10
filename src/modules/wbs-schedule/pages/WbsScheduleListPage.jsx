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
  Package,
  ListTree,
  GitBranch,
} from 'lucide-react';
import { Table, StatusPill, Button, Modal } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { formatCurrency } from '@/modules/projects/constants';
import { projectsApi, sitesApi } from '@/modules/projects/api/projectsApi';
import {
  wbsScheduleApi,
  wbsActivitiesApi,
  activityDependenciesApi,
} from '../api/wbsScheduleApi';
import { WbsScheduleForm } from '../components/WbsScheduleForm';
import { WbsMetricsBar } from '../components/WbsMetricsBar';
import { WbsStatusModal } from '../components/WbsStatusModal';
import { WbsTimelineView } from '../components/WbsTimelineView';
import { WbsActivitiesTab } from '../components/WbsActivitiesTab';
import { WbsDependenciesTab } from '../components/WbsDependenciesTab';
import { ActivityDependencyModal } from '../components/ActivityDependencyModal';
import {
  WBS_DISCIPLINES,
  WBS_STATUSES,
  DISCIPLINE_LABELS,
  DISCIPLINE_BADGES,
} from '../constants/wbsConstants';

// Work Breakdown Structure (WBS), Activity Execution & Precedence CPM Network
export function WbsScheduleListPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  // Top Module Tabs: 'work-packages' | 'activities' | 'dependencies'
  const [activeTab, setActiveTab] = useState('work-packages');

  // Work Packages View Mode: 'table' | 'timeline'
  const [viewMode, setViewMode] = useState('table');

  // Selected Project (Defaults to 1 or first available project)
  const [selectedProjectId, setSelectedProjectId] = useState(1);

  // Work Package Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [siteFilter, setSiteFilter] = useState('ALL');

  // Modals for Work Packages
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [statusPackage, setStatusPackage] = useState(null);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);

  // Modal for Direct Dependency Link from Activities tab
  const [isDirectDepModalOpen, setIsDirectDepModalOpen] = useState(false);
  const [directDepPredecessor, setDirectDepPredecessor] = useState(null);

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
    isLoading: isPackagesLoading,
    refetch: refetchPackages,
  } = useQuery({
    queryKey: ['work-packages', effectiveProjectId, statusFilter, disciplineFilter],
    queryFn: () =>
      wbsScheduleApi.list(effectiveProjectId, {
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        discipline: disciplineFilter !== 'ALL' ? disciplineFilter : undefined,
      }),
    enabled: !!effectiveProjectId,
  });

  // 4. Fetch WBS Activities for selected project (WbsActivityController)
  const {
    data: activities = [],
    isLoading: isActivitiesLoading,
    refetch: refetchActivities,
  } = useQuery({
    queryKey: ['wbs-activities', effectiveProjectId],
    queryFn: () => wbsActivitiesApi.listByProject(effectiveProjectId),
    enabled: !!effectiveProjectId,
  });

  // 5. Fetch Activity Dependencies for selected project (ActivityDependencyController)
  const {
    data: dependencies = [],
    isLoading: isDependenciesLoading,
    refetch: refetchDependencies,
  } = useQuery({
    queryKey: ['activity-dependencies', effectiveProjectId],
    queryFn: () => activityDependenciesApi.listByProject(effectiveProjectId),
    enabled: !!effectiveProjectId,
  });

  // --- Work Package Mutations ---
  const createPackageMutation = useMutation({
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

  const updatePackageMutation = useMutation({
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

  const statusPackageMutation = useMutation({
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

  const deletePackageMutation = useMutation({
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

  // --- Activity Mutations (WbsActivityController) ---
  const createActivityMutation = useMutation({
    mutationFn: ({ workPackageId, payload }) =>
      wbsActivitiesApi.create(workPackageId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wbs-activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity-dependencies'] });
      pushToast('WBS Activity created successfully.', 'success');
    },
    onError: (err) => {
      pushToast(err.message || 'Failed to create activity.', 'error');
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: ({ id, payload }) => wbsActivitiesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wbs-activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity-dependencies'] });
      pushToast('WBS Activity updated successfully.', 'success');
    },
    onError: (err) => {
      pushToast(err.message || 'Failed to update activity.', 'error');
    },
  });

  const progressActivityMutation = useMutation({
    mutationFn: ({ id, payload }) => wbsActivitiesApi.updateProgress(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wbs-activities'] });
      pushToast('Activity progress logged and rolled up.', 'success');
    },
    onError: (err) => {
      pushToast(err.message || 'Failed to update activity progress.', 'error');
    },
  });

  const statusActivityMutation = useMutation({
    mutationFn: ({ id, payload }) => wbsActivitiesApi.updateStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wbs-activities'] });
      pushToast('Activity status updated.', 'success');
    },
    onError: (err) => {
      pushToast(err.message || 'Failed to update activity status.', 'error');
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (id) => wbsActivitiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wbs-activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity-dependencies'] });
      pushToast('WBS Activity removed successfully.', 'success');
    },
    onError: (err) => {
      pushToast(err.message || 'Failed to delete activity.', 'error');
    },
  });

  // --- Dependency Mutations (ActivityDependencyController) ---
  const createDependencyMutation = useMutation({
    mutationFn: (payload) => activityDependenciesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-dependencies'] });
      queryClient.invalidateQueries({ queryKey: ['wbs-activities'] });
      pushToast('Precedence dependency established successfully.', 'success');
      setIsDirectDepModalOpen(false);
    },
    onError: (err) => {
      pushToast(err.message || 'Failed to establish precedence dependency.', 'error');
    },
  });

  const deleteDependencyMutation = useMutation({
    mutationFn: (id) => activityDependenciesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-dependencies'] });
      queryClient.invalidateQueries({ queryKey: ['wbs-activities'] });
      pushToast('Precedence dependency removed.', 'success');
    },
    onError: (err) => {
      pushToast(err.message || 'Failed to remove dependency.', 'error');
    },
  });

  // Client-side filtering for search query & site in work packages tab
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

  // Work Package Table Columns
  const packageColumns = [
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
            <p className="text-xs text-ink-400 leading-normal max-w-sm">{row.description}</p>
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
            {end && <p className="text-ink-400">&rarr; {end}</p>}
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-heading">WBS &amp; Construction Scheduling</h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Work Breakdown Structure, Field Activities, Quantity Progress &amp; CPM Precedence Logic
          </p>
        </div>

        {/* Global Project Selector */}
        <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50/70 px-3.5 py-1.5 shadow-xs">
          <span className="text-xs font-bold text-brand-950 uppercase tracking-wider">Project:</span>
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
                {p.code} &mdash; {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Level Module Navigation Tabs */}
      <div className="flex items-center border-b border-surface-border">
        <button
          type="button"
          onClick={() => setActiveTab('work-packages')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 rounded-t-lg transition-all duration-200 ${
            activeTab === 'work-packages'
              ? 'border-brand-600 text-brand-700 bg-brand-50/60 shadow-2xs'
              : 'border-transparent text-ink-500 hover:text-ink-800 hover:bg-slate-50/60'
          }`}
        >
          <Package className={`h-4 w-4 transition-transform duration-200 ${activeTab === 'work-packages' ? 'scale-110 text-brand-600' : ''}`} />
          Work Packages &amp; Timeline
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold transition-colors ${
              activeTab === 'work-packages'
                ? 'bg-brand-100 text-brand-700'
                : 'bg-surface-subtle text-ink-600'
            }`}
          >
            {rawPackages.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activities')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 rounded-t-lg transition-all duration-200 ${
            activeTab === 'activities'
              ? 'border-brand-600 text-brand-700 bg-brand-50/60 shadow-2xs'
              : 'border-transparent text-ink-500 hover:text-ink-800 hover:bg-slate-50/60'
          }`}
        >
          <ListTree className={`h-4 w-4 transition-transform duration-200 ${activeTab === 'activities' ? 'scale-110 text-brand-600' : ''}`} />
          WBS Activities &amp; Quantities
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold transition-colors ${
              activeTab === 'activities'
                ? 'bg-brand-100 text-brand-700'
                : 'bg-surface-subtle text-ink-600'
            }`}
          >
            {activities.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dependencies')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 rounded-t-lg transition-all duration-200 ${
            activeTab === 'dependencies'
              ? 'border-brand-600 text-brand-700 bg-brand-50/60 shadow-2xs'
              : 'border-transparent text-ink-500 hover:text-ink-800 hover:bg-slate-50/60'
          }`}
        >
          <GitBranch className={`h-4 w-4 transition-transform duration-200 ${activeTab === 'dependencies' ? 'scale-110 text-brand-600' : ''}`} />
          CPM Network &amp; Precedence
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold transition-colors ${
              activeTab === 'dependencies'
                ? 'bg-brand-100 text-brand-700'
                : 'bg-surface-subtle text-ink-600'
            }`}
          >
            {dependencies.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: WORK PACKAGES & TIMELINE                          */}
      {/* ======================================================== */}
      {activeTab === 'work-packages' && (
        <div className="flex flex-col gap-4">
          <WbsMetricsBar workPackages={rawPackages} onSelectStatus={setStatusFilter} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search */}
              <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-surface-border bg-white/60 px-3 py-2 text-sm">
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
                    &times;
                  </button>
                )}
              </div>

              {/* Site Filter */}
              {sites.length > 0 && (
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
              )}

              {/* Discipline Filter */}
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
                onClick={() => refetchPackages()}
                className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-700 font-medium rounded-lg border border-surface-border bg-white/60 px-3 py-2 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
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

          {viewMode === 'table' ? (
            <Table
              columns={packageColumns}
              data={filteredPackages}
              rowKey={(row) => row.id}
              isLoading={isPackagesLoading}
              emptyMessage="No work packages configured for this project."
            />
          ) : (
            <WbsTimelineView
              workPackages={filteredPackages}
              onEdit={(wp) => setEditingPackage(wp)}
              onUpdateStatus={(wp) => setStatusPackage(wp)}
            />
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: WBS ACTIVITIES & QUANTITIES (WbsActivityController) */}
      {/* ======================================================== */}
      {activeTab === 'activities' && (
        <WbsActivitiesTab
          projectId={effectiveProjectId}
          workPackages={rawPackages}
          activities={activities}
          isLoading={isActivitiesLoading}
          onRefresh={refetchActivities}
          onCreateActivity={(workPackageId, payload) =>
            createActivityMutation.mutateAsync({ workPackageId, payload })
          }
          onUpdateActivity={(id, payload) =>
            updateActivityMutation.mutateAsync({ id, payload })
          }
          onUpdateProgress={(id, payload) =>
            progressActivityMutation.mutateAsync({ id, payload })
          }
          onUpdateStatus={(id, payload) =>
            statusActivityMutation.mutateAsync({ id, payload })
          }
          onDeleteActivity={(id) => deleteActivityMutation.mutateAsync(id)}
          onOpenCreateDependency={(act) => {
            setDirectDepPredecessor(act);
            setIsDirectDepModalOpen(true);
          }}
          canManage={canManage}
          canUpdateStatus={canUpdateStatus}
        />
      )}

      {/* ======================================================== */}
      {/* TAB 3: CPM NETWORK & PRECEDENCE (ActivityDependencyController) */}
      {/* ======================================================== */}
      {activeTab === 'dependencies' && (
        <WbsDependenciesTab
          projectId={effectiveProjectId}
          dependencies={dependencies}
          activities={activities}
          isLoading={isDependenciesLoading}
          onRefresh={refetchDependencies}
          onCreateDependency={(payload) =>
            createDependencyMutation.mutateAsync(payload)
          }
          onDeleteDependency={(id) =>
            deleteDependencyMutation.mutateAsync(id)
          }
          canManage={canManage}
        />
      )}

      {/* --- Work Package Modals --- */}
      <Modal
        open={isAddModalOpen}
        onClose={() => !isSubmitting && setAddModalOpen(false)}
        title="Create Construction Work Package"
        size="xl"
        footer={null}
      >
        <WbsScheduleForm
          mode="add"
          sites={sites}
          onSubmit={async (payload) => {
            setSubmitting(true);
            createPackageMutation.mutate(payload);
          }}
          onCancel={() => setAddModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        open={Boolean(editingPackage)}
        onClose={() => !isSubmitting && setEditingPackage(null)}
        title="Edit Construction Work Package"
        size="xl"
        footer={null}
      >
        {editingPackage && (
          <WbsScheduleForm
            mode="edit"
            sites={sites}
            initialData={editingPackage}
            onSubmit={async (payload) => {
              setSubmitting(true);
              updatePackageMutation.mutate({ id: editingPackage.id, payload });
            }}
            onCancel={() => setEditingPackage(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      <WbsStatusModal
        workPackage={statusPackage}
        onClose={() => setStatusPackage(null)}
        onUpdate={(id, status) => statusPackageMutation.mutate({ id, status })}
        isUpdating={statusPackageMutation.isPending}
      />

      <Modal
        open={Boolean(packageToDelete)}
        onClose={() => !deletePackageMutation.isPending && setPackageToDelete(null)}
        title="Delete Work Package"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPackageToDelete(null)}
              disabled={deletePackageMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => packageToDelete && deletePackageMutation.mutate(packageToDelete.id)}
              isLoading={deletePackageMutation.isPending}
            >
              Delete Package
            </Button>
          </div>
        }
      >
        <div className="py-2 text-sm text-ink-700">
          Permanently delete work package <strong>{packageToDelete?.code}</strong> ({packageToDelete?.name})?
          <p className="mt-2 text-xs text-rose-600 font-medium">
            Warning: All nested activities and schedule allocations under this work package will be affected.
          </p>
        </div>
      </Modal>

      {/* Direct Dependency Modal from Activities tab */}
      <ActivityDependencyModal
        open={isDirectDepModalOpen}
        onClose={() => setIsDirectDepModalOpen(false)}
        onSubmit={(payload) => createDependencyMutation.mutateAsync(payload)}
        isSubmitting={createDependencyMutation.isPending}
        activities={activities}
        initialPredecessorId={directDepPredecessor?.id}
      />
    </div>
  );
}
