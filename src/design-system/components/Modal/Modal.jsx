import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof onClose === 'function') {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return createPortal(
    <div
      className="liquid-glass-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose(e);
        }
      }}
    >
      <div
        className={cn(
          'liquid-glass relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-surface-card border border-surface-border shadow-2xl z-10',
          widths[size] || widths.md
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-surface-border/60 bg-surface-subtle/50 px-5 py-4">
          <div className="min-w-0 flex-1 pr-4">
            {typeof title === 'string' ? (
              <h3 className="text-lg font-bold text-ink-900 tracking-tight truncate">{title}</h3>
            ) : (
              title
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-surface-hover hover:text-ink-900 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            aria-label="Close"
            title="Close"
          >
            <X className="h-5 w-5 pointer-events-none" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-ink-700">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-surface-border/60 bg-surface-subtle/50 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
