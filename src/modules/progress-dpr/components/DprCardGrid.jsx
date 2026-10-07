import { useState } from 'react';
import {
  Calendar,
  Building2,
  Camera,
  Tag,
  Download,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  CheckCircle2,
  MapPin,
  User,
  Layers,
  Sparkles,
  FileText,
} from 'lucide-react';
import { StatusPill, Button } from '@/design-system';

export function DprCardGrid({
  data = [],
  onSelectDpr,
  onEditDpr,
  onDeleteDpr,
  onDownloadPdf,
  downloadingId,
  onOpenPhotoGallery,
  canManage = false,
  canDelete = false,
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface-card p-12 text-center shadow-xs">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-3 border border-brand-100">
          <FileText className="h-7 w-7 opacity-80" />
        </div>
        <h3 className="text-base font-semibold text-ink-900">No DPR reports found</h3>
        <p className="mt-1 max-w-sm text-xs text-ink-500">
          No progress reports match your active search or filters. Try adjusting your query or click
          "New DPR Entry" to log a report.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.map((row) => {
        const photos = row.photos || [];
        const hasPhotos = photos.length > 0;
        const quantities = Array.isArray(row.quantities) && row.quantities.length > 0
          ? row.quantities
          : [];
        const isMenuOpen = activeMenuId === row.id;

        return (
          <div
            key={row.id}
            onClick={() => onSelectDpr(row)}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md cursor-pointer"
          >
            {/* Card Top / Header */}
            <div className="p-4 pb-3 border-b border-surface-border/60 bg-gradient-to-r from-surface-subtle/50 to-surface-card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 border border-brand-100 text-brand-600 font-semibold text-xs">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs text-ink-900 line-clamp-1" title={row.siteName}>
                      {row.siteName}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
                      <Calendar className="h-3 w-3 text-ink-400" />
                      <span>{row.reportDate}</span>
                      <span className="text-ink-300">·</span>
                      <span className="text-[10px] text-ink-400 font-mono">#{row.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <StatusPill status={row.status} />

                  {/* 3-dots Dropdown Menu */}
                  {(canManage || canDelete) && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : row.id);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-ink-500 hover:bg-surface-subtle hover:text-ink-900"
                        title="More actions"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>

                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                            }}
                          />
                          <div className="absolute right-0 z-40 mt-1 w-36 rounded-lg border border-surface-border bg-surface-base py-1 shadow-popover">
                            {canManage && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  onEditDpr(row);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-ink-700 hover:bg-surface-subtle"
                              >
                                <Pencil className="h-3.5 w-3.5 text-brand-600" />
                                <span>Edit Report</span>
                              </button>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  onDeleteDpr(row);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-status-danger hover:bg-status-dangerBg"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Report</span>
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="flex flex-col gap-3 p-4 flex-1">
              {/* Work Summary & Qty */}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                  Activity Summary
                </span>
                <p className="mt-0.5 text-xs font-medium text-ink-900 line-clamp-2">
                  {row.activity || 'General site execution'}
                </p>

                {row.qtyCompleted && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-brand-50/80 px-2 py-1 text-xs font-semibold text-brand-800 border border-brand-100">
                    <span className="text-[10px] uppercase font-bold text-brand-500">Qty Done:</span>
                    <span>{row.qtyCompleted}</span>
                  </div>
                )}
              </div>

              {/* Photo Evidence Gallery Showcase */}
              <div className="mt-1">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-semibold text-ink-600 flex items-center gap-1">
                    <Camera className="h-3 w-3 text-brand-600" />
                    <span>Visual Evidence</span>
                  </span>
                  {hasPhotos && (
                    <span className="text-[10px] font-medium text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded border border-brand-100">
                      {photos.length} {photos.length === 1 ? 'capture' : 'captures'}
                    </span>
                  )}
                </div>

                {hasPhotos ? (
                  <div
                    className="group/gallery relative flex gap-2 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPhotoGallery(row, e);
                    }}
                    title="Click to view full photo evidence"
                  >
                    {/* Render up to 2 previews side-by-side */}
                    {photos.slice(0, 2).map((photo, i) => (
                      <div
                        key={i}
                        className="relative h-24 flex-1 overflow-hidden rounded-lg border border-surface-border bg-ink-950/10 transition-transform duration-300 group-hover/gallery:scale-[1.01]"
                      >
                        <img
                          src={photo.previewUrl || photo.url || photo.dataUrl}
                          alt={photo.caption || 'Site Photo'}
                          className="h-full w-full object-cover"
                        />
                        {photo.activityTag && (
                          <div className="absolute bottom-1 left-1 max-w-[90%] truncate">
                            <span className="inline-flex items-center gap-0.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur">
                              <Tag className="h-2 w-2" />
                              <span className="truncate">{photo.activityTag}</span>
                            </span>
                          </div>
                        )}
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-brand-900/30 opacity-0 group-hover/gallery:opacity-100 transition-opacity">
                          <Eye className="h-5 w-5 text-white drop-shadow" />
                        </div>
                      </div>
                    ))}

                    {/* Badge for extra photos */}
                    {photos.length > 2 && (
                      <div className="absolute right-1 top-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur">
                        +{photos.length - 2} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-surface-border bg-surface-subtle/60 text-ink-400">
                    <span className="text-[11px] italic">No site photos attached</span>
                  </div>
                )}
              </div>

              {/* Remarks Snippet (if available) */}
              {row.remarks && (
                <div className="mt-auto pt-2 border-t border-surface-border/50 text-[11px] text-ink-600 line-clamp-1">
                  <span className="font-semibold text-ink-700">Remarks: </span>
                  {row.remarks}
                </div>
              )}
            </div>

            {/* Card Footer Actions */}
            <div
              className="flex items-center justify-between gap-2 border-t border-surface-border bg-surface-subtle/60 px-4 py-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Submitted By */}
              <div className="flex items-center gap-1.5 text-xs text-ink-600">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                  {(row.submittedBy || 'SE').slice(0, 2).toUpperCase()}
                </div>
                <span className="truncate max-w-[110px] font-medium">
                  {row.submittedBy || 'Site Engineer'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs px-2 flex items-center gap-1 text-ink-700 hover:text-brand-600"
                  onClick={() => onSelectDpr(row)}
                  title="View full report inspection"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Inspect</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2.5 flex items-center gap-1 border-brand-200 text-brand-600 hover:bg-brand-50"
                  isLoading={downloadingId === row.id}
                  onClick={() => onDownloadPdf(row)}
                  title="Download verified DPR PDF"
                >
                  <Download className="h-3 w-3" />
                  <span>PDF</span>
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
