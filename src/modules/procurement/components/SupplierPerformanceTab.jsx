import { useMemo, useState } from 'react';
import { Button, EmptyState, StatCard, StatusPill, Table } from '@/design-system';
import { Award, CheckCircle2, Clock3, Search, TrendingUp, Truck } from 'lucide-react';

function asDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function supplierPerformance(supplier, purchaseOrders, grns) {
  const supplierOrders = purchaseOrders.filter((po) => String(po.supplierId) === String(supplier.id) || String(po.supplier) === String(supplier.name));
  const orderIds = new Set(supplierOrders.map((po) => String(po.id)));
  const supplierGrns = grns.filter((grn) => orderIds.has(String(grn.poId)) || String(grn.supplier) === String(supplier.name));
  const deliveredOrders = supplierOrders.filter((po) => po.status === 'DELIVERED' || supplierGrns.some((grn) => String(grn.poId) === String(po.id)));
  const onTimeOrders = deliveredOrders.filter((po) => {
    const deliveryDate = asDate(po.deliveryDate);
    const matchingGrn = supplierGrns
      .filter((grn) => String(grn.poId) === String(po.id))
      .sort((a, b) => (asDate(a.createdAt)?.getTime() || 0) - (asDate(b.createdAt)?.getTime() || 0))[0];
    const receiptDate = asDate(matchingGrn?.createdAt);
    return deliveryDate && receiptDate && receiptDate <= deliveryDate;
  });
  const received = supplierGrns.reduce((total, grn) => total + Number(grn.receivedQty || 0), 0);
  const accepted = supplierGrns.reduce((total, grn) => total + Number(grn.acceptedQty || 0), 0);
  const rejected = supplierGrns.reduce((total, grn) => total + Number(grn.rejectedQty || 0), 0);
  const spend = supplierOrders.reduce((total, po) => total + Number(po.amount || 0), 0);
  const openOrders = supplierOrders.filter((po) => !['DELIVERED', 'CANCELLED'].includes(po.status)).length;
  const deliveryRate = deliveredOrders.length ? Math.round((onTimeOrders.length / deliveredOrders.length) * 100) : null;
  const acceptanceRate = received ? Math.round((accepted / received) * 100) : null;
  const score = deliveryRate === null && acceptanceRate === null
    ? null
    : Math.round(((deliveryRate ?? 0) * 0.6) + ((acceptanceRate ?? 0) * 0.4));

  return {
    ...supplier,
    totalOrders: supplierOrders.length,
    deliveredOrders: deliveredOrders.length,
    openOrders,
    onTimeOrders: onTimeOrders.length,
    deliveryRate,
    received,
    accepted,
    rejected,
    acceptanceRate,
    spend,
    score,
  };
}

export function SupplierPerformanceTab({ suppliers = [], purchaseOrders = [], grns = [], isLoading }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('score');

  const performance = useMemo(() => suppliers.map((supplier) => supplierPerformance(supplier, purchaseOrders, grns)), [grns, purchaseOrders, suppliers]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return performance
      .filter((supplier) => !query || [supplier.name, supplier.supplierCode, supplier.contactPerson].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)))
      .sort((a, b) => {
        if (sortBy === 'spend') return b.spend - a.spend;
        if (sortBy === 'delivery') return (b.deliveryRate ?? -1) - (a.deliveryRate ?? -1);
        return (b.score ?? -1) - (a.score ?? -1);
      });
  }, [performance, search, sortBy]);

  const summary = useMemo(() => {
    const rated = performance.filter((supplier) => supplier.score !== null);
    const deliveries = performance.filter((supplier) => supplier.deliveryRate !== null);
    const accepted = performance.filter((supplier) => supplier.acceptanceRate !== null);
    return {
      suppliers: performance.length,
      avgScore: rated.length ? Math.round(rated.reduce((total, supplier) => total + supplier.score, 0) / rated.length) : 0,
      onTime: deliveries.length ? Math.round(deliveries.reduce((total, supplier) => total + supplier.deliveryRate, 0) / deliveries.length) : 0,
      acceptance: accepted.length ? Math.round(accepted.reduce((total, supplier) => total + supplier.acceptanceRate, 0) / accepted.length) : 0,
    };
  }, [performance]);

  const columns = [
    { key: 'name', header: 'Supplier', render: (row) => <div><p className="font-semibold text-ink-900">{row.name}</p><p className="font-mono text-[11px] text-ink-500">{row.supplierCode}</p></div> },
    { key: 'orders', header: 'POs', render: (row) => <span className="text-xs text-ink-700">{row.totalOrders} total · {row.openOrders} open</span> },
    { key: 'deliveryRate', header: 'On-time Delivery', render: (row) => row.deliveryRate === null ? <span className="text-xs text-ink-400">No delivery data</span> : <span className="font-semibold text-xs">{row.deliveryRate}% <span className="font-normal text-ink-500">({row.onTimeOrders}/{row.deliveredOrders})</span></span> },
    { key: 'acceptanceRate', header: 'Acceptance', render: (row) => row.acceptanceRate === null ? <span className="text-xs text-ink-400">No GRN data</span> : <span className="font-semibold text-xs">{row.acceptanceRate}% <span className="font-normal text-ink-500">({row.rejected} rejected)</span></span> },
    { key: 'spend', header: 'PO Value', render: (row) => <span className="text-xs font-semibold">₹{row.spend.toLocaleString('en-IN')}</span> },
    { key: 'score', header: 'Performance', render: (row) => row.score === null ? <StatusPill status="WARNING" label="NOT RATED" /> : <StatusPill status={row.score >= 85 ? 'SUCCESS' : row.score >= 65 ? 'WARNING' : 'DANGER'} label={`${row.score}%`} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Suppliers Tracked" value={summary.suppliers} icon={<Truck className="h-4 w-4" />} />
        <StatCard label="Average Performance" value={`${summary.avgScore}%`} icon={<Award className="h-4 w-4" />} />
        <StatCard label="Average On-time Delivery" value={`${summary.onTime}%`} icon={<Clock3 className="h-4 w-4" />} />
        <StatCard label="Average Acceptance" value={`${summary.acceptance}%`} icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-surface-border bg-surface-subtle p-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-semibold text-ink-900">Supplier Performance Dashboard</p><p className="text-xs text-ink-500">Score weighting: 60% on-time delivery and 40% accepted quantity.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search supplier..." className="h-9 rounded border border-surface-border bg-surface-base pl-9 pr-3 text-xs text-ink-900" /></div>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-9 rounded border border-surface-border bg-surface-base px-2.5 text-xs text-ink-900"><option value="score">Sort by performance</option><option value="delivery">Sort by delivery</option><option value="spend">Sort by PO value</option></select>
        </div>
      </div>

      {filtered.length === 0 && !isLoading ? <EmptyState title="No supplier performance data" description="Supplier performance will appear after POs and GRNs are recorded." /> : <Table columns={columns} data={filtered} rowKey={(row) => row.id} isLoading={isLoading} />}
      <p className="flex items-center gap-1 text-[11px] text-ink-500"><TrendingUp className="h-3.5 w-3.5" /> On-time delivery uses the first GRN receipt date for each PO compared with its expected delivery date.</p>
    </div>
  );
}
