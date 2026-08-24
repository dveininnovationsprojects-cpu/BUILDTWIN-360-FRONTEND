import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button, type Column } from '@/design-system';
import { progressDprApi } from '../api/progressDprApi';
import type { DprHeader } from '../types';

// Daily Progress Report: draft/submit/approve, quantities, photos, remarks (FR-030..035).
export function ProgressDprListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['progress-dpr'], queryFn: () => progressDprApi.list() });

  const columns: Column<DprHeader>[] = [
    { key: 'reportDate', header: 'Date' },
    { key: 'siteName', header: 'Site' },
    { key: 'submittedBy', header: 'Submitted By' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Daily Progress (DPR)</h1>
          <p className="page-subheading">Daily Progress Report: draft/submit/approve, quantities, photos, remarks (FR-030..035).</p>
        </div>
        <Button size="sm">Add New</Button>
      </div>
      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
