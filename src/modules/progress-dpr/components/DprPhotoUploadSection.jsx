import { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Camera,
  Tag,
  MapPin,
  FileImage,
  AlertCircle,
  Eye,
  Check,
  Sparkles,
  Layers,
  Info,
} from 'lucide-react';
import { Button, Input, Select } from '@/design-system';
import { DprPhotoGalleryModal } from './DprPhotoGalleryModal';

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB limit
const MAX_FILE_SIZE_MB = 100;

export const STANDARD_ACTIVITY_TAGS = [
  'Concrete Placement & Curing',
  'Rebar & Reinforcement',
  'Formwork & Shuttering',
  'Footing & Excavation',
  'Brickwork & Masonry',
  'Plastering & Surface Finishing',
  'Structural Steel Work',
  'MEP & Electrical Rough-In',
  'Plumbing & Drainage',
  'Quality & Snag / NCR Inspection',
  'Safety & Housekeeping',
  'Material Inward & Storage',
  'General Site Progress',
];

export function DprPhotoUploadSection({
  photos = [],
  onChange,
  disabled = false,
  availableActivities = [],
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewInitialIndex, setPreviewInitialIndex] = useState(0);
  const [batchTag, setBatchTag] = useState('');
  const [customTagInput, setCustomTagInput] = useState('');
  const [showCustomTagModal, setShowCustomTagModal] = useState(false);
  const [targetPhotoIdForCustom, setTargetPhotoIdForCustom] = useState(null);

  // Combine dynamic work items from DPR quantities with standard activities
  const allTagOptions = Array.from(
    new Set([
      ...availableActivities.filter((a) => a && a.trim().length > 0),
      ...STANDARD_ACTIVITY_TAGS,
    ])
  );

  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);
    setIsProcessing(true);

    const filesArray = Array.from(fileList);
    const oversized = filesArray.filter((f) => f.size > MAX_FILE_SIZE_BYTES);

    if (oversized.length > 0) {
      const names = oversized.map((f) => `${f.name} (${formatBytes(f.size)})`).join(', ');
      setErrorMessage(
        `The following file(s) exceed the 100 MB limit: ${names}. Maximum allowed file size is 100 MB.`
      );
      setIsProcessing(false);
      return;
    }

    try {
      const readPromises = filesArray.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            // Default activity tag to first available activity from DPR if present, else standard
            const defaultActivity = availableActivities[0] || 'General Site Progress';

            resolve({
              id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              name: file.name,
              size: file.size,
              type: file.type || 'image/jpeg',
              previewUrl: e.target.result,
              dataUrl: e.target.result,
              activityTag: defaultActivity,
              caption: '',
              locationTag: '',
              uploadedAt: new Date().toISOString(),
            });
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
      });

      const processedPhotos = (await Promise.all(readPromises)).filter(Boolean);
      onChange([...photos, ...processedPhotos]);
    } catch (err) {
      console.error('Photo reading error:', err);
      setErrorMessage('Failed to process one or more images. Please try again.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const updatePhoto = (photoId, updates) => {
    onChange(
      photos.map((p) => (p.id === photoId ? { ...p, ...updates } : p))
    );
  };

  const removePhoto = (photoId, index) => {
    onChange(
      photos.filter((p, i) => {
        if (photoId && p.id) {
          return String(p.id) !== String(photoId);
        }
        return i !== index;
      })
    );
  };

  const applyBatchTag = () => {
    if (!batchTag) return;
    onChange(photos.map((p) => ({ ...p, activityTag: batchTag })));
  };

  const openLightbox = (index) => {
    setPreviewInitialIndex(index);
    setPreviewModalOpen(true);
  };

  const totalSize = photos.reduce((acc, p) => acc + (p.size || 0), 0);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-surface-border bg-surface-card p-4.5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink-900 flex items-center gap-2">
              Photo Upload & Activity Tagging
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                100 MB Limit
              </span>
            </h4>
            <p className="text-xs text-ink-500">
              Attach site progress photos and tag each image to a specific work activity or quantity item.
            </p>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-500 font-medium">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'} ({formatBytes(totalSize)})
            </span>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-lg border border-status-danger/30 bg-status-dangerBg p-3 text-xs text-status-danger">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Upload Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-status-danger hover:opacity-80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
          isDragging
            ? 'border-brand-500 bg-brand-50/50 scale-[0.99] shadow-inner'
            : 'border-surface-border bg-surface-subtle hover:border-brand-400 hover:bg-brand-50/20'
        } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={disabled}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-surface-base shadow-sm border border-surface-border text-brand-600 group-hover:scale-110 transition-transform">
          {isProcessing ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>

        <p className="text-sm font-medium text-ink-900">
          <span className="text-brand-600 underline underline-offset-2">Click to browse site photos</span> or drag & drop here
        </p>
        <p className="mt-1 text-xs text-ink-500">
          High-res JPG, PNG, WEBP, HEIC supported &bull; <strong className="text-ink-700 font-semibold">Strict 100 MB per file limit</strong>
        </p>
      </div>

      {/* Batch Tagging Bar (when multiple photos exist) */}
      {photos.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-subtle p-2.5 border border-surface-border text-xs">
          <div className="flex items-center gap-1.5 text-ink-700 font-medium">
            <Layers className="h-4 w-4 text-brand-600" />
            <span>Batch Tag All Photos:</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={batchTag}
              onChange={(e) => setBatchTag(e.target.value)}
              className="rounded-md border border-surface-border bg-surface-base px-2.5 py-1 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="">Select activity to tag all...</option>
              {allTagOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={applyBatchTag}
              disabled={!batchTag || disabled}
              className="h-7 text-xs px-2.5"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Apply to All ({photos.length})
            </Button>
          </div>
        </div>
      )}

      {/* Uploaded Photos Grid with Activity Tagging */}
      {photos.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Uploaded Site Photos ({photos.length})
            </span>
            <span className="text-xs text-ink-400">
              Click photo to enlarge &bull; Tag each photo to site activity
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id || index}
                className="group relative flex flex-col rounded-xl border border-surface-border bg-surface-base p-3 shadow-xs hover:border-brand-300 hover:shadow-sm transition-all"
              >
                {/* Photo Thumbnail Container */}
                <div
                  className="relative h-36 w-full cursor-pointer overflow-hidden rounded-lg bg-ink-950/5 group-hover:opacity-95"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={photo.previewUrl || photo.url || photo.dataUrl}
                    alt={photo.caption || photo.name || 'DPR photo'}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Click to Enlarge Hover Icon */}
                  <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink-900 shadow">
                      <Eye className="h-3.5 w-3.5 text-brand-600" />
                      View Large
                    </span>
                  </div>

                  {/* Top Overlay Badge for Activity Tag */}
                  <div className="absolute left-2 top-2 z-20 max-w-[80%] truncate pointer-events-none">
                    <span className="inline-flex items-center gap-1 rounded-md bg-brand-900/80 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur shadow-sm">
                      <Tag className="h-3 w-3 text-brand-300 shrink-0" />
                      <span className="truncate">{photo.activityTag || 'Untagged'}</span>
                    </span>
                  </div>

                  {/* Remove Photo Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removePhoto(photo.id, index);
                    }}
                    disabled={disabled}
                    className="absolute right-2 top-2 z-30 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 hover:scale-110 active:scale-95 transition-all"
                    title="Remove photo"
                    aria-label="Remove photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  {/* File Size Badge Bottom Right */}
                  <div className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                    {formatBytes(photo.size)}
                  </div>
                </div>

                {/* Tagging & Caption Controls */}
                <div className="mt-3 flex flex-col gap-2">
                  {/* Activity Tag Selector */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-600 flex items-center gap-1">
                      <Tag className="h-3 w-3 text-brand-500" />
                      Activity Tag *
                    </label>
                    <select
                      value={photo.activityTag || ''}
                      onChange={(e) => updatePhoto(photo.id, { activityTag: e.target.value })}
                      disabled={disabled}
                      className="w-full rounded-md border border-surface-border bg-surface-subtle px-2 py-1.5 text-xs text-ink-900 focus:border-brand-500 focus:bg-surface-base focus:outline-none"
                    >
                      <optgroup label="DPR Work Items">
                        {availableActivities.filter(Boolean).map((act, i) => (
                          <option key={`dpr-${i}`} value={act}>
                            📌 {act}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Standard Site Activities">
                        {STANDARD_ACTIVITY_TAGS.map((act) => (
                          <option key={act} value={act}>
                            {act}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Caption & Location Input */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Caption / Notes..."
                        value={photo.caption || ''}
                        onChange={(e) => updatePhoto(photo.id, { caption: e.target.value })}
                        disabled={disabled}
                        className="w-full rounded-md border border-surface-border bg-surface-subtle px-2 py-1 text-xs text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-surface-base focus:outline-none"
                        title="Photo caption"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Area / Grid (e.g. Lvl 2)"
                        value={photo.locationTag || ''}
                        onChange={(e) => updatePhoto(photo.id, { locationTag: e.target.value })}
                        disabled={disabled}
                        className="w-full rounded-md border border-surface-border bg-surface-subtle px-2 py-1 text-xs text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-surface-base focus:outline-none"
                        title="Location / Grid Tag"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Viewer */}
      <DprPhotoGalleryModal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        photos={photos}
        initialIndex={previewInitialIndex}
        title="DPR Site Photo Evidence"
      />
    </div>
  );
}
