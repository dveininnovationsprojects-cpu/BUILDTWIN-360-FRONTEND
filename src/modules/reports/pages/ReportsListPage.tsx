import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button, type Column } from '@/design-system';
import { reportsApi } from '../api/reportsApi';
import type { Report } from '../types';

// Executive/project/site dashboards and scheduled/exportable reports (FR-130..135).
export function ReportsListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['reports'], queryFn: () => reportsApi.list() });

  const columns: Column<Report>[] = [
    { key: 'name', header: 'Report' },
    { key: 'period', header: 'Period' },
    { key: 'generatedAt', header: 'Generated' },
    { key: 'format', header: 'Format' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Reports</h1>
          <p className="page-subheading">Executive/project/site dashboards and scheduled/exportable reports (FR-130..135).</p>
        </div>
        <Button size="sm">Add New</Button>
      </div>
      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
