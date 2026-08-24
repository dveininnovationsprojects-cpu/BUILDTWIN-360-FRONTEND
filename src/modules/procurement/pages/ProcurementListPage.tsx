import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button, type Column } from '@/design-system';
import { procurementApi } from '../api/procurementApi';
import type { PurchaseOrder } from '../types';

// Supplier profile, PO tracking, delivery status and supplier performance (FR-060..063).
export function ProcurementListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['procurement'], queryFn: () => procurementApi.list() });

  const columns: Column<PurchaseOrder>[] = [
    { key: 'poNumber', header: 'PO Number' },
    { key: 'supplier', header: 'Supplier' },
    { key: 'deliveryDate', header: 'Delivery Date' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Procurement & Suppliers</h1>
          <p className="page-subheading">Supplier profile, PO tracking, delivery status and supplier performance (FR-060..063).</p>
        </div>
        <Button size="sm">Add New</Button>
      </div>
      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
