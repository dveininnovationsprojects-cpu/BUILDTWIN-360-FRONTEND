import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  RefreshCw,
  FileText,
  User,
  ShieldAlert,
} from 'lucide-react';
import { Button, Modal, CardSkeleton } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { progressDprApi } from '../api/progressDprApi';

const SEVERITY_COLORS = {
  CRITICAL: 'bg-rose-100 text-rose-800 border-rose-300',
  HIGH: 'bg-amber-100 text-amber-800 border-amber-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  LOW: 'bg-blue-100 text-blue-800 border-blue-300',
};

const STATUS_COLORS = {
  OPEN: 'bg-rose-50 text-rose-700 border-rose-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  WAIVED: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function DprBlockersTab({ projectId, onOpenDprModal }) {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  const canResolve = useHasRole(
    ROLES.ADMIN,
    ROLES.PROJECT_MANAGER,
    ROLES.SITE_ENGINEER,
    ROLES.DIRECTOR
  );

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [resolvingBlocker, setResolvingBlocker] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Fetch Project Blockers & Summary
  const { data: blockers = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['project-dpr-blockers', projectId, statusFilter],
    queryFn: () => {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      return progressDprApi.getProjectBlockers(projectId, params);
    },
    staleTime: 1000 * 30,
  });

  const { data: blockerSummary } = useQuery({
    queryKey: ['project-blocker-summary', projectId],
    queryFn: () => progressDprApi.getProjectBlockerSummary(projectId),
    staleTime: 1000 * 60,
  });

  // Resolve Blocker Mutation
  const resolveMutation = useMutation({
    mutationFn: ({ dprId, itemId, payload }) =>
      progressDprApi.resolveBlocker(dprId, itemId, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['project-dpr-blockers'] });
      queryClient.invalidateQueries({ queryKey: ['project-blocker-summary'] });
      queryClient.invalidateQueries({ queryKey: ['project-progress-history'] });
      pushToast(`Blocker status updated to ${updated?.blockerStatus || 'RESOLVED'}`, 'success');
      setResolvingBlocker(null);
      setResolutionNotes('');
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to update blocker resolution.', 'error');
    },
  });

  const handleOpenResolve = (blocker) => {
    setResolvingBlocker(blocker);
    setResolutionStatus(blocker.blockerStatus === 'RESOLVED' ? 'RESOLVED' : 'RESOLVED');
    setResolutionNotes(blocker.resolutionNotes || '');
  };

  const handleSaveResolution = async (e) => {
    e.preventDefault();
    if (!resolvingBlocker) return;

    await resolveMutation.mutateAsync({
      dprId: resolvingBlocker.dprId,
      itemId: resolvingBlocker.activityItemId,
      payload: {
        resolutionStatus,
        resolutionNotes: resolutionNotes.trim() || 'Resolved on site.',
      },
    });
  };

  const filteredBlockers = useMemo(() => {
    if (!searchQuery.trim()) return blockers;
    const q = searchQuery.toLowerCase();
    return blockers.filter((b) => {
      return (
        b.activityName?.toLowerCase().includes(q) ||
        b.activityCode?.toLowerCase().includes(q) ||
        b.blockerReason?.toLowerCase().includes(q) ||
        b.blockerCategory?.toLowerCase().includes(q) ||
        b.dprReportCode?.toLowerCase().includes(q)
      );
    });
  }, [blockers, searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Blocker KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-ink-500">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Blockers</span>
          </div>
          <div className="mt-1 text-lg font-bold text-ink-900">
            {blockerSummary?.totalBlockers ?? blockers.length}
          </div>
          <span className="text-[10px] text-ink-400">Total recorded</span>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-ink-500">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Open / Active</span>
          </div>
          <div className="mt-1 text-lg font-bold text-amber-700">
            {blockerSummary?.openBlockersCount ?? blockers.filter((b) => b.blockerStatus === 'OPEN').length}
          </div>
          <span className="text-[10px] text-ink-400">Require resolution</span>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-ink-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Resolved</span>
          </div>
          <div className="mt-1 text-lg font-bold text-emerald-700">
            {blockerSummary?.resolvedBlockersCount ?? blockers.filter((b) => b.blockerStatus === 'RESOLVED').length}
          </div>
          <span className="text-[10px] text-ink-400">Successfully closed</span>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-ink-500">
            <AlertTriangle className="h-4 w-4 text-rose-700" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Critical</span>
          </div>
          <div className="mt-1 text-lg font-bold text-rose-700">
            {blockerSummary?.criticalBlockersCount ?? blockers.filter((b) => b.blockerSeverity === 'CRITICAL').length}
          </div>
          <span className="text-[10px] text-ink-400">High severity halts</span>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-ink-500">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Impact Hours</span>
          </div>
          <div className="mt-1 text-lg font-bold text-ink-900">
            {blockerSummary?.totalDelayImpactHours ?? blockers.reduce((acc, b) => acc + (b.impactHours || 0), 0)} hrs
          </div>
          <span className="text-[10px] text-ink-400">Cumulative delay</span>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-ink-500">
            <FileText className="h-4 w-4 text-brand-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">DPR Shifts</span>
          </div>
          <div className="mt-1 text-lg font-bold text-ink-900">
            {new Set(blockers.map((b) => b.dprId)).size}
          </div>
          <span className="text-[10px] text-ink-400">Shifts affected</span>
        </div>
      </div>

      {/* 2. Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search blockers by activity, category, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-surface-border bg-surface-subtle py-1.5 pl-9 pr-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-surface-base focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs text-ink-800 focus:border-brand-500 focus:outline-none"
          >
            <option value="ALL">All Resolution Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="WAIVED">Waived</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-1 border-surface-border text-ink-600 hover:bg-surface-subtle"
            title="Refresh blockers"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 3. Blockers Table */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filteredBlockers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface-card p-12 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <h4 className="mt-3 text-sm font-semibold text-ink-900">No Active Blockers</h4>
          <p className="mt-1 max-w-sm text-xs text-ink-500">
            No site execution blockers or hindrances currently match the selected criteria. Site activities are executing without reported halts.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-surface-border bg-surface-subtle font-semibold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="py-3 pl-4 pr-3">DPR & Date</th>
                  <th className="py-3 px-3">WBS Activity</th>
                  <th className="py-3 px-3">Category & Severity</th>
                  <th className="py-3 px-3">Delay Impact</th>
                  <th className="py-3 px-3 min-w-[220px]">Root Cause Justification</th>
                  <th className="py-3 px-3">Resolution Status</th>
                  <th className="py-3 pl-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-ink-800">
                {filteredBlockers.map((b) => {
                  const sevClass = SEVERITY_COLORS[b.blockerSeverity] || 'bg-slate-100 text-slate-800 border-slate-200';
                  const statClass = STATUS_COLORS[b.blockerStatus] || 'bg-slate-100 text-slate-700 border-slate-200';

                  return (
                    <tr key={b.id || b.activityItemId} className="hover:bg-surface-subtle/70 transition-colors">
                      <td className="py-3 pl-4 pr-3">
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (b.dprId && onOpenDprModal) {
                                onOpenDprModal(b.dprId, b.dprReportCode);
                              }
                            }}
                            className="font-mono text-[11px] font-semibold text-brand-700 hover:underline text-left"
                            title="Open DPR details"
                          >
                            {b.dprReportCode || `DPR #${b.dprId}`}
                          </button>
                          <span className="text-[11px] text-ink-500">{b.reportDate || '—'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-mono text-[11px] font-bold text-ink-700">{b.activityCode}</span>
                          <span className="font-semibold text-ink-900">{b.activityName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="rounded bg-surface-subtle px-1.5 py-0.5 text-[10px] font-semibold text-ink-700 border border-surface-border">
                            {b.blockerCategory || 'SITE_DELAY'}
                          </span>
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${sevClass}`}>
                            {b.blockerSeverity || 'MEDIUM'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-ink-900">
                          {b.impactHours != null ? `${b.impactHours} hrs` : '—'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <p className="text-xs text-ink-800 leading-relaxed">{b.blockerReason || 'No detailed reason provided'}</p>
                        {b.resolutionNotes && (
                          <p className="mt-1 text-[11px] text-emerald-700 font-medium">
                            Resolution: {b.resolutionNotes}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold border ${statClass}`}>
                          {b.blockerStatus || 'OPEN'}
                        </span>
                      </td>

                      <td className="py-3 pl-3 pr-4 text-right">
                        {canResolve && b.blockerStatus !== 'RESOLVED' && (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleOpenResolve(b)}
                            className="border-brand-500 text-brand-600 hover:bg-brand-50"
                          >
                            Update / Resolve
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resolve Blocker Modal */}
      <Modal
        open={Boolean(resolvingBlocker)}
        onClose={() => setResolvingBlocker(null)}
        title="Update Blocker Resolution"
        size="sm"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResolvingBlocker(null)}
              disabled={resolveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveResolution}
              isLoading={resolveMutation.isPending}
            >
              Save Resolution
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 py-1 text-xs">
          <div>
            <span className="text-ink-500">Activity: </span>
            <strong className="text-ink-900">{resolvingBlocker?.activityName}</strong>
          </div>
          <div>
            <span className="text-ink-500">Root Cause: </span>
            <p className="mt-0.5 text-ink-700">{resolvingBlocker?.blockerReason}</p>
          </div>

          <div>
            <label className="block font-semibold text-ink-700">Resolution Status</label>
            <select
              value={resolutionStatus}
              onChange={(e) => setResolutionStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-surface-border bg-surface-card p-1.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="RESOLVED">RESOLVED (Blocker cleared, activity resumed)</option>
              <option value="IN_PROGRESS">IN_PROGRESS (Mitigation active)</option>
              <option value="WAIVED">WAIVED (Bypassed / scope adjusted)</option>
              <option value="OPEN">OPEN (Still halted)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-ink-700">Resolution Notes & Mitigation Actions</label>
            <textarea
              rows={3}
              placeholder="Detail actions taken, corrective measures, vendor replacement..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-surface-border bg-surface-card p-2 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
