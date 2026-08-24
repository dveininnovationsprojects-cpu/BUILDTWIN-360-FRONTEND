import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button, type Column } from '@/design-system';
import { equipmentApi } from '../api/equipmentApi';
import type { Equipment } from '../types';

// Equipment/asset register, site allocation, downtime and usage hours (FR-100..102).
export function EquipmentListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['equipment'], queryFn: () => equipmentApi.list() });

  const columns: Column<Equipment>[] = [
    { key: 'assetCode', header: 'Asset Code' },
    { key: 'type', header: 'Type' },
    { key: 'site', header: 'Allocated Site' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Equipment</h1>
          <p className="page-subheading">Equipment/asset register, site allocation, downtime and usage hours (FR-100..102).</p>
        </div>
        <Button size="sm">Add New</Button>
      </div>
      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
