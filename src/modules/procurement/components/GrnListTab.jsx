import { useState, useMemo } from 'react';
import { Table, Button, Input, StatusPill, EmptyState, StatCard } from '@/design-system';
import { GrnDetailsModal } from './GrnDetailsModal';
import { PackageCheck, Search, Filter, Eye, AlertOctagon, CheckCircle2, TrendingUp } from 'lucide-react';

export function GrnListTab({ grns = [], isLoading, onRecordGrn, canManage }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedGrn, setSelectedGrn] = useState(null);

  // Compute Metrics
  const metrics = useMemo(() => {
    let totalReceived = 0;
    let totalAccepted = 0;
    let totalRejected = 0;

    grns.forEach((g) => {
      totalReceived += Number(g.receivedQty || 0);
      totalAccepted += Number(g.acceptedQty || 0);
      totalRejected += Number(g.rejectedQty || 0);
    });

    const rate = totalReceived > 0 ? Math.round((totalAccepted / totalReceived) * 100) : 100;

    return {
      count: grns.length,
      totalReceived,
      totalAccepted,
      totalRejected,
      acceptanceRate: rate,
    };
  }, [grns]);

  // Filtered Data
  const filteredGrns = useMemo(() => {
    return grns.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        (item.grnNumber && item.grnNumber.toLowerCase().includes(q)) ||
        (item.poNumber && item.poNumber.toLowerCase().includes(q)) ||
        (item.materialName && item.materialName.toLowerCase().includes(q)) ||
        (item.receivedBy && item.receivedBy.toLowerCase().includes(q));

      const isFull = Number(item.rejectedQty || 0) === 0;
      const isPartial = Number(item.rejectedQty || 0) > 0 && Number(item.acceptedQty || 0) > 0;
      const isRejected = Number(item.acceptedQty || 0) === 0;

      let matchStatus = true;
      if (statusFilter === 'FULLY_ACCEPTED') matchStatus = isFull;
      else if (statusFilter === 'PARTIALLY_ACCEPTED') matchStatus = isPartial;
      else if (statusFilter === 'REJECTED') matchStatus = isRejected;

      return matchSearch && matchStatus;
    });
  }, [grns, search, statusFilter]);

  const columns = [
    {
      key: 'grnNumber',
      header: 'GRN Number',
      render: (row) => (
        <span className="font-semibold text-brand-900 font-mono text-xs">
          {row.grnNumber || `GRN-${row.id}`}
        </span>
      ),
    },
    {
      key: 'poNumber',
      header: 'Purchase Order',
      render: (row) => (
        <span className="font-medium text-ink-700 text-xs">
          {row.poNumber || `PO-${row.poId}`}
        </span>
      ),
    },
    {
      key: 'materialName',
      header: 'Material Received',
      render: (row) => (
        <span className="font-medium text-ink-900 text-xs">
          {row.materialName || `Material #${row.materialId}`}
        </span>
      ),
    },
    {
      key: 'receivedQty',
      header: 'Delivered',
      render: (row) => <span className="font-medium text-ink-800 text-xs">{row.receivedQty}</span>,
    },
    {
      key: 'acceptedQty',
      header: 'Accepted (Stock In)',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-status-success/15 text-status-success">
          +{row.acceptedQty}
        </span>
      ),
    },
    {
      key: 'rejectedQty',
      header: 'Rejected',
      render: (row) => (
        Number(row.rejectedQty) > 0 ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-status-danger/15 text-status-danger">
            {row.rejectedQty}
          </span>
        ) : (
          <span className="text-ink-400 text-xs">—</span>
        )
      ),
    },
    {
      key: 'status',
      header: 'Inspection Status',
      render: (row) => {
        const rej = Number(row.rejectedQty || 0);
        const acc = Number(row.acceptedQty || 0);
        if (rej === 0) return <StatusPill status="SUCCESS" label="FULLY ACCEPTED" />;
        if (acc > 0) return <StatusPill status="WARNING" label="PARTIALLY ACCEPTED" />;
        return <StatusPill status="DANGER" label="FULLY REJECTED" />;
      },
    },
    {
      key: 'receivedBy',
      header: 'Inspector',
      render: (row) => <span className="text-xs text-ink-600">{row.receivedBy || 'Storekeeper'}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => {
        const d = row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—';
        return <span className="text-xs text-ink-500">{d}</span>;
      },
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <Button size="xs" variant="outline" onClick={() => setSelectedGrn(row)}>
          <Eye className="w-3.5 h-3.5 mr-1 inline" />
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total GRN Receipts"
          value={metrics.count}
          icon={<PackageCheck className="w-4 h-4" />}
        />
        <StatCard
          label="Total Stock Inwarded"
          value={metrics.totalAccepted.toLocaleString()}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <StatCard
          label="Rejected Material"
          value={metrics.totalRejected.toLocaleString()}
          icon={<AlertOctagon className="w-4 h-4" />}
        />
        <StatCard
          label="Delivery Acceptance Rate"
          value={`${metrics.acceptanceRate}%`}
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-surface-subtle border border-surface-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-400" />
          <input
            type="text"
            placeholder="Search GRN #, PO #, material, inspector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded border border-surface-border bg-surface-base text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-ink-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded border border-surface-border bg-surface-base px-2.5 text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="ALL">All Inspection Statuses</option>
            <option value="FULLY_ACCEPTED">Fully Accepted (100%)</option>
            <option value="PARTIALLY_ACCEPTED">Partially Accepted</option>
            <option value="REJECTED">Fully Rejected</option>
          </select>

          {canManage && (
            <Button size="sm" onClick={onRecordGrn}>
              <PackageCheck className="w-4 h-4 mr-1.5 inline" />
              Record GRN
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {filteredGrns.length === 0 && !isLoading ? (
        <EmptyState
          title="No Goods Receipt Notes Found"
          description={
            search || statusFilter !== 'ALL'
              ? 'No GRN records match your search criteria.'
              : 'No material deliveries have been inspected and logged yet.'
          }
          actionLabel={canManage ? 'Record First GRN' : undefined}
          onAction={canManage ? onRecordGrn : undefined}
        />
      ) : (
        <Table
          columns={columns}
          data={filteredGrns}
          rowKey={(row) => row.id}
          isLoading={isLoading}
        />
      )}

      {/* Details Modal */}
      <GrnDetailsModal
        open={Boolean(selectedGrn)}
        onClose={() => setSelectedGrn(null)}
        grn={selectedGrn}
      />
    </div>
  );
}
