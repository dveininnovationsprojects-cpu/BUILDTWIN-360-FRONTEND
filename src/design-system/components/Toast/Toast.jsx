import React, { useEffect } from 'react';
import { create } from 'zustand';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export const useToastStore = create((set) => ({
  toasts: [],
  push: (message, kind = 'info') =>
    set(() => ({ toasts: [{ id: Date.now() + Math.random(), message, kind }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const TONE_CLASSES = {
  success: {
    icon: 'text-emerald-500 dark:text-emerald-400',
    border: 'border-emerald-500/25 dark:border-emerald-500/30',
    badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  warning: {
    icon: 'text-amber-500 dark:text-amber-400',
    border: 'border-amber-500/25 dark:border-amber-500/30',
    badge: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  },
  error: {
    icon: 'text-rose-500 dark:text-rose-400',
    border: 'border-rose-500/25 dark:border-rose-500/30',
    badge: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
  },
  info: {
    icon: 'text-blue-500 dark:text-blue-400',
    border: 'border-blue-500/25 dark:border-blue-500/30',
    badge: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  },
};

export function ToastViewport() {
  const { toasts, dismiss } = useToastStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2.5 pointer-events-none w-full max-w-md px-4"
    >
      {toasts.map((t) => (
        <ToastRow key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastRow({ toast, onDismiss }) {
  const Icon = ICONS[toast.kind] || Info;
  const tone = TONE_CLASSES[toast.kind] || TONE_CLASSES.info;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full items-center justify-between gap-3',
        'rounded-xl border bg-white/95 px-4 py-3 shadow-lg shadow-black/5 backdrop-blur-md',
        'dark:bg-surface-card/95 dark:border-surface-border',
        'transition-all duration-200 animate-in fade-in slide-in-from-top-3',
        tone.border
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className={cn('h-5 w-5 shrink-0', tone.icon)} />
        <span className="text-sm font-medium text-ink-900 dark:text-white truncate sm:whitespace-normal">
          {toast.message}
        </span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-400 hover:text-ink-700 hover:bg-surface-subtle dark:hover:text-ink-200 dark:hover:bg-surface-border transition-colors focus:outline-none"
        title="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
