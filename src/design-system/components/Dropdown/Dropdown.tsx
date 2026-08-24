import { ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/design-system/utils/cn';

export interface DropdownItem {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}

export function Dropdown({ trigger, items }: { trigger: ReactNode; items: DropdownItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div className="absolute right-0 z-40 mt-1 w-48 rounded-md border border-surface-border bg-surface-base py-1 shadow-popover">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                item.onSelect();
                setOpen(false);
              }}
              className={cn(
                'block w-full px-3 py-2 text-left text-sm hover:bg-surface-subtle',
                item.destructive ? 'text-status-danger' : 'text-ink-900',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
