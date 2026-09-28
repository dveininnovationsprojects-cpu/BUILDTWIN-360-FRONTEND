import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Download,
  Plus,
  Search,
} from 'lucide-react';
import { Button, Modal } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useAuthStore, useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { progressDprApi } from '../api/progressDprApi';
import { DprEntryFormModal } from '../components/DprEntryFormModal';
import { DprDetailsModal } from '../components/DprDetailsModal';
import { DprPhotoGalleryModal } from '../components/DprPhotoGalleryModal';
import { DprCardGrid } from '../components/DprCardGrid';
import { generateDprPdf } from '../utils/dprPdfGenerator';

export function ProgressDprListPage() {
  const [isEntryOpen, setEntryOpen] = useState(false);
  const [editingDpr, setEditingDpr] = useState(null);
  const [deletingDpr, setDeletingDpr] = useState(null);
  const [selectedDprForDetails, setSelectedDprForDetails] = useState(null);
  const [galleryModalData, setGalleryModalData] = useState({ open: false, photos: [], title: '' });
  const [searchQuery, setSearchQuery] = useState('');
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

  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useQuery({
    queryKey: ['progress-dpr'],
    queryFn: () => progressDprApi.list(),
  });

  const createMutation = useMutation({ mutationFn: progressDprApi.create });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }) => progressDprApi.update(id, payload) });
  const deleteMutation = useMutation({ mutationFn: (id) => progressDprApi.delete(id) });

  const submittedBy = user?.name || user?.username || 'Site Engineer';

  async function saveDpr(payload, shouldDownload = false) {
    try {
      let savedResult;
      if (editingDpr) {
        savedResult = await updateMutation.mutateAsync({ id: editingDpr.id, payload });
        await queryClient.invalidateQueries({ queryKey: ['progress-dpr'] });

        const fullRecord = savedResult || payload;
        if (shouldDownload) {
          await generateDprPdf(fullRecord);
          pushToast('DPR updated and PDF report downloaded!', 'success');
        } else {
          pushToast('DPR updated successfully.', 'success');
        }
      } else {
        savedResult = await createMutation.mutateAsync(payload);
        await queryClient.invalidateQueries({ queryKey: ['progress-dpr'] });

        const fullRecord = savedResult || payload;
        if (shouldDownload) {
          await generateDprPdf(fullRecord);
          pushToast('DPR saved and PDF report downloaded!', 'success');
        } else {
          pushToast(
            payload.status === 'DRAFT'
              ? 'DPR saved as a draft.'
              : 'DPR submitted successfully with photos.',
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

  // Export filtered DPRs to CSV file
  const handleExportCsv = () => {
    if (!filteredData || filteredData.length === 0) {
      pushToast('No DPR records to export.', 'warning');
      return;
    }
    const headers = [
      'DPR ID',
      'Report Date',
      'Project / Site',
      'Work Summary',
      'Quantities Completed',
      'Status',
      'Photos Attached',
      'Submitted By',
      'Remarks',
    ];

    const rows = filteredData.map((d) => [
      `"${d.id || ''}"`,
      `"${d.reportDate || ''}"`,
      `"${(d.siteName || '').replace(/"/g, '""')}"`,
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
    pushToast(`Exported ${filteredData.length} reports to CSV.`, 'success');
  };

  // Filter DPR data
  const filteredData = (data ?? []).filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesSite = item.siteName?.toLowerCase().includes(q);
    const matchesActivity = item.activity?.toLowerCase().includes(q);
    const matchesTag = item.photos?.some((p) => p.activityTag?.toLowerCase().includes(q));
    return matchesSite || matchesActivity || matchesTag;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-heading">Daily Progress Report (DPR)</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Downloadable CSV Option */}
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

          {canCreateDpr && (
            <Button
              size="sm"
              onClick={() => {
                setEditingDpr(null);
                setEntryOpen(true);
              }}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New DPR Entry</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-card p-3 shadow-xs">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by site, work summary, activity tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-surface-border bg-surface-subtle py-1.5 pl-9 pr-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-surface-base focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-500">
          <span>
            Showing <strong>{filteredData.length}</strong> reports
          </span>
        </div>
      </div>

      {/* Visual Field Cards View Only */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-ink-500 text-sm">
          Loading DPR reports...
        </div>
      ) : (
        <DprCardGrid
          data={filteredData}
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
