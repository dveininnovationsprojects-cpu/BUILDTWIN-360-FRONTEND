import { create } from 'zustand';
import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

type ToastKind = 'success' | 'warning' | 'error' | 'info';
interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastState {
  toasts: ToastItem[];
  push: (message: string, kind?: ToastKind) => void;
  dismiss: (id: number) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, kind = 'info') =>
    set((s) => ({ toasts: [...s.toasts, { id: Date.now(), message, kind }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const ICONS: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const TONE: Record<ToastKind, string> = {
  success: 'text-status-success',
  warning: 'text-status-warning',
  error: 'text-status-danger',
  info: 'text-status-info',
};

export function ToastViewport() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastRow key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastRow({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const Icon = ICONS[toast.kind];
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className="flex items-center gap-2 rounded-md border border-surface-border bg-surface-base px-4 py-3 shadow-popover">
      <Icon className={cn('h-4 w-4', TONE[toast.kind])} />
      <span className="text-sm text-ink-900">{toast.message}</span>
    </div>
  );
}
