import { useState, useMemo } from 'react';
import { ModulePageHeading } from '@/design-system/components/ModulePageHeading/ModulePageHeading';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Download,
  Plus,
  Search,
  Filter,
  FileText,
  Activity,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Clock,
  HardHat,
  Building,
  RefreshCw,
} from 'lucide-react';
import { Button, Modal, CardSkeleton } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useAuthStore, useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { projectsApi } from '@/modules/projects/api/projectsApi';
import { progressDprApi } from '../api/progressDprApi';
import { DprEntryFormModal } from '../components/DprEntryFormModal';
import { DprDetailsModal } from '../components/DprDetailsModal';
import { DprPhotoGalleryModal } from '../components/DprPhotoGalleryModal';
import { DprCardGrid } from '../components/DprCardGrid';
import { ProgressHistoryTab } from '../components/ProgressHistoryTab';
import { DprBlockersTab } from '../components/DprBlockersTab';
import { generateDprPdf } from '../utils/dprPdfGenerator';

export function ProgressDprListPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const user = useAuthStore((state) => state.user);

  // Selected Project (Defaults to 1)
  const [selectedProjectId, setSelectedProjectId] = useState(1);

  // Active Sub-Tab: 'dpr-reports' | 'progress-history' | 'blockers'
  const [activeTab, setActiveTab] = useState('dpr-reports');

  // DPR State
  const [isEntryOpen, setEntryOpen] = useState(false);
  const [editingDpr, setEditingDpr] = useState(null);
  const [deletingDpr, setDeletingDpr] = useState(null);
  const [selectedDprForDetails, setSelectedDprForDetails] = useState(null);
  const [galleryModalData, setGalleryModalData] = useState({ open: false, photos: [], title: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [downloadingId, setDownloadingId] = useState(null);

  const canCreateDpr = useHasRole(
    ROLES.SITE_ENGINEER,
    ROLES.SITE_SUPERVISOR,
    ROLES.PROJECT_MANAGER,
    ROLES.DIRECTOR,
    ROLES.ADMIN
  );

  const canManageDpr = useHasRole(
    ROLES.SITE_ENGINEER,
    ROLES.SITE_SUPERVISOR,
    ROLES.PROJECT_MANAGER,
    ROLES.DIRECTOR,
    ROLES.ADMIN
  );

  const canDeleteDpr = useHasRole(
    ROLES.ADMIN,
    ROLES.DIRECTOR,
    ROLES.PROJECT_MANAGER,
    ROLES.SITE_ENGINEER
  );

  // Fetch Projects List for selector
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list-selector'],
    queryFn: () => projectsApi.list({ size: 50 }),
    staleTime: 1000 * 60 * 5,
  });

  // Fetch DPR list from backend for selected project
  const {
    data: dprs = [],
    isLoading: isDprLoading,
    refetch: refetchDprs,
    isFetching: isDprFetching,
  } = useQuery({
    queryKey: ['progress-dpr', selectedProjectId],
    queryFn: () => progressDprApi.list(selectedProjectId),
  });

  // Fetch DPR Executive Summary KPIs
  const { data: dprSummary } = useQuery({
    queryKey: ['dpr-summary', selectedProjectId],
    queryFn: () => progressDprApi.getSummary(selectedProjectId),
    staleTime: 1000 * 30,
  });

  // Fetch Progress History KPI Summary
  const { data: progressHistorySummary } = useQuery({
    queryKey: ['project-progress-history-summary', selectedProjectId],
    queryFn: () => progressDprApi.getProjectProgressHistory(selectedProjectId, { size: 1 }),
    staleTime: 1000 * 30,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload) => progressDprApi.create(payload, selectedProjectId),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => progressDprApi.update(id, payload),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => progressDprApi.delete(id),
  });

  const submittedBy = user?.name || user?.username || 'Site Engineer';

  async function saveDpr(payload, shouldDownload = false) {
    try {
      let savedResult;
      if (editingDpr) {
        savedResult = await updateMutation.mutateAsync({ id: editingDpr.id, payload });
        await queryClient.invalidateQueries({ queryKey: ['progress-dpr'] });
        await queryClient.invalidateQueries({ queryKey: ['project-progress-history'] });

        const fullRecord = {
          ...editingDpr,
          ...payload,
          ...(savedResult || {}),
          quantities:
            payload.quantities && payload.quantities.length > 0
              ? payload.quantities
              : savedResult?.quantities || editingDpr.quantities || [],
          photos:
            payload.photos && payload.photos.length > 0
              ? payload.photos
              : savedResult?.photos || editingDpr.photos || [],
        };

        if (shouldDownload) {
          await generateDprPdf(fullRecord);
          pushToast('DPR updated and PDF report downloaded!', 'success');
        } else {
          pushToast(
            payload.status === 'DRAFT'
              ? 'DPR saved as draft.'
              : payload.status === 'SUBMITTED'
              ? 'DPR submitted for approval successfully.'
              : 'DPR updated successfully.',
            'success'
          );
        }
      } else {
        savedResult = await createMutation.mutateAsync(payload);
        await queryClient.invalidateQueries({ queryKey: ['progress-dpr'] });
        await queryClient.invalidateQueries({ queryKey: ['project-progress-history'] });

        const fullRecord = {
          ...payload,
          ...(savedResult || {}),
          quantities:
            payload.quantities && payload.quantities.length > 0
              ? payload.quantities
              : savedResult?.quantities || [],
          photos:
            payload.photos && payload.photos.length > 0
              ? payload.photos
              : savedResult?.photos || [],
        };

        if (shouldDownload) {
          await generateDprPdf(fullRecord);
          pushToast('DPR saved and PDF report downloaded!', 'success');
        } else {
          pushToast(
            payload.status === 'DRAFT'
              ? 'DPR saved as draft.'
              : 'DPR submitted for approval successfully.',
            'success'
          );
        }
      }
      setEntryOpen(false);
      setEditingDpr(null);
    } catch (error) {
      pushToast(error?.message || 'Unable to save the DPR. Please try again.', 'error');
      throw error;
    }
  }

  const handleDownloadReport = async (row) => {
    if (downloadingId) return;
    setDownloadingId(row.id);
    try {
      await generateDprPdf(row);
      pushToast(`Downloaded report for ${row.siteName || row.id || 'DPR'}`, 'success');
    } catch (err) {
      console.error('PDF generation error:', err);
      pushToast('Unable to generate PDF report. Please try again.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenPhotoGallery = (row, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (row.photos && row.photos.length > 0) {
      setGalleryModalData({
        open: true,
        photos: row.photos,
        title: `Site Photos: ${row.siteName} (${row.reportDate})`,
      });
    }
  };

  // Open DPR Modal from linked Progress History Item
  const handleOpenDprFromJournal = async (dprId, _dprCode) => {
    try {
      // Look up locally first or query backend
      const found = dprs.find((d) => String(d.id) === String(dprId));
      if (found) {
        setSelectedDprForDetails(found);
      } else {
        const remote = await progressDprApi.getById(dprId);
        setSelectedDprForDetails(remote);
      }
    } catch (err) {
      pushToast('Unable to load DPR details.', 'error');
    }
  };

  // Export filtered DPRs to CSV file
  const handleExportCsv = () => {
    if (!filteredDprData || filteredDprData.length === 0) {
      pushToast('No DPR records to export.', 'warning');
      return;
    }
    const headers = [
      'DPR ID',
      'Report Code',
      'Report Date',
      'Project / Site',
      'Shift',
      'Work Summary',
      'Quantities Completed',
      'Status',
      'Photos Attached',
      'Submitted By',
      'Remarks',
    ];

    const rows = filteredDprData.map((d) => [
      `"${d.id || ''}"`,
      `"${d.reportCode || ''}"`,
      `"${d.reportDate || ''}"`,
      `"${(d.siteName || '').replace(/"/g, '""')}"`,
      `"${d.shift || 'DAY_SHIFT'}"`,
      `"${(d.activity || '').replace(/"/g, '""')}"`,
      `"${(d.qtyCompleted || '').replace(/"/g, '""')}"`,
      `"${d.status || ''}"`,
      `"${(d.photos || []).length}"`,
      `"${(d.submittedBy || '').replace(/"/g, '""')}"`,
      `"${(d.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BuildTwin360_DPR_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    pushToast(`Exported ${filteredDprData.length} reports to CSV.`, 'success');
  };

  // Filter DPR data
  const filteredDprData = useMemo(() => {
    return (dprs ?? []).filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchesSite = item.siteName?.toLowerCase().includes(q);
      const matchesActivity = item.activity?.toLowerCase().includes(q);
      const matchesCode = item.reportCode?.toLowerCase().includes(q);
      const matchesTag = item.photos?.some((p) => p.activityTag?.toLowerCase().includes(q));
      return matchesSite || matchesActivity || matchesCode || matchesTag;
    });
  }, [dprs, statusFilter, searchQuery]);

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Header Banner & Project Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <ModulePageHeading>Daily Progress & Production Module</ModulePageHeading>
          <p className="mt-0.5 text-xs text-ink-500">
            Site execution shifts, chronological progress history journals, physical velocity, and blocker tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Project Selector */}
          <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-3 py-1.5 shadow-2xs">
            <Building className="h-4 w-4 text-brand-600" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-ink-900 focus:outline-none cursor-pointer"
              title="Select active project"
            >
              {projects.length > 0 ? (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.code ? `(${p.code})` : ''}
                  </option>
                ))
              ) : (
                <option value={1}>Ashok Grandeur - Padur, Chennai (PADUR-AG-01)</option>
              )}
            </select>
          </div>

          {/* Export CSV (DPR) */}
          {activeTab === 'dpr-reports' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 border-surface-border text-ink-700 hover:bg-surface-subtle"
              title="Download CSV register"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              <span>Export CSV</span>
            </Button>
          )}

          {/* New DPR Entry Button */}
          {activeTab === 'dpr-reports' && canCreateDpr && (
            <Button
              size="sm"
              onClick={() => {
                setEditingDpr(null);
                setEntryOpen(true);
              }}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New DPR Shift Entry</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="flex border-b border-surface-border">
        <nav className="flex space-x-6" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('dpr-reports')}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 text-xs font-semibold transition-all ${
              activeTab === 'dpr-reports'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-700'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Daily Progress Reports (DPR)</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === 'dpr-reports'
                  ? 'bg-brand-100 text-brand-800'
                  : 'bg-surface-subtle text-ink-600'
              }`}
            >
              {dprs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('progress-history')}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 text-xs font-semibold transition-all ${
              activeTab === 'progress-history'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-700'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Progress History & Production Journal</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === 'progress-history'
                  ? 'bg-brand-100 text-brand-800'
                  : 'bg-surface-subtle text-ink-600'
              }`}
            >
              {progressHistorySummary?.totalEntries ?? 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('blockers')}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 text-xs font-semibold transition-all ${
              activeTab === 'blockers'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-700'
            }`}
          >
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>Site Execution Blockers & Delays</span>
            {progressHistorySummary?.totalBlockersEncountered > 0 && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                {progressHistorySummary.totalBlockersEncountered}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: Daily Progress Reports (DPR) */}
      {activeTab === 'dpr-reports' && (
        <div className="flex flex-col gap-4">
          {/* Quick DPR Filter / Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder="Search by report code, site, work summary..."
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
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchDprs()}
                className="flex items-center gap-1 border-surface-border text-ink-600 hover:bg-surface-subtle"
                title="Refresh DPRs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isDprFetching ? 'animate-spin' : ''}`} />
              </Button>

              <span className="text-xs text-ink-500 ml-2">
                Showing <strong>{filteredDprData.length}</strong> reports
              </span>
            </div>
          </div>

          {/* Visual Field Cards View */}
          {isDprLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} className="min-h-[220px]" />
              ))}
            </div>
          ) : (
            <DprCardGrid
              data={filteredDprData}
              onSelectDpr={(row) => setSelectedDprForDetails(row)}
              onEditDpr={(row) => {
                setEditingDpr(row);
                setEntryOpen(true);
              }}
              onDeleteDpr={(row) => setDeletingDpr(row)}
              onDownloadPdf={handleDownloadReport}
              downloadingId={downloadingId}
              onOpenPhotoGallery={handleOpenPhotoGallery}
              canManage={canManageDpr}
              canDelete={canDeleteDpr}
            />
          )}
        </div>
      )}

      {/* TAB 2: Progress History & Production Journal */}
      {activeTab === 'progress-history' && (
        <ProgressHistoryTab
          projectId={selectedProjectId}
          onOpenDprModal={handleOpenDprFromJournal}
        />
      )}

      {/* TAB 3: Site Execution Blockers & Delays */}
      {activeTab === 'blockers' && (
        <DprBlockersTab
          projectId={selectedProjectId}
          onOpenDprModal={handleOpenDprFromJournal}
        />
      )}

      {/* DPR Entry Form Modal (Create & Update modes) */}
      <DprEntryFormModal
        open={isEntryOpen}
        onClose={() => {
          setEntryOpen(false);
          setEditingDpr(null);
        }}
        onSave={saveDpr}
        isSaving={createMutation.isPending || updateMutation.isPending}
        submittedBy={submittedBy}
        initialData={editingDpr}
      />

      {/* DPR Details & Evidence Modal */}
      <DprDetailsModal
        open={Boolean(selectedDprForDetails)}
        onClose={() => setSelectedDprForDetails(null)}
        dpr={selectedDprForDetails}
        onEdit={(row) => {
          setEditingDpr(row);
          setEntryOpen(true);
        }}
        onDelete={(row) => setDeletingDpr(row)}
      />

      {/* Direct Photo Gallery Lightbox */}
      <DprPhotoGalleryModal
        open={galleryModalData.open}
        onClose={() => setGalleryModalData({ open: false, photos: [], title: '' })}
        photos={galleryModalData.photos}
        title={galleryModalData.title}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deletingDpr)}
        onClose={() => setDeletingDpr(null)}
        title="Delete Daily Progress Report"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingDpr(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (deletingDpr) {
                  deleteMutation.mutate(deletingDpr.id, {
                    onSuccess: () => {
                      queryClient.invalidateQueries({ queryKey: ['progress-dpr'] });
                      pushToast('DPR deleted successfully.', 'success');
                      setDeletingDpr(null);
                    },
                    onError: (err) => {
                      pushToast(err?.message || 'Failed to delete DPR.', 'error');
                    },
                  });
                }
              }}
              isLoading={deleteMutation.isPending}
            >
              Delete Report
            </Button>
          </div>
        }
      >
        <div className="py-2 text-sm text-ink-700">
          Are you sure you want to delete the DPR for <strong>{deletingDpr?.siteName}</strong> on{' '}
          <strong>{deletingDpr?.reportDate}</strong>?
          <p className="mt-2 text-xs text-status-danger font-medium">
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
