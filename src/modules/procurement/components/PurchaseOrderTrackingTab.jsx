import { useMemo, useState } from 'react';
import { Button, StatCard, StatusPill, Table } from '@/design-system';
import { AlertTriangle, CalendarClock, CheckCircle2, PackageCheck, Truck } from 'lucide-react';

export function PurchaseOrderTrackingTab({ purchaseOrders = [], suppliers = [], isLoading, canManage, onRecordGrn }) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const metrics = useMemo(() => {
    const today = new Date();
    const open = purchaseOrders.filter((po) => !['DELIVERED', 'CANCELLED'].includes(po.status)).length;
    const delivered = purchaseOrders.filter((po) => po.status === 'DELIVERED').length;
    const overdue = purchaseOrders.filter((po) => po.deliveryDate && new Date(po.deliveryDate) < today && !['DELIVERED', 'CANCELLED'].includes(po.status)).length;
    const value = purchaseOrders.reduce((total, po) => total + Number(po.amount || 0), 0);
    return { open, delivered, overdue, value };
  }, [purchaseOrders]);

  const rows = useMemo(() => statusFilter === 'ALL' ? purchaseOrders : purchaseOrders.filter((po) => po.status === statusFilter), [purchaseOrders, statusFilter]);

  const columns = [
    { key: 'poNumber', header: 'PO Number', render: (row) => <span className="font-mono text-xs font-semibold text-brand-900">{row.poNumber || `PO-${row.id}`}</span> },
    { key: 'supplier', header: 'Supplier', render: (row) => <span className="font-medium text-ink-900">{row.supplier || suppliers.find((supplier) => String(supplier.id) === String(row.supplierId))?.name || 'Vendor'}</span> },
    { key: 'materialName', header: 'Material', render: (row) => <span className="text-xs text-ink-700">{row.materialName || '—'}</span> },
    { key: 'amount', header: 'Order Value', render: (row) => <span className="text-xs font-semibold">{row.amount ? `₹${Number(row.amount).toLocaleString('en-IN')}` : '—'}</span> },
    { key: 'deliveryDate', header: 'Expected Delivery', render: (row) => <span className="text-xs text-ink-700">{row.deliveryDate || '—'}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status === 'DELIVERED' ? 'SUCCESS' : row.status === 'CANCELLED' ? 'DANGER' : 'WARNING'} label={row.status || 'ISSUED'} /> },
    { key: 'actions', header: 'Actions', render: (row) => canManage && !['DELIVERED', 'CANCELLED'].includes(row.status) && <Button size="xs" variant="outline" onClick={() => onRecordGrn(row)}><PackageCheck className="mr-1 h-3.5 w-3.5" /> Receive</Button> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open Orders" value={metrics.open} icon={<Truck className="h-4 w-4" />} />
        <StatCard label="Delivered" value={metrics.delivered} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Overdue" value={metrics.overdue} icon={<AlertTriangle className="h-4 w-4" />} />
        <StatCard label="Committed Value" value={`₹${metrics.value.toLocaleString('en-IN')}`} icon={<CalendarClock className="h-4 w-4" />} />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-subtle p-3">
        <div><p className="text-sm font-semibold text-ink-900">Purchase Order Tracking</p><p className="text-xs text-ink-500">Monitor supplier commitments and convert delivered orders into GRNs.</p></div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 rounded border border-surface-border bg-surface-base px-2.5 text-xs text-ink-900">
          <option value="ALL">All statuses</option><option value="ISSUED">Issued</option><option value="IN_TRANSIT">In transit</option><option value="DELIVERED">Delivered</option><option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <Table columns={columns} data={rows} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
