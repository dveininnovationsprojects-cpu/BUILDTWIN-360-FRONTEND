import React, { useState, useMemo } from 'react';
import {
  GitBranch,
  ArrowRight,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Network,
  List,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { Table, StatusPill, Button, Modal, Spinner } from '@/design-system';
import {
  DEPENDENCY_TYPES,
  DEPENDENCY_TYPE_BADGES,
  DISCIPLINE_BADGES,
} from '../constants/wbsConstants';
import { ActivityDependencyModal } from './ActivityDependencyModal';
import { WbsActivityReadinessModal } from './WbsActivityReadinessModal';
import { StatusGlowDot } from './WbsMicroVisuals';

export function WbsDependenciesTab({
  projectId,
  dependencies = [],
  activities = [],
  networkData = null,
  isLoading,
  onRefresh,
  onCreateDependency,
  onDeleteDependency,
  canManage = true,
}) {
  const [activeSubView, setActiveSubView] = useState('table'); // 'table' | 'visual' | 'readiness'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dependencyToDelete, setDependencyToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Readiness Inspector State
  const [inspectActivityId, setInspectActivityId] = useState(activities[0]?.id || '');
  const [inspectModalActivity, setInspectModalActivity] = useState(null);

  // Filtered Dependencies
  const filteredDependencies = useMemo(() => {
    let list = Array.isArray(dependencies) ? dependencies : [];

    if (selectedTypeFilter !== 'ALL') {
      list = list.filter((d) => d.dependencyType === selectedTypeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          (d.predecessorCode && d.predecessorCode.toLowerCase().includes(q)) ||
          (d.predecessorName && d.predecessorName.toLowerCase().includes(q)) ||
          (d.successorCode && d.successorCode.toLowerCase().includes(q)) ||
          (d.successorName && d.successorName.toLowerCase().includes(q)) ||
          (d.remarks && d.remarks.toLowerCase().includes(q))
      );
    }

    return list;
  }, [dependencies, selectedTypeFilter, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = dependencies.length;
    const fsCount = dependencies.filter((d) => (d.dependencyType || 'FS') === 'FS').length;
    const conflicts = dependencies.filter((d) => d.hasScheduleConflict).length;
    const activitiesWithPredecessors = new Set(dependencies.map((d) => d.successorId)).size;

    return {
      total,
      fsCount,
      conflicts,
      constrainedActivities: activitiesWithPredecessors,
    };
  }, [dependencies]);

  const handleCreateSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      await onCreateDependency(payload);
      setIsAddModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!dependencyToDelete) return;
    setIsSubmitting(true);
    try {
      await onDeleteDependency(dependencyToDelete.id);
      setDependencyToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedInspectActivity = activities.find((a) => String(a.id) === String(inspectActivityId));

  const columns = [
    {
      key: 'predecessor',
      header: '1. Predecessor Activity (Prerequisite)',
      render: (row) => (
        <div className="max-w-xs">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-mono text-xs font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200/60">
              {row.predecessorCode}
            </span>
            <span className="text-[10px] text-ink-500 uppercase">{row.predecessorDiscipline}</span>
          </div>
          <p className="font-semibold text-ink-900 leading-tight">{row.predecessorName}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <StatusGlowDot status={row.predecessorStatus} />
            <StatusPill status={row.predecessorStatus || 'PLANNED'} />
            <span className="text-[10px] text-ink-500 font-medium">
              {Number(row.predecessorProgressPercentage || 0).toFixed(0)}%
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'relationship',
      header: '2. Precedence Constraint',
      render: (row) => (
        <div className="flex flex-col items-center justify-center gap-1 text-center py-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                DEPENDENCY_TYPE_BADGES[row.dependencyType] || 'bg-blue-50 text-blue-700'
              }`}
            >
              {row.dependencyType || 'FS'}
            </span>
            <ArrowRight className="h-4 w-4 text-ink-400" />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-ink-600">
            <Clock className="h-3 w-3 text-ink-400" />
            {row.lagDays > 0 ? (
              <span className="text-amber-700 font-semibold">+{row.lagDays} Lag Days</span>
            ) : row.lagDays < 0 ? (
              <span className="text-indigo-700 font-semibold">{row.lagDays} Lead Days</span>
            ) : (
              <span>0 Days Lag</span>
            )}
          </div>
          {row.remarks && (
            <p className="text-[10px] text-ink-400 italic max-w-[150px] truncate" title={row.remarks}>
              &ldquo;{row.remarks}&rdquo;
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'successor',
      header: '3. Successor Activity (Dependent)',
      render: (row) => (
        <div className="max-w-xs">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-mono text-xs font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200/60">
              {row.successorCode}
            </span>
            <span className="text-[10px] text-ink-500 uppercase">{row.successorDiscipline}</span>
          </div>
          <p className="font-semibold text-ink-900 leading-tight">{row.successorName}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <StatusGlowDot status={row.successorStatus} />
            <StatusPill status={row.successorStatus || 'PLANNED'} />
          </div>
        </div>
      ),
    },
    {
      key: 'diagnostics',
      header: 'CPM Diagnostics',
      render: (row) =>
        row.hasScheduleConflict ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 shadow-2xs animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            Schedule Conflict
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Valid Sequence
          </span>
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
              title="Delete Precedence Link"
              onClick={() => setDependencyToDelete(row)}
              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:scale-110 active:scale-95 transition-all shadow-2xs"
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
      {/* Top Metrics Cards with Glassmorphism & Ambient Gradients */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 hover:border-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent opacity-80" />
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wider block">
              Total Precedence Links
            </span>
            <span className="text-2xl font-extrabold text-ink-900 dark:text-white mt-1 block tracking-tight">
              {metrics.total}
            </span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-blue-200/80 hover:border-blue-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 shadow-xs hover:shadow-[0_8px_25px_-5px_rgba(59,130,246,0.2)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/12 via-blue-500/5 to-transparent opacity-80" />
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              Standard (Finish-to-Start)
            </span>
            <span className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mt-1 block tracking-tight">
              {metrics.fsCount}
            </span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-purple-200/80 hover:border-purple-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 shadow-xs hover:shadow-[0_8px_25px_-5px_rgba(168,85,247,0.2)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/12 via-purple-500/5 to-transparent opacity-80" />
          <div className="relative z-10">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
              Constrained Activities
            </span>
            <span className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 mt-1 block tracking-tight">
              {metrics.constrainedActivities}
            </span>
          </div>
        </div>

        <div
          className={`group relative overflow-hidden rounded-2xl border bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 shadow-xs hover:-translate-y-0.5 transition-all duration-300 ${
            metrics.conflicts > 0
              ? 'border-rose-300 hover:border-rose-400 hover:shadow-[0_8px_25px_-5px_rgba(244,63,94,0.25)]'
              : 'border-emerald-200 hover:border-emerald-400 hover:shadow-[0_8px_25px_-5px_rgba(16,185,129,0.2)]'
          }`}
        >
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80 ${
              metrics.conflicts > 0
                ? 'from-rose-500/12 via-rose-500/5 to-transparent'
                : 'from-emerald-500/12 via-emerald-500/5 to-transparent'
            }`}
          />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider block ${
                  metrics.conflicts > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                Schedule Conflicts
              </span>
              {metrics.conflicts > 0 ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
              ) : (
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-400" />
              )}
            </div>
            <span
              className={`text-2xl font-extrabold mt-1 block tracking-tight ${
                metrics.conflicts > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {metrics.conflicts}
            </span>
          </div>
        </div>
      </div>

      {/* View Switcher & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-surface-border bg-white/60 p-0.5">
            <button
              type="button"
              onClick={() => setActiveSubView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeSubView === 'table'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Precedence Table
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeSubView === 'visual'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <Network className="h-3.5 w-3.5" />
              CPM Network Flow
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView('readiness')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeSubView === 'readiness'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Readiness Inspector
            </button>
          </div>

          {activeSubView === 'table' && (
            <>
              {/* Search */}
              <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-white/70 px-3 py-1.5 text-xs min-w-[160px]">
                <Search className="h-3.5 w-3.5 text-ink-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Filter tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-ink-900 outline-none w-full"
                />
              </div>

              {/* Type Filter */}
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="rounded-lg border border-surface-border bg-white/70 px-3 py-1.5 text-xs text-ink-900 outline-none"
              >
                <option value="ALL">All Types (FS, SS, FF, SF)</option>
                {DEPENDENCY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </>
          )}

          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-1 rounded-lg border border-surface-border bg-white/70 px-2.5 py-1.5 text-xs text-ink-600 hover:text-brand-700 transition-colors"
            title="Refresh dependencies"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {canManage && (
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Link Precedence Dependency
          </Button>
        )}
      </div>

      {/* Sub-view: Precedence Table */}
      {activeSubView === 'table' && (
        <Table
          columns={columns}
          data={filteredDependencies}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="No activity precedence dependencies configured yet. Link activities to establish CPM scheduling constraints and circular-loop validation."
        />
      )}

      {/* Sub-view: CPM Visual Network Diagram */}
      {activeSubView === 'visual' && (
        <div className="rounded-xl border border-surface-border bg-surface-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div>
              <h3 className="font-bold text-ink-900 text-sm flex items-center gap-2">
                <Network className="h-4 w-4 text-brand-600" />
                Critical Path &amp; Precedence Flow Network
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                Visual relationship graph of activities and directed precedence flow.
              </p>
            </div>
            <span className="text-xs font-mono text-ink-500 bg-surface-subtle px-2.5 py-1 rounded border border-surface-border">
              {activities.length} Nodes &bull; {dependencies.length} Directed Links
            </span>
          </div>

          {dependencies.length === 0 ? (
            <div className="py-12 text-center text-ink-500 text-xs">
              <GitBranch className="h-8 w-8 text-ink-300 mx-auto mb-2" />
              No precedence dependencies established. Add dependencies between activities to visualize the CPM schedule network.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {dependencies.map((dep) => (
                <div
                  key={dep.id}
                  className={`group flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border p-4 transition-all duration-300 ${
                    dep.hasScheduleConflict
                      ? 'border-rose-300 bg-rose-50/40 shadow-xs hover:shadow-md'
                      : 'border-surface-border bg-surface-subtle/80 hover:bg-white hover:border-brand-300 hover:shadow-md'
                  }`}
                >
                  {/* Predecessor Node */}
                  <div className="flex-1 w-full rounded-xl border border-brand-200/80 bg-white dark:bg-slate-900 p-3.5 shadow-2xs group-hover:border-brand-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200/60 shadow-2xs">
                        {dep.predecessorCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <StatusGlowDot status={dep.predecessorStatus} />
                        <StatusPill status={dep.predecessorStatus || 'PLANNED'} />
                      </div>
                    </div>
                    <p className="font-bold text-xs text-ink-900 dark:text-white mt-1.5">{dep.predecessorName}</p>
                    <div className="flex items-center justify-between text-[11px] text-ink-500 mt-2">
                      <span className="uppercase font-semibold text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {dep.predecessorDiscipline}
                      </span>
                      <span className="font-semibold text-brand-600">
                        {Number(dep.predecessorProgressPercentage || 0).toFixed(0)}% Done
                      </span>
                    </div>
                  </div>

                  {/* Directed Link Connector with Micro-interactions */}
                  <div className="flex flex-col items-center justify-center px-3 py-1 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs transition-transform duration-200 group-hover:scale-105 ${
                        DEPENDENCY_TYPE_BADGES[dep.dependencyType] || 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {dep.dependencyType || 'FS'}
                    </span>
                    <div className="flex items-center gap-1 my-1.5">
                      <div className="h-0.5 w-6 bg-brand-300 transition-colors group-hover:bg-brand-500" />
                      <ArrowRight className="h-4 w-4 text-brand-600 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                    <span className="text-[10px] font-mono text-ink-500 font-medium">
                      {dep.lagDays > 0 ? `+${dep.lagDays}d lag` : '0d lag'}
                    </span>
                  </div>

                  {/* Successor Node */}
                  <div className="flex-1 w-full rounded-xl border border-indigo-200/80 bg-white dark:bg-slate-900 p-3.5 shadow-2xs group-hover:border-indigo-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200/60 shadow-2xs">
                        {dep.successorCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <StatusGlowDot status={dep.successorStatus} />
                        <StatusPill status={dep.successorStatus || 'PLANNED'} />
                      </div>
                    </div>
                    <p className="font-bold text-xs text-ink-900 dark:text-white mt-1.5">{dep.successorName}</p>
                    <div className="flex items-center justify-between text-[11px] text-ink-500 mt-2">
                      <span className="uppercase font-semibold text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {dep.successorDiscipline}
                      </span>
                      <span className="text-ink-400 font-medium">Depends on predecessor</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-view: Activity Readiness Inspector */}
      {activeSubView === 'readiness' && (
        <div className="rounded-xl border border-surface-border bg-surface-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div>
              <h3 className="font-bold text-ink-900 text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Execution Readiness Inspector
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                Diagnose whether an activity is clear to execute on site or held up by unfinished predecessors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-ink-700">Select Activity to Inspect:</label>
            <select
              value={inspectActivityId}
              onChange={(e) => setInspectActivityId(e.target.value)}
              className="flex-1 max-w-md rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-xs text-ink-900 outline-none"
            >
              <option value="">Select Activity</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} &mdash; {a.name} ({a.status})
                </option>
              ))}
            </select>
            {selectedInspectActivity && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setInspectModalActivity(selectedInspectActivity)}
              >
                Inspect Dependency Chain
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Create Precedence Dependency Modal */}
      <ActivityDependencyModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={isSubmitting}
        activities={activities}
      />

      {/* Inspect Chain Modal */}
      <WbsActivityReadinessModal
        open={Boolean(inspectModalActivity)}
        activity={inspectModalActivity}
        onClose={() => setInspectModalActivity(null)}
        onOpenCreateDependency={(act) => {
          setIsAddModalOpen(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(dependencyToDelete)}
        onClose={() => !isSubmitting && setDependencyToDelete(null)}
        title="Remove Activity Precedence Dependency"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDependencyToDelete(null)}
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
              Delete Link
            </Button>
          </div>
        }
      >
        <div className="py-2 text-xs text-ink-700">
          Remove precedence link between <strong>{dependencyToDelete?.predecessorCode}</strong> and{' '}
          <strong>{dependencyToDelete?.successorCode}</strong>?
          <p className="mt-2 text-[11px] text-ink-500">
            Note: This only removes the precedence constraint between the two tasks. Both activities remain intact in the project schedule.
          </p>
        </div>
      </Modal>
    </div>
  );
}
