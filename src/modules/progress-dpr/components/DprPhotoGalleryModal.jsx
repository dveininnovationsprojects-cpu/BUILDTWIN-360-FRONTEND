import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Tag,
  MapPin,
  Calendar,
  HardDrive,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Camera,
  AlertCircle,
} from 'lucide-react';

export function DprPhotoGalleryModal({
  open,
  onClose,
  photos = [],
  initialIndex = 0,
  title = 'Site Progress Photos',
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [imageError, setImageError] = useState(false);

  // Sync index when modal opens or photos change
  useEffect(() => {
    if (open) {
      const validIndex = Math.min(Math.max(0, initialIndex), Math.max(0, photos.length - 1));
      setCurrentIndex(validIndex);
      setZoomLevel(1);
      setRotation(0);
      setImageError(false);
    }
  }, [open, initialIndex, photos.length]);

  // Reset zoom & rotation on photo slide change
  useEffect(() => {
    setZoomLevel(1);
    setRotation(0);
    setImageError(false);
  }, [currentIndex]);

  // Lock body scroll when gallery is open
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Handle keyboard shortcuts with capture: true to take precedence over underlying modal Escape listener
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        onClose();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
        return;
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoomLevel((z) => Math.min(z + 0.25, 3));
        return;
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoomLevel((z) => Math.max(z - 0.25, 0.5));
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [open, photos.length]);

  // Sync fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!open || !photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];
  const photoUrl =
    currentPhoto?.previewUrl ||
    currentPhoto?.url ||
    currentPhoto?.dataUrl ||
    currentPhoto?.src ||
    '';

  const handleNext = () => {
    if (photos.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    if (photos.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      // Fallback: visual fullscreen overlay is already 100vw/100vh
      console.warn('Native fullscreen not available:', err);
    }
  };

  const handleDownload = (photo) => {
    if (!photoUrl) return;
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = photo?.name || `dpr-photo-${currentIndex + 1}.jpg`;
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

  const galleryModalContent = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-slate-950/95 backdrop-blur-lg text-white select-none transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Top Header Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
            <Camera className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-white truncate max-w-xs sm:max-w-md">
              {title}
            </h3>
            <p className="text-[11px] text-white/60">
              Photo {currentIndex + 1} of {photos.length}
            </p>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/80 shrink-0">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom In */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Zoom in (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Zoom out (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          {/* Rotate */}
          <button
            type="button"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Rotate (90°)"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={() => handleDownload(currentPhoto)}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Download full resolution photo"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/70 hover:bg-rose-500/20 hover:text-rose-300 transition-colors ml-1 sm:ml-2"
            title="Close gallery (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Photo Viewing Area */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden p-4 cursor-default"
        onClick={(e) => {
          // If clicking the dark backdrop itself, close the gallery
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Previous Arrow */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white/90 backdrop-blur-md hover:bg-black/90 hover:text-white hover:scale-110 transition-all shadow-2xl border border-white/10"
            title="Previous photo (Left arrow)"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Next Arrow */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white/90 backdrop-blur-md hover:bg-black/90 hover:text-white hover:scale-110 transition-all shadow-2xl border border-white/10"
            title="Next photo (Right arrow)"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Photo Container */}
        <div
          className="relative flex h-full w-full items-center justify-center pointer-events-none"
        >
          {imageError || !photoUrl ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-white/60 pointer-events-auto bg-white/5 rounded-2xl border border-white/10 max-w-md">
              <AlertCircle className="h-12 w-12 mb-3 text-amber-400 opacity-80" />
              <h4 className="text-base font-semibold text-white mb-1">Photo Preview Unavailable</h4>
              <p className="text-xs text-white/60">
                {currentPhoto?.name || 'The requested site photo could not be rendered.'}
              </p>
            </div>
          ) : (
            <img
              src={photoUrl}
              alt={currentPhoto?.caption || currentPhoto?.activityTag || currentPhoto?.name || 'Site Progress Photo'}
              onError={() => setImageError(true)}
              className="max-h-[82vh] max-w-[92vw] rounded-xl object-contain transition-transform duration-200 shadow-2xl pointer-events-auto"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                cursor: zoomLevel > 1 ? 'grab' : 'default',
              }}
            />
          )}
        </div>
      </div>

      {/* Bottom Info & Tagging Bar */}
      <div className="shrink-0 border-t border-white/10 bg-slate-900/90 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Metadata & Tag Info */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {currentPhoto?.activityTag ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-500/20 px-2.5 py-0.5 text-xs font-semibold text-brand-300 border border-brand-500/30">
                  <Tag className="h-3.5 w-3.5 text-brand-400" />
                  {currentPhoto.activityTag}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/60">
                  <Tag className="h-3 w-3" />
                  General Progress
                </span>
              )}

              {currentPhoto?.locationTag && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300 border border-amber-500/30">
                  <MapPin className="h-3 w-3 text-amber-400" />
                  {currentPhoto.locationTag}
                </span>
              )}

              {currentPhoto?.size && (
                <span className="inline-flex items-center gap-1 text-xs text-white/50">
                  <HardDrive className="h-3 w-3" />
                  {formatFileSize(currentPhoto.size)}
                </span>
              )}

              {currentPhoto?.uploadedAt && (
                <span className="inline-flex items-center gap-1 text-xs text-white/50">
                  <Calendar className="h-3 w-3" />
                  {new Date(currentPhoto.uploadedAt).toLocaleString()}
                </span>
              )}
            </div>

            {currentPhoto?.caption ? (
              <p className="text-sm text-white/95 font-medium truncate max-w-2xl">
                {currentPhoto.caption}
              </p>
            ) : currentPhoto?.name ? (
              <p className="text-xs text-white/60 font-mono truncate max-w-2xl">
                {currentPhoto.name}
              </p>
            ) : null}
          </div>

          {/* Thumbnails strip */}
          {photos.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-hidden shrink-0 max-w-xs sm:max-w-md">
              {photos.map((photo, idx) => {
                const thumbUrl = photo?.previewUrl || photo?.url || photo?.dataUrl || photo?.src || '';
                return (
                  <button
                    key={photo?.id || idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      idx === currentIndex
                        ? 'border-brand-400 ring-2 ring-brand-400/50 opacity-100 scale-105 shadow-md'
                        : 'border-white/10 opacity-50 hover:opacity-90'
                    }`}
                  >
                    {thumbUrl ? (
                      <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/10 text-white/40">
                        <Camera className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(galleryModalContent, document.body);
}
