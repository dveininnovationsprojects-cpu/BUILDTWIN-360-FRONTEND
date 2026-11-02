import { useMemo, useState } from 'react';
import { Button, EmptyState, StatCard, StatusPill, Table } from '@/design-system';
import { Award, CheckCircle2, Clock3, Search, TrendingUp, Truck, ShieldAlert, BarChart2 } from 'lucide-react';
import { ProcurementLeadTimeAnalyticsModule } from './ProcurementLeadTimeAnalyticsModule';

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
  const rejectionRate = received ? Number(((rejected / received) * 100).toFixed(1)) : 0;

  // Calculate Lead Times
  const orderLeadTimes = deliveredOrders.map((po) => {
    const matchingGrn = supplierGrns
      .filter((grn) => String(grn.poId) === String(po.id))
      .sort((a, b) => (asDate(a.createdAt)?.getTime() || 0) - (asDate(b.createdAt)?.getTime() || 0))[0];
    const receiptDate = asDate(matchingGrn?.createdAt);
    const poDate = asDate(po.createdAt) || (receiptDate ? new Date(receiptDate.getTime() - (supplier.leadTimeDays || 4) * 86400000) : null);
    if (poDate && receiptDate) {
      return Math.max(1, Math.round((receiptDate.getTime() - poDate.getTime()) / (1000 * 60 * 60 * 24)));
    }
    return supplier.leadTimeDays || 4;
  });
  const avgLeadTime = orderLeadTimes.length
    ? Number((orderLeadTimes.reduce((a, b) => a + b, 0) / orderLeadTimes.length).toFixed(1))
    : (supplier.leadTimeDays || 4);
  const contractedLeadTime = supplier.leadTimeDays || 4;
  const leadTimeVariance = Number((avgLeadTime - contractedLeadTime).toFixed(1));

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
    rejectionRate,
    avgLeadTime,
    contractedLeadTime,
    leadTimeVariance,
    spend,
    score,
  };
}

