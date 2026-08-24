import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button, type Column } from '@/design-system';
import { wbsScheduleApi } from '../api/wbsScheduleApi';
import type { Activity } from '../types';

// WBS hierarchy, baseline schedule, dependencies and 7/14-day look-ahead (FR-020..025).
export function WbsScheduleListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['wbs-schedule'], queryFn: () => wbsScheduleApi.list() });

  const columns: Column<Activity>[] = [
    { key: 'wbsCode', header: 'WBS Code' },
    { key: 'name', header: 'Activity' },
    { key: 'discipline', header: 'Discipline' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">WBS & Schedule</h1>
          <p className="page-subheading">WBS hierarchy, baseline schedule, dependencies and 7/14-day look-ahead (FR-020..025).</p>
        </div>
        <Button size="sm">Add New</Button>
      </div>
      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
