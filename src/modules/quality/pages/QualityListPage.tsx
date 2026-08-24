import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button, type Column } from '@/design-system';
import { qualityApi } from '../api/qualityApi';
import type { QualityIssue } from '../types';

// Inspection checklists, NCR/snag workflow, evidence and closure (FR-080..084).
export function QualityListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['quality'], queryFn: () => qualityApi.list() });

  const columns: Column<QualityIssue>[] = [
    { key: 'category', header: 'Category' },
    { key: 'severity', header: 'Severity', render: (row) => <StatusPill status={row.severity} /> },
    { key: 'responsible', header: 'Responsible' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Quality & NCR</h1>
          <p className="page-subheading">Inspection checklists, NCR/snag workflow, evidence and closure (FR-080..084).</p>
        </div>
        <Button size="sm">Add New</Button>
      </div>
      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
