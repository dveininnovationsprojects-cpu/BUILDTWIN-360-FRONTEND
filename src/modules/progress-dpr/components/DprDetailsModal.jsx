import { useState } from 'react';
import {
  X,
  Calendar,
  Building,
  User,
  CheckCircle2,
  FileText,
  Download,
  Camera,
  Tag,
  MapPin,
  Eye,
  Layers,
  Sparkles,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Modal, Button, StatusPill } from '@/design-system';
import { DprPhotoGalleryModal } from './DprPhotoGalleryModal';
import { generateDprPdf } from '../utils/dprPdfGenerator';

export function DprDetailsModal({ open, onClose, dpr, onEdit, onDelete }) {
  const [activeTagFilter, setActiveTagFilter] = useState('ALL');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  if (!dpr) return null;

  const photos = Array.isArray(dpr.photos) ? dpr.photos : [];
  const quantities = Array.isArray(dpr.quantities) && dpr.quantities.length > 0
    ? dpr.quantities
    : Array.isArray(dpr.quantityEntries) && dpr.quantityEntries.length > 0
    ? dpr.quantityEntries
    : [];

  // Extract unique activity tags from photos
  const activityTags = Array.from(
    new Set(photos.map((p) => p.activityTag || 'General Progress').filter(Boolean))
  );

  const filteredPhotos =
    activeTagFilter === 'ALL'
      ? photos
      : photos.filter((p) => (p.activityTag || 'General Progress') === activeTagFilter);

  const handleOpenGallery = (index) => {
    // Find index in unfiltered list
    const selectedPhoto = filteredPhotos[index];
    const originalIndex = photos.findIndex((p) => p.id === selectedPhoto?.id);
    setGalleryIndex(originalIndex >= 0 ? originalIndex : 0);
    setGalleryOpen(true);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        size="lg"
        title={
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold text-ink-900">
              Daily Progress Report Details
            </span>
            <StatusPill status={dpr.status} />
          </div>
        }
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  className="flex items-center gap-1.5 border-brand-500 text-brand-600 hover:bg-brand-50"
                  onClick={() => {
                    onClose();
                    onEdit(dpr);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit DPR</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 text-status-danger hover:bg-status-dangerBg"
                  onClick={() => {
                    onClose();
                    onDelete(dpr);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-1.5 border-brand-500 text-brand-600 hover:bg-brand-50"
              onClick={() => generateDprPdf(dpr)}
            >
              <Download className="h-4 w-4" />
              <span>Download PDF Report</span>
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5 py-1">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-xl bg-surface-subtle p-3.5 border border-surface-border">
            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-brand-600 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Report Date</span>
                <p className="text-xs font-semibold text-ink-900">{dpr.reportDate || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building className="h-4 w-4 text-brand-600 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Project / Site</span>
                <p className="text-xs font-semibold text-ink-900">{dpr.siteName || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <User className="h-4 w-4 text-brand-600 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Submitted By</span>
                <p className="text-xs font-semibold text-ink-900">{dpr.submittedBy || 'Site Engineer'}</p>
              </div>
            </div>
          </div>

          {/* Work Summary */}
          {dpr.activity && (
            <div className="rounded-lg border border-surface-border p-3.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Work Summary</span>
              <p className="mt-1 text-sm font-medium text-ink-900">{dpr.activity}</p>
            </div>
          )}

          {/* Quantities Table */}
          {quantities.length > 0 && (
            <div className="rounded-lg border border-surface-border overflow-hidden">
              <div className="bg-surface-subtle px-3.5 py-2 border-b border-surface-border">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Completed Quantities ({quantities.length})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-subtle/50 text-ink-500 font-semibold border-b border-surface-border">
                    <tr>
                      <th className="px-3.5 py-2">#</th>
                      <th className="px-3.5 py-2">Work Item / Description</th>
                      <th className="px-3.5 py-2 text-right">Quantity</th>
                      <th className="px-3.5 py-2">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {quantities.map((q, idx) => (
                      <tr key={idx} className="hover:bg-surface-subtle/40">
                        <td className="px-3.5 py-2 text-ink-400">{idx + 1}</td>
                        <td className="px-3.5 py-2 font-medium text-ink-900">{q.workDescription || q.item || '-'}</td>
                        <td className="px-3.5 py-2 text-right font-semibold text-brand-700">{q.completedQuantity != null ? q.completedQuantity : '-'}</td>
                        <td className="px-3.5 py-2 text-ink-600">{q.unit || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Photos & Activity Tagging Section */}
          <div className="rounded-xl border border-surface-border p-4 bg-surface-card">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-brand-600" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-900">
                  Site Photo Evidence & Activity Tags ({photos.length})
                </h4>
              </div>

              {photos.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setGalleryIndex(0);
                    setGalleryOpen(true);
                  }}
                  className="h-7 text-xs px-2.5 flex items-center gap-1 text-brand-600"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Fullscreen Gallery
                </Button>
              )}
            </div>

            {photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-surface-border p-6 text-center text-ink-400">
                <Camera className="h-8 w-8 mb-1.5 opacity-40" />
                <p className="text-xs font-medium">No site photos attached to this report.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Activity Tag Filter Tabs */}
                {activityTags.length > 1 && (
                  <div className="flex flex-wrap items-center gap-1.5 border-b border-surface-border pb-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveTagFilter('ALL')}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        activeTagFilter === 'ALL'
                          ? 'bg-brand-600 text-white'
                          : 'bg-surface-subtle text-ink-600 hover:bg-surface-muted'
                      }`}
                    >
                      All ({photos.length})
                    </button>
                    {activityTags.map((tag) => {
                      const count = photos.filter((p) => (p.activityTag || 'General Progress') === tag).length;
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setActiveTagFilter(tag)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                            activeTagFilter === tag
                              ? 'bg-brand-600 text-white'
                              : 'bg-surface-subtle text-ink-600 hover:bg-surface-muted'
                          }`}
                        >
                          <Tag className="h-3 w-3" />
                          <span>{tag}</span>
                          <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Photo Grid */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPhotos.map((photo, index) => (
                    <div
                      key={photo.id || index}
                      onClick={() => handleOpenGallery(index)}
                      className="group cursor-pointer overflow-hidden rounded-lg border border-surface-border bg-surface-subtle hover:border-brand-400 hover:shadow-md transition-all"
                    >
                      <div className="relative h-32 w-full overflow-hidden bg-ink-950/10">
                        <img
                          src={photo.previewUrl || photo.url || photo.dataUrl}
                          alt={photo.caption || photo.activityTag || 'Photo'}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute left-2 top-2 max-w-[85%] truncate">
                          <span className="inline-flex items-center gap-1 rounded bg-brand-900/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                            <Tag className="h-2.5 w-2.5 text-brand-300" />
                            <span className="truncate">{photo.activityTag || 'General Progress'}</span>
                          </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-6 w-6 text-white drop-shadow" />
                        </div>
                      </div>

                      <div className="p-2.5">
                        {photo.caption ? (
                          <p className="text-xs font-medium text-ink-900 line-clamp-1">{photo.caption}</p>
                        ) : (
                          <p className="text-xs text-ink-500 italic">No caption</p>
                        )}

                        <div className="mt-1 flex items-center justify-between text-[10px] text-ink-400">
                          {photo.locationTag ? (
                            <span className="flex items-center gap-0.5 text-amber-700 dark:text-amber-400 font-medium">
                              <MapPin className="h-2.5 w-2.5" />
                              {photo.locationTag}
                            </span>
                          ) : (
                            <span>{photo.name || 'Photo'}</span>
                          )}
                          {photo.uploadedAt && <span>{new Date(photo.uploadedAt).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Remarks */}
          {dpr.remarks && (
            <div className="rounded-lg border border-surface-border p-3.5 bg-surface-subtle">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Site Remarks</span>
              <p className="mt-1 text-xs text-ink-700 whitespace-pre-wrap">{dpr.remarks}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Lightbox Modal */}
      <DprPhotoGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        photos={photos}
        initialIndex={galleryIndex}
        title={`Site Photos - ${dpr.siteName || dpr.id}`}
      />
    </>
  );
}
