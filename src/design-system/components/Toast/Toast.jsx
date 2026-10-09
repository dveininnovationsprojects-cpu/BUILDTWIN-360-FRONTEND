import React, { useEffect } from 'react';
import { create } from 'zustand';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export const useToastStore = create((set) => ({
  toasts: [],
  push: (message, kind = 'info') =>
    set((s) => ({ toasts: [...s.toasts, { id: Date.now() + Math.random(), message, kind }] })),
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
      className="fixed top-2 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-1.5 pointer-events-none w-max max-w-[92vw] px-3"
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
        'pointer-events-auto flex w-fit max-w-[90vw] items-center justify-between gap-2.5',
        'rounded-full border bg-white/95 px-3 py-1 shadow-md shadow-black/10 backdrop-blur-md',
        'dark:bg-surface-card/95 dark:border-surface-border',
        'transition-all duration-200 animate-in fade-in slide-in-from-top-2',
        tone.border
      )}
    >
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Icon className={cn('h-3.5 w-3.5 shrink-0', tone.icon)} />
        <span className="text-xs font-medium text-ink-900 dark:text-white whitespace-nowrap">
          {toast.message}
        </span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-ink-400 hover:text-ink-700 hover:bg-surface-subtle transition-colors focus:outline-none"
        title="Dismiss notification"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
