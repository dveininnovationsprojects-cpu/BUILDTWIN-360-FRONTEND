import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Layers,
  TrendingUp,
  GitBranch,
  RefreshCw,
  HardHat,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Table, Button, Modal, Spinner } from '@/design-system';
import {
  WBS_DISCIPLINES,
  WBS_STATUSES,
  DISCIPLINE_LABELS,
  DISCIPLINE_BADGES,
} from '../constants/wbsConstants';
import { WbsActivityFormModal } from './WbsActivityFormModal';
import { WbsActivityProgressModal } from './WbsActivityProgressModal';
import { WbsActivityStatusModal } from './WbsActivityStatusModal';
import { WbsActivityReadinessModal } from './WbsActivityReadinessModal';

export function WbsActivitiesTab({
  projectId,
  workPackages = [],
  activities = [],
  isLoading,
  onRefresh,
  onCreateActivity,
  onUpdateActivity,
  onUpdateProgress,
  onUpdateStatus,
  onDeleteActivity,
  onOpenCreateDependency,
  canManage = true,
  canUpdateStatus = true,
}) {
  // Filters
  const [selectedWpId, setSelectedWpId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [progressActivity, setProgressActivity] = useState(null);
  const [statusActivity, setStatusActivity] = useState(null);
  const [readinessActivity, setReadinessActivity] = useState(null);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    let list = Array.isArray(activities) ? activities : [];

    if (selectedWpId !== 'ALL') {
      list = list.filter((a) => String(a.workPackageId) === String(selectedWpId));
    }

    if (disciplineFilter !== 'ALL') {
      list = list.filter((a) => a.discipline === disciplineFilter);
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          (a.code && a.code.toLowerCase().includes(q)) ||
          (a.name && a.name.toLowerCase().includes(q)) ||
          (a.assignedContractor && a.assignedContractor.toLowerCase().includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activities, selectedWpId, disciplineFilter, statusFilter, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = activities.length;
    const completed = activities.filter((a) => a.status === 'COMPLETED').length;
    const inProgress = activities.filter((a) => a.status === 'IN_PROGRESS').length;
    const delayed = activities.filter((a) => a.status === 'DELAYED').length;
    const totalProgress =
      total > 0
        ? activities.reduce((sum, a) => sum + (Number(a.progressPercentage) || 0), 0) / total
        : 0;

    return { total, completed, inProgress, delayed, totalProgress: Math.round(totalProgress) };
  }, [activities]);

  const handleCreateSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      await onCreateActivity(payload.workPackageId, payload);
      setIsAddModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (payload) => {
    if (!editingActivity) return;
    setIsSubmitting(true);
    try {
      await onUpdateActivity(editingActivity.id, payload);
      setEditingActivity(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProgressSubmit = async (payload) => {
    if (!progressActivity) return;
    setIsSubmitting(true);
    try {
      await onUpdateProgress(progressActivity.id, payload);
      setProgressActivity(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusSubmit = async (payload) => {
    if (!statusActivity) return;
    setIsSubmitting(true);
    try {
      await onUpdateStatus(statusActivity.id, payload);
      setStatusActivity(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activityToDelete) return;
    setIsSubmitting(true);
    try {
      await onDeleteActivity(activityToDelete.id);
      setActivityToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table Columns
  const columns = [
    {
      key: 'code',
      header: 'Task Code',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.parentId && (
            <span className="text-ink-400 font-mono text-[10px] pl-1">&lfloor;</span>
          )}
          <span className="font-mono text-xs font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200/50">
            {row.code}
          </span>
          {row.level > 1 && (
            <span className="text-[10px] font-medium bg-surface-subtle text-ink-500 px-1 rounded">
              L{row.level}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Activity Name & Scope',
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-semibold text-ink-900 leading-tight">{row.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-medium text-brand-600">
              {row.workPackageName || `WP #${row.workPackageId}`}
            </span>
            {row.parentName && (
              <span className="text-[10px] text-ink-400 truncate">
                under: {row.parentName}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'discipline',
      header: 'Discipline',
      render: (row) => {
        const badgeClass = DISCIPLINE_BADGES[row.discipline] || 'bg-gray-100 text-gray-700';
        return (
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border shadow-2xs ${badgeClass}`}>
            {DISCIPLINE_LABELS[row.discipline] || row.discipline}
          </span>
        );
      },
    },
    {
      key: 'quantity',
      header: 'BOQ & Logged Qty',
      render: (row) => (
        <div className="text-xs">
          <span className="font-bold text-ink-800">
            {Number(row.completedQuantity || 0).toLocaleString()} /{' '}
            {Number(row.plannedQuantity || 0).toLocaleString()}
          </span>
          <span className="text-ink-500 ml-1 text-[11px] font-medium">{row.uom}</span>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Progress %',
      render: (row) => {
        const pct = Math.min(100, Math.round(Number(row.progressPercentage) || 0));
        return (
          <div className="w-28">
            <div className="flex items-center justify-between text-[11px] font-semibold text-ink-700 dark:text-ink-300 mb-0.5">
              <span>{pct}%</span>
              {row.status === 'COMPLETED' ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              ) : pct > 0 ? (
                <span className="text-[10px] text-brand-600 font-bold">Active</span>
              ) : null}
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  pct >= 100
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : pct > 50
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                    : 'bg-gradient-to-r from-amber-500 to-orange-400'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'dates',
      header: 'Planned Dates',
      render: (row) => (
        <div className="text-[11px] text-ink-600">
          <p className="font-medium">{row.plannedStartDate || '-'}</p>
          {row.plannedEndDate && <p className="text-ink-400">&rarr; {row.plannedEndDate}</p>}
        </div>
      ),
    },
    {
      key: 'contractor',
      header: 'Contractor',
      render: (row) => (
        <div className="text-xs">
          <p className="font-medium text-ink-800">{row.assignedContractor || 'Unassigned'}</p>
          {row.inchargeUserName && (
            <p className="text-[10px] text-ink-400">Eng: {row.inchargeUserName}</p>
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
          {/* Quick Log Quantity Progress */}
          <button
            type="button"
            title="Log Quantity Progress"
            onClick={() => setProgressActivity(row)}
            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 hover:scale-110 active:scale-95 transition-all shadow-2xs font-semibold text-xs flex items-center gap-0.5"
          >
            <TrendingUp className="h-3.5 w-3.5" />
          </button>

          {/* Diagnostic Precedence & Readiness Chain */}
          <button
            type="button"
            title="Dependency Chain & Execution Readiness"
            onClick={() => setReadinessActivity(row)}
            className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50 hover:scale-110 active:scale-95 transition-all shadow-2xs"
          >
            <GitBranch className="h-3.5 w-3.5" />
          </button>

          {/* Edit */}
          {canManage && (
            <button
              type="button"
              title="Edit Activity"
              onClick={() => setEditingActivity(row)}
              className="rounded-lg p-1.5 text-ink-500 hover:bg-black/5 hover:scale-110 active:scale-95 transition-all"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Delete */}
          {canManage && (
            <button
              type="button"
              title="Delete Activity"
              onClick={() => setActivityToDelete(row)}
              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:scale-110 active:scale-95 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Top Metrics Cards with Glassmorphic Ambient Gradients */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 hover:border-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent opacity-80" />
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wider block">
              Total Activities
            </span>
            <span className="text-2xl font-extrabold text-ink-900 dark:text-white mt-1 block tracking-tight">
              {metrics.total}
            </span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-emerald-200/80 hover:border-emerald-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 shadow-xs hover:shadow-[0_8px_25px_-5px_rgba(16,185,129,0.2)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/12 via-emerald-500/5 to-transparent opacity-80" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                Completed
              </span>
              {metrics.completed > 0 && (
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-400" />
              )}
            </div>
            <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1 block tracking-tight">
              {metrics.completed}
            </span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-blue-200/80 hover:border-blue-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 shadow-xs hover:shadow-[0_8px_25px_-5px_rgba(59,130,246,0.2)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/12 via-blue-500/5 to-transparent opacity-80" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                In Progress
              </span>
              {metrics.inProgress > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
              )}
            </div>
            <span className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mt-1 block tracking-tight">
              {metrics.inProgress}
            </span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-rose-200/80 hover:border-rose-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 shadow-xs hover:shadow-[0_8px_25px_-5px_rgba(244,63,94,0.2)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-500/12 via-rose-500/5 to-transparent opacity-80" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
                Delayed
              </span>
              {metrics.delayed > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
              )}
            </div>
            <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 mt-1 block tracking-tight">
              {metrics.delayed}
            </span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-indigo-200/80 hover:border-indigo-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 shadow-xs hover:shadow-[0_8px_25px_-5px_rgba(99,102,241,0.2)] hover:-translate-y-0.5 transition-all duration-300 col-span-2 sm:col-span-1">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/12 via-indigo-500/5 to-transparent opacity-80" />
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
              Avg Progress
            </span>
            <span className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 mt-1 block tracking-tight">
              {metrics.totalProgress}%
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Work Package Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-white/70 px-3 py-1.5 text-xs">
            <span className="font-semibold text-ink-600">Work Package:</span>
            <select
              value={selectedWpId}
              onChange={(e) => setSelectedWpId(e.target.value)}
              className="bg-transparent font-medium text-ink-900 outline-none cursor-pointer"
            >
              <option value="ALL">All Work Packages ({workPackages.length})</option>
              {workPackages.map((wp) => (
                <option key={wp.id} value={wp.id}>
                  {wp.code} &mdash; {wp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-white/70 px-3 py-1.5 text-xs min-w-[180px]">
            <Search className="h-3.5 w-3.5 text-ink-400 shrink-0" />
            <input
              type="text"
              placeholder="Search code, scope, contractor…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-ink-900 outline-none w-full placeholder:text-ink-300"
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

          {/* Discipline Filter */}
          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="rounded-lg border border-surface-border bg-white/70 px-3 py-1.5 text-xs text-ink-900 outline-none"
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
            className="rounded-lg border border-surface-border bg-white/70 px-3 py-1.5 text-xs text-ink-900 outline-none"
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
            onClick={onRefresh}
            className="flex items-center gap-1 rounded-lg border border-surface-border bg-white/70 px-2.5 py-1.5 text-xs text-ink-600 hover:text-brand-700 transition-colors"
            title="Refresh activities"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Create Activity Button */}
        {canManage && (
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            New WBS Activity
          </Button>
        )}
      </div>

      {/* Main Table */}
      <Table
        columns={columns}
        data={filteredActivities}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No WBS activities found. Create a construction activity under a work package to begin execution tracking."
      />

      {/* Create Activity Modal */}
      <WbsActivityFormModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={isSubmitting}
        workPackages={workPackages}
        activities={activities}
        selectedWorkPackageId={selectedWpId !== 'ALL' ? selectedWpId : null}
      />

      {/* Edit Activity Modal */}
      <WbsActivityFormModal
        open={Boolean(editingActivity)}
        onClose={() => setEditingActivity(null)}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        workPackages={workPackages}
        activities={activities}
        initialData={editingActivity}
      />

      {/* Quantity & Progress Modal */}
      <WbsActivityProgressModal
        open={Boolean(progressActivity)}
        activity={progressActivity}
        onClose={() => setProgressActivity(null)}
        onSubmit={handleProgressSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Status Modal */}
      <WbsActivityStatusModal
        open={Boolean(statusActivity)}
        activity={statusActivity}
        onClose={() => setStatusActivity(null)}
        onSubmit={handleStatusSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Diagnostic Readiness Modal */}
      <WbsActivityReadinessModal
        open={Boolean(readinessActivity)}
        activity={readinessActivity}
        onClose={() => setReadinessActivity(null)}
        onOpenCreateDependency={onOpenCreateDependency}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(activityToDelete)}
        onClose={() => !isSubmitting && setActivityToDelete(null)}
        title="Delete WBS Activity"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivityToDelete(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={isSubmitting}
            >
              Delete Activity
            </Button>
          </div>
        }
      >
        <div className="py-2 text-xs text-ink-700">
          Permanently delete activity <strong>{activityToDelete?.code}</strong> ({activityToDelete?.name})?
          <p className="mt-2 text-[11px] text-rose-600 font-medium">
            Warning: Any associated sub-tasks, dependencies, and daily progress logs will be cleared.
          </p>
        </div>
      </Modal>
    </div>
  );
}
