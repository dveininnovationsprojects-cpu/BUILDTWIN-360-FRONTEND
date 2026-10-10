import React from 'react';

/**
 * StatusGlowDot
 * Live radar and beacon indicators for activity statuses
 */
export function StatusGlowDot({ status = 'PLANNED', className = '' }) {
  switch (status?.toUpperCase()) {
    case 'IN_PROGRESS':
      return (
        <span
          className={`relative flex h-2.5 w-2.5 shrink-0 ${className}`}
          title="In Progress (Active Work Site)"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
        </span>
      );

    case 'DELAYED':
      return (
        <span
          className={`relative flex h-2.5 w-2.5 shrink-0 ${className}`}
          title="Delayed Schedule Conflict"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
        </span>
      );

    case 'COMPLETED':
      return (
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] shrink-0 ${className}`}
          title="Completed"
        />
      );

    case 'ON_HOLD':
      return (
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)] shrink-0 ${className}`}
          title="On Hold"
        />
      );

    case 'PLANNED':
    default:
      return (
        <span
          className={`relative inline-flex rounded-full h-2 w-2 bg-slate-400 dark:bg-slate-500 shrink-0 ${className}`}
          title="Planned"
        />
      );
  }
}
