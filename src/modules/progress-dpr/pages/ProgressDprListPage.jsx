import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Camera, Tag, Eye, Plus, Search, Filter, Calendar, Building } from 'lucide-react';
import { Table, StatusPill, Button, Input } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useAuthStore, useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { progressDprApi } from '../api/progressDprApi';
import { DprEntryFormModal } from '../components/DprEntryFormModal';
import { DprDetailsModal } from '../components/DprDetailsModal';
import { DprPhotoGalleryModal } from '../components/DprPhotoGalleryModal';
import { generateDprPdf } from '../utils/dprPdfGenerator';

function displayQuantities(row) {
  return row.qtyCompleted || '-';
}

export function ProgressDprListPage() {
  const [isEntryOpen, setEntryOpen] = useState(false);
  const [selectedDprForDetails, setSelectedDprForDetails] = useState(null);
  const [galleryModalData, setGalleryModalData] = useState({ open: false, photos: [], title: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const canCreateDpr = useHasRole(
    ROLES.SITE_ENGINEER,
    ROLES.SITE_SUPERVISOR,
    ROLES.PROJECT_MANAGER,
    ROLES.DIRECTOR,
    ROLES.ADMIN
  );

  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useQuery({ queryKey: ['progress-dpr'], queryFn: () => progressDprApi.list() });
  const createMutation = useMutation({ mutationFn: progressDprApi.create });
  const submittedBy = user?.name || user?.username || 'Site Engineer';

  async function saveDpr(payload, shouldDownload = false) {
    try {
      const savedResult = await createMutation.mutateAsync(payload);
      await queryClient.invalidateQueries({ queryKey: ['progress-dpr'] });

      const fullRecord = savedResult || payload;
      if (shouldDownload) {
        generateDprPdf(fullRecord);
        pushToast('DPR saved and PDF report downloaded!', 'success');
      } else {
        pushToast(payload.status === 'DRAFT' ? 'DPR saved as a draft.' : 'DPR submitted successfully with photos.', 'success');
      }
      setEntryOpen(false);
    } catch (error) {
      pushToast(error?.message || 'Unable to save the DPR. Please try again.', 'error');
      throw error;
    }
  }

  const handleDownloadReport = (row) => {
    try {
      generateDprPdf(row);
      pushToast(`Downloaded report for ${row.siteName || row.id || 'DPR'}`, 'success');
    } catch (err) {
      console.error('PDF generation error:', err);
      pushToast('Unable to generate PDF report. Please try again.', 'error');
    }
  };

  const handleOpenPhotoGallery = (row, e) => {
    e.stopPropagation();
    if (row.photos && row.photos.length > 0) {
      setGalleryModalData({
        open: true,
        photos: row.photos,
        title: `Site Photos: ${row.siteName} (${row.reportDate})`,
      });
    }
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

  const columns = [
    { key: 'reportDate', header: 'Date', render: (row) => (
      <span className="font-semibold text-ink-900">{row.reportDate}</span>
    )},
    { key: 'siteName', header: 'Site / Project', render: (row) => (
      <div className="flex flex-col">
        <span className="font-medium text-ink-900">{row.siteName}</span>
        <span className="text-[11px] text-ink-400">ID: {row.id}</span>
      </div>
    )},
    { key: 'activity', header: 'Work Summary' },
    { key: 'qtyCompleted', header: 'Quantities', render: displayQuantities },
    {
      key: 'photos',
      header: 'Photo Evidence & Tags',
      render: (row) => {
        const photos = row.photos || [];
        if (photos.length === 0) {
          return <span className="text-xs text-ink-400 italic">No photos</span>;
        }

        // Get unique activity tags from attached photos
        const tags = Array.from(new Set(photos.map((p) => p.activityTag).filter(Boolean)));

        return (
          <div
            className="group/photo flex items-center gap-2 cursor-pointer"
            onClick={(e) => handleOpenPhotoGallery(row, e)}
            title="Click to view full photo gallery"
          >
            {/* Stacked Thumbnails */}
            <div className="relative flex items-center -space-x-2">
              {photos.slice(0, 3).map((photo, i) => (
                <div
                  key={i}
                  className="relative h-8 w-8 overflow-hidden rounded-md border-2 border-white shadow-xs group-hover/photo:scale-105 transition-transform"
                >
                  <img
                    src={photo.previewUrl || photo.url || photo.dataUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Photo count and tags */}
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover/photo:text-brand-700">
                <Camera className="h-3 w-3" />
                {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
              </span>
              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 max-w-[180px]">
                  {tags.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-0.5 rounded bg-brand-50 px-1.5 py-0.2 text-[10px] font-medium text-brand-700 border border-brand-200 truncate max-w-[120px]"
                    >
                      <Tag className="h-2 w-2 shrink-0" />
                      <span className="truncate">{tag}</span>
                    </span>
                  ))}
                  {tags.length > 2 && (
                    <span className="text-[10px] text-ink-400">+{tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    { key: 'submittedBy', header: 'Submitted By' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs text-ink-600 hover:text-brand-600"
            onClick={() => setSelectedDprForDetails(row)}
            title="View DPR Details & Attached Photos"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            <span>Details</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 flex items-center gap-1 border-brand-200 text-xs text-brand-600 hover:bg-brand-50 hover:text-brand-700"
            onClick={() => handleDownloadReport(row)}
            title="Download DPR PDF Document"
          >
            <Download className="h-3.5 w-3.5" />
            <span>PDF</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-heading flex items-center gap-2">
            Daily Progress Report (DPR)
            <span className="inline-flex items-center rounded-md bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200">
              Site Intelligence
            </span>
          </h1>
          <p className="page-subheading">
            Submit daily site quantities, upload high-res photos (up to 100MB), tag work activities, and generate audit-ready PDF reports.
          </p>
        </div>
        {canCreateDpr && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setEntryOpen(true)}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New DPR Entry</span>
            </Button>
          </div>
        )}
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
          <span>Showing <strong>{filteredData.length}</strong> reports</span>
        </div>
      </div>

      {/* DPR Table */}
      <Table
        columns={columns}
        data={filteredData}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        onRowClick={(row) => setSelectedDprForDetails(row)}
        emptyMessage={
          searchQuery
            ? 'No DPR entries match your search.'
            : 'No DPR entries yet. Click "New DPR Entry" to create your first report.'
        }
      />

      {/* DPR Entry Form Modal (with 100MB Photo Upload & Activity Tagging) */}
      <DprEntryFormModal
        open={isEntryOpen}
        onClose={() => setEntryOpen(false)}
        onSave={saveDpr}
        isSaving={createMutation.isPending}
        submittedBy={submittedBy}
      />

      {/* DPR Details & Evidence Modal */}
      <DprDetailsModal
        open={Boolean(selectedDprForDetails)}
        onClose={() => setSelectedDprForDetails(null)}
        dpr={selectedDprForDetails}
      />

      {/* Direct Photo Gallery Lightbox */}
      <DprPhotoGalleryModal
        open={galleryModalData.open}
        onClose={() => setGalleryModalData({ open: false, photos: [], title: '' })}
        photos={galleryModalData.photos}
        title={galleryModalData.title}
      />
    </div>
  );
}
