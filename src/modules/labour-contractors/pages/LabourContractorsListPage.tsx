import { useQuery } from '@tanstack/react-query';
import { Table, Button, type Column } from '@/design-system';
import { labourContractorsApi } from '../api/labourContractorsApi';
import type { LabourDaily } from '../types';

// Contractor master, daily headcount/allocation and productivity analytics (FR-040..045).
export function LabourContractorsListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['labour-contractors'], queryFn: () => labourContractorsApi.list() });

  const columns: Column<LabourDaily>[] = [
    { key: 'date', header: 'Date' },
    { key: 'contractor', header: 'Contractor' },
    { key: 'trade', header: 'Trade' },
    { key: 'headcount', header: 'Headcount' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Labour & Contractors</h1>
          <p className="page-subheading">Contractor master, daily headcount/allocation and productivity analytics (FR-040..045).</p>
        </div>
        <Button size="sm">Add New</Button>
      </div>
      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
