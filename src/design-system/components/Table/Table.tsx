import { ReactNode } from 'react';
import { cn } from '@/design-system/utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

/** Generic data table shared by every list screen (projects, activities, DPRs, materials, POs...). */
export function Table<T extends object>({
  columns,
  data,
  rowKey,
  isLoading,
  emptyMessage = 'No records found.',
  onRowClick,
}: TableProps<T>) {
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
          {isLoading && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-ink-500">
                Loading...
              </td>
            </tr>
          )}
          {!isLoading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-ink-500">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!isLoading &&
            data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn('border-b border-surface-border last:border-0', onRowClick && 'cursor-pointer hover:bg-surface-subtle')}
              >
                {columns.map((col) => {
                  const value = (row as Record<string, unknown>)[col.key];

                  return (
                    <td key={col.key} className={cn('px-4 py-2.5 text-ink-900', col.className)}>
                      {col.render ? col.render(row) : String(value ?? '-')}
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
