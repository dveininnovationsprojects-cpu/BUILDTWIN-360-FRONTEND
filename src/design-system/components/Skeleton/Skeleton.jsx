import { cn } from '@/design-system/utils/cn';

/**
 * Primitive shimmering skeleton placeholder.
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('shimmer-skeleton rounded bg-surface-muted', className)}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Multi-line paragraph skeleton with randomized natural line widths.
 */
export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-3.5',
            i === lines - 1 ? 'w-3/5' : i % 2 === 0 ? 'w-full' : 'w-4/5'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Shimmering skeleton rows for Table component.
 * Produces clean, realistic previews of tabular data to prevent layout shift.
 */
export function TableSkeletonRows({ columns, rowCount = 5 }) {
  // Pre-configured widths for columns to look natural
  const widths = ['w-16', 'w-32', 'w-24', 'w-40', 'w-20', 'w-28', 'w-12'];

  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <tr
          key={`skeleton-row-${rowIndex}`}
          className="border-b border-surface-border animate-pulse/20"
        >
          {columns.map((col, colIndex) => {
            const widthClass = widths[(rowIndex + colIndex) % widths.length];
            return (
              <td key={`skeleton-cell-${colIndex}`} className="px-4 py-3">
                <Skeleton className={cn('h-4', widthClass)} />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

/**
 * Shimmering Card skeleton for grid views (e.g. DPR cards, Audit cards).
 */
export function CardSkeleton({ className }) {
  return (
    <div
      className={cn(
        'surface-panel rounded-xl p-4 flex flex-col gap-3',
        className
      )}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3.5 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
      <div className="mt-2 pt-3 border-t border-surface-border flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded" />
        <Skeleton className="h-6 w-16 rounded" />
      </div>
    </div>
  );
}
