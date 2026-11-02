import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Calendar,
  Layers,
  HardHat,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Eye,
  FileText,
  Clock,
  ArrowUpDown,
  Download,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { Button, Table, StatusPill, CardSkeleton } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { progressDprApi } from '../api/progressDprApi';
import { ProgressHistoryDetailModal } from './ProgressHistoryDetailModal';
import { LogProgressModal } from './LogProgressModal';

const DISCIPLINE_COLORS = {
  CIVIL: 'bg-blue-50 text-blue-700 border-blue-200',
  STRUCTURAL: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  MEP: 'bg-amber-50 text-amber-700 border-amber-200',
  ELECTRICAL: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PLUMBING: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  HVAC: 'bg-teal-50 text-teal-700 border-teal-200',
  FINISHING: 'bg-purple-50 text-purple-700 border-purple-200',
};

export function ProgressHistoryTab({ projectId, onOpenDprModal }) {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  const canLogProgress = useHasRole(
    ROLES.ADMIN,
    ROLES.PROJECT_MANAGER,
    ROLES.SITE_ENGINEER,
    ROLES.DIRECTOR,
    ROLES.SITE_SUPERVISOR
  );

  const canDeleteLog = useHasRole(
    ROLES.ADMIN,
    ROLES.PROJECT_MANAGER,
    ROLES.DIRECTOR
  );

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [disciplineFilter, setDisciplineFilter] = useState('ALL');
  const [blockerFilter, setBlockerFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortDir, setSortDir] = useState('desc');

  // Modals State
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Fetch Project Progress History from Backend
  const queryParams = useMemo(() => {
    const params = {
      page: 0,
      size: 100,
      sortDir,
    };
    if (sourceFilter !== 'ALL') params.source = sourceFilter;
    if (disciplineFilter !== 'ALL') params.discipline = disciplineFilter;
    if (blockerFilter === 'BLOCKERS_ONLY') params.isBlocker = true;
    if (blockerFilter === 'NO_BLOCKERS') params.isBlocker = false;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }, [sourceFilter, disciplineFilter, blockerFilter, startDate, endDate, sortDir]);

  const { data: historyData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['project-progress-history', projectId, queryParams],
    queryFn: () => progressDprApi.getProjectProgressHistory(projectId, queryParams),
    staleTime: 1000 * 30,
  });

  // Fetch WBS Activities for direct logging dropdown
  const { data: wbsActivities = [] } = useQuery({
    queryKey: ['wbs-activities-for-logging', projectId],
    queryFn: () => progressDprApi.getWbsActivities(projectId),
    staleTime: 1000 * 60,
  });

  // Mutations
  const logMutation = useMutation({
    mutationFn: ({ activityId, payload }) => progressDprApi.logProgress(activityId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-progress-history'] });
      queryClient.invalidateQueries({ queryKey: ['progress-dpr'] });
      pushToast('Physical progress logged successfully!', 'success');
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to log progress.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => progressDprApi.deleteProgressLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-progress-history'] });
      pushToast('Progress entry deleted and cumulative metrics recalculated.', 'success');
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to delete progress entry.', 'error');
    },
  });

  const handleSaveProgress = async (activityId, payload) => {
    await logMutation.mutateAsync({ activityId, payload });
  };

  const handleDeleteItem = async (item) => {
    if (window.confirm(`Are you sure you want to delete this progress log for '${item.activityName}' on ${item.logDate}? Activity metrics will automatically be recalculated.`)) {
      await deleteMutation.mutateAsync(item.id);
    }
  };

  // Filter items in memory if client search query is present
  const filteredItems = useMemo(() => {
    const rawItems = historyData?.items?.content || [];
    if (!searchQuery.trim()) return rawItems;
    const q = searchQuery.toLowerCase();
    return rawItems.filter((i) => {
      return (
        i.activityName?.toLowerCase().includes(q) ||
        i.activityCode?.toLowerCase().includes(q) ||
        i.workPackageName?.toLowerCase().includes(q) ||
        i.equipmentUsed?.toLowerCase().includes(q) ||
        i.remarks?.toLowerCase().includes(q) ||
        i.recordedBy?.toLowerCase().includes(q) ||
        i.dprReportCode?.toLowerCase().includes(q)
      );
    });
  }, [historyData?.items?.content, searchQuery]);

  // Export to CSV
  const handleExportCsv = () => {
    if (!filteredItems.length) {
      pushToast('No progress history records to export.', 'warning');
      return;
    }
    const headers = [
      'Log ID',
      'Date',
      'Source',
      'DPR Code',
      'Activity Code',
      'Activity Name',
      'Discipline',
      'Work Package',
      'Quantity Completed Today',
      'UOM',
      'Cumulative Quantity',
      'Progress %',
      'Manpower Count',
      'Equipment Used',
      'Weather',
      'Is Blocker',
      'Blocker Category',
      'Blocker Reason',
      'Recorded By',
      'Remarks',
    ];

    const rows = filteredItems.map((i) => [
      `"${i.id || ''}"`,
      `"${i.logDate || ''}"`,
      `"${i.source || ''}"`,
      `"${i.dprReportCode || ''}"`,
      `"${i.activityCode || ''}"`,
      `"${(i.activityName || '').replace(/"/g, '""')}"`,
      `"${i.discipline || ''}"`,
      `"${(i.workPackageName || '').replace(/"/g, '""')}"`,
      `"${i.quantityCompletedToday ?? 0}"`,
      `"${i.uom || ''}"`,
      `"${i.cumulativeQuantityCompleted ?? 0}"`,
      `"${i.cumulativeProgressPercentage ?? 0}%"`,
      `"${i.manpowerCount ?? ''}"`,
      `"${(i.equipmentUsed || '').replace(/"/g, '""')}"`,
      `"${i.weatherCondition || ''}"`,
      `"${i.isBlocker ? 'YES' : 'NO'}"`,
      `"${i.blockerCategory || ''}"`,
      `"${(i.blockerReason || '').replace(/"/g, '""')}"`,
      `"${(i.recordedBy || '').replace(/"/g, '""')}"`,
      `"${(i.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BuildTwin360_Progress_Journal_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    pushToast(`Exported ${filteredItems.length} progress logs to CSV.`, 'success');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Executive Summary KPI Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-ink-500">
            <Activity className="h-4 w-4 text-brand-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Output</span>
          </div>
          <div className="mt-1 text-lg font-bold text-ink-900">
            {Number(historyData?.totalQuantityLogged ?? 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-ink-400">Cumulative physical units</span>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-ink-500">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Logs</span>
          </div>
          <div className="mt-1 text-lg font-bold text-ink-900">
            {historyData?.totalEntries ?? 0}
          </div>
          <span className="text-[10px] text-ink-400">Chronological site entries</span>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-ink-500">
            <HardHat className="h-4 w-4 text-amber-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Manpower</span>
          </div>
          <div className="mt-1 text-lg font-bold text-ink-900">
            {Number(historyData?.totalManpowerLogged ?? 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-ink-400">Total shift headcount</span>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-ink-500">
            <Layers className="h-4 w-4 text-emerald-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Activities</span>
          </div>
          <div className="mt-1 text-lg font-bold text-ink-900">
            {historyData?.uniqueActivitiesCount ?? 0}
          </div>
          <span className="text-[10px] text-ink-400">Active WBS line items</span>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-ink-500">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Site Blockers</span>
          </div>
          <div className="mt-1 text-lg font-bold text-ink-900">
            {historyData?.totalBlockersEncountered ?? 0}
          </div>
          <span className="text-[10px] text-ink-400">Hindrances recorded</span>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-ink-500">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Timeline Span</span>
          </div>
          <div className="mt-1 truncate text-xs font-bold text-ink-900">
            {historyData?.latestLogDate ? (
              <span>{historyData.latestLogDate}</span>
            ) : (
              <span className="text-ink-400">No logs</span>
            )}
          </div>
          <span className="text-[10px] text-ink-400">
            {historyData?.earliestLogDate ? `Since ${historyData.earliestLogDate}` : 'Awaiting entries'}
          </span>
        </div>
      </div>

      {/* 2. Search & Multi-Criteria Filtering Bar */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search by activity, package, equipment, remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-surface-subtle py-1.5 pl-9 pr-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-surface-base focus:outline-none"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs text-ink-800 focus:border-brand-500 focus:outline-none"
              title="Filter by entry origin"
            >
              <option value="ALL">All Sources</option>
              <option value="DPR">DPR Shift Approvals</option>
              <option value="MANUAL_LOG">Direct Site Logs</option>
            </select>

            {/* Discipline Filter */}
            <select
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value)}
              className="rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs text-ink-800 focus:border-brand-500 focus:outline-none"
              title="Filter by trade discipline"
            >
              <option value="ALL">All Disciplines</option>
              <option value="CIVIL">Civil</option>
              <option value="STRUCTURAL">Structural</option>
              <option value="MEP">MEP</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="HVAC">HVAC</option>
              <option value="FINISHING">Finishing</option>
            </select>

            {/* Blocker Filter */}
            <select
              value={blockerFilter}
              onChange={(e) => setBlockerFilter(e.target.value)}
              className="rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs text-ink-800 focus:border-brand-500 focus:outline-none"
              title="Filter by blocker flag"
            >
              <option value="ALL">All Items</option>
              <option value="BLOCKERS_ONLY">Blockers Only</option>
              <option value="NO_BLOCKERS">Excl. Blockers</option>
            </select>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="flex items-center gap-1 border-surface-border text-ink-600 hover:bg-surface-subtle"
              title="Refresh journal register"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>

            {/* Export CSV */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 border-surface-border text-ink-700 hover:bg-surface-subtle"
              title="Download Journal CSV"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </Button>

            {/* Direct Log Progress Action */}
            {canLogProgress && (
              <Button
                size="sm"
                onClick={() => setIsLogModalOpen(true)}
                className="flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Record Site Progress</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Chronological Progress History Register Table */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface-card p-12 text-center">
          <Activity className="h-10 w-10 text-ink-300" />
          <h4 className="mt-3 text-sm font-semibold text-ink-900">No Progress History Records Found</h4>
          <p className="mt-1 max-w-sm text-xs text-ink-500">
            No chronological site progress entries match your current filters. Approve a submitted DPR or use the &quot;Record Site Progress&quot; button to log output directly.
          </p>
          {canLogProgress && (
            <Button
              size="sm"
              onClick={() => setIsLogModalOpen(true)}
              className="mt-4 flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Record Site Progress</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-surface-border bg-surface-subtle font-semibold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="py-3 pl-4 pr-3">Date & Source</th>
                  <th className="py-3 px-3">WBS Activity</th>
                  <th className="py-3 px-3">Discipline</th>
                  <th className="py-3 px-3 text-right">Today Output</th>
                  <th className="py-3 px-3 min-w-[140px]">Cumulative Progress</th>
                  <th className="py-3 px-3">Site Details</th>
                  <th className="py-3 px-3">Blocker / Notes</th>
                  <th className="py-3 px-3">Recorded By</th>
                  <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-ink-800">
                {filteredItems.map((item) => {
                  const isDpr = item.source === 'DPR';
                  const discClass =
                    DISCIPLINE_COLORS[item.discipline] || 'bg-surface-subtle text-ink-700 border-surface-border';
                  const progressPct = Number(item.cumulativeProgressPercentage ?? 0).toFixed(1);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-subtle/70 transition-colors"
                    >
                      {/* 1. Date & Source */}
                      <td className="py-3 pl-4 pr-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-ink-900">{item.logDate}</span>
                          <div>
                            {isDpr ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.dprId && onOpenDprModal) {
                                    onOpenDprModal(item.dprId, item.dprReportCode);
                                  }
                                }}
                                className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                                title={item.dprReportCode ? `Origin DPR: ${item.dprReportCode}` : 'DPR Cascade'}
                              >
                                <FileText className="h-3 w-3" />
                                <span>{item.dprReportCode ? item.dprReportCode.slice(0, 16) + '...' : 'DPR'}</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                                <Activity className="h-3 w-3" />
                                <span>Site Log</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. WBS Activity */}
                      <td className="py-3 px-3 max-w-[220px]">
                        <div className="flex flex-col">
                          <span className="font-mono text-[11px] font-bold text-brand-700">
                            {item.activityCode || `ACT-${item.activityId}`}
                          </span>
                          <span className="truncate font-semibold text-ink-900" title={item.activityName}>
                            {item.activityName}
                          </span>
                          {item.workPackageName && (
                            <span className="truncate text-[10px] text-ink-400" title={item.workPackageName}>
                              {item.workPackageName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Discipline */}
                      <td className="py-3 px-3">
                        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold border ${discClass}`}>
                          {item.discipline || 'GENERAL'}
                        </span>
                      </td>

                      {/* 4. Today Output */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-ink-900">
                            {item.quantityCompletedToday ?? 0}
                          </span>
                          <span className="text-[10px] text-ink-500 font-medium">{item.uom || 'units'}</span>
                        </div>
                      </td>

                      {/* 5. Cumulative Progress */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-ink-500">
                              {item.cumulativeQuantityCompleted ?? 0} {item.uom || ''}
                            </span>
                            <span className="font-bold text-brand-700">{progressPct}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                            <div
                              className="h-full rounded-full bg-brand-600"
                              style={{ width: `${Math.min(100, Math.max(0, Number(progressPct)))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 6. Site Details */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          {item.manpowerCount != null && (
                            <span className="flex items-center gap-1 text-ink-700">
                              <HardHat className="h-3 w-3 text-amber-600" />
                              <span>{item.manpowerCount} workers</span>
                            </span>
                          )}
                          {item.equipmentUsed && (
                            <span className="truncate max-w-[120px] text-ink-500 text-[10px]" title={item.equipmentUsed}>
                              {item.equipmentUsed}
                            </span>
                          )}
                          {item.weatherCondition && (
                            <span className="text-[10px] text-ink-400">{item.weatherCondition}</span>
                          )}
                        </div>
                      </td>

                      {/* 7. Blocker / Notes */}
                      <td className="py-3 px-3 max-w-[180px]">
                        {item.isBlocker ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Blocker: {item.blockerCategory || 'SITE'}</span>
                            </span>
                            {item.blockerReason && (
                              <span className="truncate text-[10px] text-rose-800" title={item.blockerReason}>
                                {item.blockerReason}
                              </span>
                            )}
                          </div>
                        ) : item.remarks ? (
                          <span className="truncate block text-[11px] text-ink-600" title={item.remarks}>
                            {item.remarks}
                          </span>
                        ) : (
                          <span className="text-[10px] text-ink-300">—</span>
                        )}
                      </td>

                      {/* 8. Recorded By */}
                      <td className="py-3 px-3">
                        <span className="text-ink-700 font-medium">{item.recordedBy || 'Engineer'}</span>
                      </td>

                      {/* 9. Actions */}
                      <td className="py-3 pl-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedItemForDetails(item)}
                            className="rounded p-1 text-ink-500 hover:bg-surface-subtle hover:text-brand-600 transition-colors"
                            title="View log details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {canDeleteLog && (
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item)}
                              className="rounded p-1 text-ink-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete progress log"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer info */}
          <div className="flex items-center justify-between border-t border-surface-border px-4 py-2.5 bg-surface-subtle text-xs text-ink-500">
            <span>
              Showing <strong>{filteredItems.length}</strong> of <strong>{historyData?.totalEntries ?? filteredItems.length}</strong> progress journal records
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px]">Sort: <strong>Newest First</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Progress History Detail Modal */}
      <ProgressHistoryDetailModal
        open={Boolean(selectedItemForDetails)}
        onClose={() => setSelectedItemForDetails(null)}
        item={selectedItemForDetails}
        onOpenDpr={(dprId) => {
          if (onOpenDprModal) {
            onOpenDprModal(dprId);
          }
        }}
      />

      {/* Direct Site Progress Logging Modal */}
      <LogProgressModal
        open={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        activities={wbsActivities}
        onSave={handleSaveProgress}
        isSaving={logMutation.isPending}
      />
    </div>
  );
}
