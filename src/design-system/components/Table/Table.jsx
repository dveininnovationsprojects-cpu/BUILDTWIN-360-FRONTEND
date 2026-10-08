import { cn } from '@/design-system/utils/cn';
import { TableSkeletonRows } from '../Skeleton/Skeleton';

/** Generic data table shared by every list screen (projects, activities, DPRs, materials, POs...). */
export function Table({
  columns,
  data = [],
  rowKey,
  isLoading,
  emptyMessage = 'No records found.',
  onRowClick,
}) {
  return (
    <div className="surface-panel overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-surface-border bg-surface-subtle">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2.5 font-medium text-ink-500">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading && <TableSkeletonRows columns={columns} rowCount={6} />}
          {!isLoading && (!data || data.length === 0) && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-ink-500">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!isLoading &&
            Array.isArray(data) &&
            data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-surface-border last:border-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-surface-subtle'
                )}
              >
                {columns.map((col) => {
                  const value = row[col.key];
                  return (
                    <td key={col.key} className={cn('px-4 py-2.5 text-ink-900', col.className)}>
                      {col.render ? col.render(row) : String(value != null && value !== '' ? value : 'N/A')}
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
