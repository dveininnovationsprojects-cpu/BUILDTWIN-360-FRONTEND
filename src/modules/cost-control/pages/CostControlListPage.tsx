import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button, type Column } from '@/design-system';
import { costControlApi } from '../api/costControlApi';
import type { Budget } from '../types';

// Cost heads, budget revisions, committed/actual cost, PV/EV/AC/SPI/CPI (FR-070..075).
export function CostControlListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['cost-control'], queryFn: () => costControlApi.list() });

  const columns: Column<Budget>[] = [
    { key: 'costCode', header: 'Cost Code' },
    { key: 'baselineAmount', header: 'Baseline' },
    { key: 'actualAmount', header: 'Actual' },
    { key: 'variance', header: 'Variance' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Cost & Budget</h1>
          <p className="page-subheading">Cost heads, budget revisions, committed/actual cost, PV/EV/AC/SPI/CPI (FR-070..075).</p>
        </div>
        <Button size="sm">Add New</Button>
      </div>
      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
