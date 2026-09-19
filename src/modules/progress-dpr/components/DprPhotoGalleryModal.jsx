import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Tag, MapPin, Calendar, HardDrive, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/design-system';

export function DprPhotoGalleryModal({ open, onClose, photos = [], initialIndex = 0, title = 'Site Progress Photos' }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (open) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, photos.length - 1)));
      setZoomLevel(1);
      setRotation(0);
    }
  }, [open, initialIndex, photos.length]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, photos.length, currentIndex]);

  if (!open || !photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setZoomLevel(1);
    setRotation(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setZoomLevel(1);
    setRotation(0);
  };

  const handleDownload = (photo) => {
    const link = document.createElement('a');
    link.href = photo.previewUrl || photo.url || photo.dataUrl;
    link.download = photo.name || `dpr-photo-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink-900/90 backdrop-blur-md text-white transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-white truncate max-w-md">
            {title}
          </h3>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/80">
            {currentIndex + 1} of {photos.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom & Rotate Tools */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Rotate"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDownload(currentPhoto)}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Download photo"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors ml-2"
            title="Close viewer (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white/80 backdrop-blur hover:bg-black/80 hover:text-white transition-all shadow-lg"
              title="Previous photo (Left arrow)"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white/80 backdrop-blur hover:bg-black/80 hover:text-white transition-all shadow-lg"
              title="Next photo (Right arrow)"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Photo Container */}
        <div className="relative flex h-full w-full items-center justify-center">
          <img
            src={currentPhoto.previewUrl || currentPhoto.url || currentPhoto.dataUrl}
            alt={currentPhoto.caption || currentPhoto.activityTag || currentPhoto.name || 'DPR Photo'}
            className="max-h-full max-w-full rounded-lg object-contain transition-transform duration-200 shadow-2xl"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              cursor: zoomLevel > 1 ? 'grab' : 'default',
            }}
          />
        </div>
      </div>

      {/* Bottom Info & Tagging Bar */}
      <div className="border-t border-white/10 bg-ink-900/95 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Metadata & Tag Info */}
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {currentPhoto.activityTag ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-500/20 px-2.5 py-1 text-xs font-semibold text-brand-300 border border-brand-500/30">
                  <Tag className="h-3.5 w-3.5 text-brand-400" />
                  {currentPhoto.activityTag}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/60">
                  <Tag className="h-3 w-3" />
                  General Progress
                </span>
              )}

              {currentPhoto.locationTag && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300 border border-amber-500/30">
                  <MapPin className="h-3 w-3 text-amber-400" />
                  {currentPhoto.locationTag}
                </span>
              )}

              {currentPhoto.size && (
                <span className="inline-flex items-center gap-1 text-xs text-white/50">
                  <HardDrive className="h-3 w-3" />
                  {formatFileSize(currentPhoto.size)}
                </span>
              )}

              {currentPhoto.uploadedAt && (
                <span className="inline-flex items-center gap-1 text-xs text-white/50">
                  <Calendar className="h-3 w-3" />
                  {new Date(currentPhoto.uploadedAt).toLocaleString()}
                </span>
              )}
            </div>

            {currentPhoto.caption && (
              <p className="text-sm text-white/90 font-medium">
                {currentPhoto.caption}
              </p>
            )}
            {currentPhoto.name && !currentPhoto.caption && (
              <p className="text-xs text-white/60 truncate">
                {currentPhoto.name}
              </p>
            )}
          </div>

          {/* Thumbnails list */}
          {photos.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
              {photos.map((photo, idx) => (
                <button
                  key={photo.id || idx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setZoomLevel(1);
                    setRotation(0);
                  }}
                  className={`relative h-12 w-12 shrink-0 overflow-hidden rounded border-2 transition-all ${
                    idx === currentIndex
                      ? 'border-brand-400 ring-2 ring-brand-400/40 opacity-100 scale-105'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img
                    src={photo.previewUrl || photo.url || photo.dataUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
