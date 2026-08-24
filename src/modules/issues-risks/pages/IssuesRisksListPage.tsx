import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button, type Column } from '@/design-system';
import { issuesRisksApi } from '../api/issuesRisksApi';
import type { Issue } from '../types';

// Issue/blocker tracking, escalation and project risk register (FR-090..093).
export function IssuesRisksListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['issues-risks'], queryFn: () => issuesRisksApi.list() });

  const columns: Column<Issue>[] = [
    { key: 'title', header: 'Issue' },
    { key: 'priority', header: 'Priority', render: (row) => <StatusPill status={row.priority} /> },
    { key: 'owner', header: 'Owner' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Issues & Risks</h1>
          <p className="page-subheading">Issue/blocker tracking, escalation and project risk register (FR-090..093).</p>
        </div>
        <Button size="sm">Add New</Button>
      </div>
      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