export function SupplierPerformanceTab({ suppliers = [], purchaseOrders = [], grns = [], isLoading }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [viewMode, setViewMode] = useState('scorecard'); // 'scorecard' | 'analytics'

  const performance = useMemo(() => suppliers.map((supplier) => supplierPerformance(supplier, purchaseOrders, grns)), [grns, purchaseOrders, suppliers]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return performance
      .filter((supplier) => !query || [supplier.name, supplier.supplierCode, supplier.contactPerson].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)))
      .sort((a, b) => {
        if (sortBy === 'spend') return b.spend - a.spend;
        if (sortBy === 'delivery') return (b.deliveryRate ?? -1) - (a.deliveryRate ?? -1);
        if (sortBy === 'rejection') return b.rejectionRate - a.rejectionRate;
        if (sortBy === 'leadtime') return b.avgLeadTime - a.avgLeadTime;
        return (b.score ?? -1) - (a.score ?? -1);
      });
  }, [performance, search, sortBy]);

  const summary = useMemo(() => {
    const rated = performance.filter((supplier) => supplier.score !== null);
    const deliveries = performance.filter((supplier) => supplier.deliveryRate !== null);
    const rejections = performance.filter((supplier) => supplier.received > 0);
    const leadTimes = performance.filter((supplier) => supplier.avgLeadTime != null);
    return {
      suppliers: performance.length,
      avgScore: rated.length ? Math.round(rated.reduce((total, supplier) => total + supplier.score, 0) / rated.length) : 0,
      onTime: deliveries.length ? Math.round(deliveries.reduce((total, supplier) => total + supplier.deliveryRate, 0) / deliveries.length) : 0,
      avgRejection: rejections.length ? Number((rejections.reduce((total, supplier) => total + supplier.rejectionRate, 0) / rejections.length).toFixed(1)) : 0,
      avgLeadTime: leadTimes.length ? Number((leadTimes.reduce((total, supplier) => total + supplier.avgLeadTime, 0) / leadTimes.length).toFixed(1)) : 4.2,
    };
  }, [performance]);

  const columns = [
    { key: 'name', header: 'Supplier', render: (row) => <div><p className="font-semibold text-ink-900">{row.name}</p><p className="font-mono text-[11px] text-ink-500">{row.supplierCode}</p></div> },
    { key: 'orders', header: 'POs', render: (row) => <span className="text-xs text-ink-700">{row.totalOrders} total · {row.openOrders} open</span> },
    { key: 'deliveryRate', header: 'On-time Delivery (OTD %)', render: (row) => row.deliveryRate === null ? <span className="text-xs text-ink-400">No delivery data</span> : <span className={`font-semibold text-xs ${row.deliveryRate >= 85 ? 'text-emerald-700' : 'text-rose-700'}`}>{row.deliveryRate}% <span className="font-normal text-ink-500">({row.onTimeOrders}/{row.deliveredOrders})</span></span> },
    { key: 'rejectionRate', header: 'Rejection Rate %', render: (row) => row.received === 0 ? <span className="text-xs text-ink-400">No GRN data</span> : (
      <span className={`font-semibold text-xs ${row.rejectionRate > 3.0 ? 'text-rose-600' : 'text-slate-800'}`}>
        {row.rejectionRate}% <span className="font-normal text-ink-500">({row.rejected} rej)</span>
      </span>
    )},
    { key: 'leadTime', header: 'Avg Lead Time', render: (row) => (
      <div className="text-xs font-mono">
        <span className="font-bold text-slate-900">{row.avgLeadTime}d</span>
        <span className={`ml-1 text-[11px] font-semibold ${row.leadTimeVariance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
          ({row.leadTimeVariance > 0 ? `+${row.leadTimeVariance}d` : `${row.leadTimeVariance}d`})
        </span>
      </div>
    )},
    { key: 'spend', header: 'PO Value', render: (row) => <span className="text-xs font-semibold">₹{row.spend.toLocaleString('en-IN')}</span> },
    { key: 'score', header: 'Performance Score', render: (row) => row.score === null ? <StatusPill status="WARNING" label="NOT RATED" /> : <StatusPill status={row.score >= 85 ? 'SUCCESS' : row.score >= 65 ? 'WARNING' : 'DANGER'} label={`${row.score}%`} /> },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* 4 Summary StatCards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Suppliers Tracked" value={summary.suppliers} icon={<Truck className="h-4 w-4" />} />
        <StatCard label="Average On-Time Delivery (OTD)" value={`${summary.onTime}%`} icon={<Clock3 className="h-4 w-4 text-emerald-600" />} />
        <StatCard label="Average Rejection Rate" value={`${summary.avgRejection}%`} icon={<ShieldAlert className="h-4 w-4 text-amber-600" />} />
        <StatCard label="Average Procurement Lead-Time" value={`${summary.avgLeadTime} Days`} icon={<TrendingUp className="h-4 w-4 text-brand-600" />} />
      </div>

      {/* View Switcher Bar */}
      <div className="flex flex-col gap-3 rounded-lg border border-surface-border bg-surface-subtle p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('scorecard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'scorecard'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'bg-white text-ink-700 hover:bg-slate-100 border border-surface-border'
            }`}
          >
            Supplier Scorecard Table
          </button>
          <button
            type="button"
            onClick={() => setViewMode('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'analytics'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'bg-white text-ink-700 hover:bg-slate-100 border border-surface-border'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            Lead-Time & Rejection Simulator Engine
          </button>
        </div>

        {viewMode === 'scorecard' && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search supplier..." className="h-9 rounded border border-surface-border bg-surface-base pl-9 pr-3 text-xs text-ink-900" />
            </div>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-9 rounded border border-surface-border bg-surface-base px-2.5 text-xs text-ink-900">
              <option value="score">Sort by performance</option>
              <option value="delivery">Sort by OTD %</option>
              <option value="rejection">Sort by Rejection %</option>
              <option value="leadtime">Sort by Lead Time</option>
              <option value="spend">Sort by PO value</option>
            </select>
          </div>
        )}
      </div>

      {viewMode === 'scorecard' ? (
        <>
          {filtered.length === 0 && !isLoading ? (
            <EmptyState title="No supplier performance data" description="Supplier performance will appear after POs and GRNs are recorded." />
          ) : (
            <Table columns={columns} data={filtered} rowKey={(row) => row.id} isLoading={isLoading} />
          )}
          <p className="flex items-center gap-1 text-[11px] text-ink-500">
            <TrendingUp className="h-3.5 w-3.5" /> OTD % evaluates on-time receipts; Rejection Rate measures substandard consignments; Lead time variance monitors vendor turnaround lag.
          </p>
        </>
      ) : (
        <ProcurementLeadTimeAnalyticsModule />
      )}
    </div>
  );
}
