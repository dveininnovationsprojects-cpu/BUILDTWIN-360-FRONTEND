import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button, type Column } from '@/design-system';
import { materialsInventoryApi } from '../api/materialsInventoryApi';
import type { Material } from '../types';

// Material master, requests, GRN, stock ledger, issue/consumption, low-stock alerts (FR-050..057).
export function MaterialsInventoryListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['materials-inventory'], queryFn: () => materialsInventoryApi.list() });

  const columns: Column<Material>[] = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Material' },
    { key: 'currentStock', header: 'Current Stock' },
    { key: 'reorderLevel', header: 'Reorder Level' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Materials & Inventory</h1>
          <p className="page-subheading">Material master, requests, GRN, stock ledger, issue/consumption, low-stock alerts (FR-050..057).</p>
        </div>
        <Button size="sm">Add New</Button>
      </div>
      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
