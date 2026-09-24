import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Scale,
  Edit2,
  Trash2,
  AlertTriangle,
  ClipboardList,
  Layers,
  DollarSign,
  Info,
} from 'lucide-react';
import { Modal, Button } from '@/design-system';
import { stockLedgerApi, UNIT_LABEL_MAP } from '../api/materialsInventoryApi';

const TYPE_BADGES = {
  RECEIPT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ISSUE: 'bg-blue-50 text-blue-700 border-blue-200',
  CONSUMPTION: 'bg-amber-50 text-amber-700 border-amber-200',
  WASTAGE: 'bg-rose-50 text-rose-700 border-rose-200',
  RETURN: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  ADJUSTMENT: 'bg-purple-50 text-purple-700 border-purple-200',
};

export function MaterialDetailsModal({
  open,
  onClose,
  material,
  onEdit,
  onTransaction,
  onReconcile,
  canManage = false,
}) {
  const { data: ledger = [], isLoading } = useQuery({
    queryKey: ['stock-ledger-material', material?.id],
    queryFn: () => stockLedgerApi.getLedgerByMaterial(material.id),
    enabled: open && Boolean(material?.id),
    staleTime: 10_000,
  });

  if (!material) return null;

  const unitLabel = UNIT_LABEL_MAP[material.unit] || material.unit;
  const stock = Number(material.currentStock ?? 0);
  const reorder = Number(material.reorderLevel ?? 0);
  const rate = Number(material.standardRate ?? 0);
  const valuation = stock * rate;

  const isLowStock = reorder > 0 && stock <= reorder;
  const isZeroStock = stock === 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink-900">{material.name}</h3>
            <p className="text-xs text-ink-500 font-mono">
              SKU: {material.materialCode} · Category: {material.category}
            </p>
          </div>
        </div>
      }
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {canManage && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(material);
                }}
                className="flex items-center gap-1 text-xs"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Item
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 py-1">
        {/* Alerts Banner */}
        {isZeroStock ? (
          <div className="flex items-center gap-2 rounded-xl border border-status-danger/30 bg-status-dangerBg p-3 text-xs text-status-danger">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="font-semibold">Out of Stock! Zero inventory currently available.</span>
          </div>
        ) : isLowStock ? (
          <div className="flex items-center gap-2 rounded-xl border border-status-warning/30 bg-status-warningBg p-3 text-xs text-status-warning">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="font-semibold">
              Low Stock Warning: Current stock ({stock} {unitLabel}) is at or below reorder threshold (
              {reorder} {unitLabel}).
            </span>
          </div>
        ) : null}

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">Current Stock</p>
            <p className="mt-1 text-lg font-bold text-ink-900">
              {stock.toLocaleString()} <span className="text-xs font-normal text-ink-500">{unitLabel}</span>
            </p>
            <p className="text-[10px] text-ink-400">Reorder at: {reorder} {unitLabel}</p>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">Standard Rate</p>
            <p className="mt-1 text-lg font-bold text-emerald-600">
              ₹{rate.toLocaleString()}
            </p>
            <p className="text-[10px] text-ink-400">per {unitLabel}</p>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">Stock Valuation</p>
            <p className="mt-1 text-lg font-bold text-ink-900">
              ₹{valuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-ink-400">Total holding value</p>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">Stock Status</p>
            <p
              className={`mt-1 text-sm font-bold ${
                isZeroStock
                  ? 'text-status-danger'
                  : isLowStock
                  ? 'text-status-warning'
                  : 'text-status-success'
              }`}
            >
              {isZeroStock ? 'OUT OF STOCK' : isLowStock ? 'LOW STOCK' : 'HEALTHY'}
            </p>
            <p className="text-[10px] text-ink-400">Real-time level</p>
          </div>
        </div>

        {/* Specifications */}
        {material.description && (
          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3 text-xs">
            <p className="font-semibold text-ink-700 mb-1 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-brand-600" />
              Description & Specifications
            </p>
            <p className="text-ink-600 leading-relaxed">{material.description}</p>
          </div>
        )}

        {/* Quick Action Buttons for Stock Operations */}
        {canManage && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-500/20 bg-brand-50/30 p-3 dark:bg-brand-950/20">
            <span className="text-xs font-semibold text-ink-700 mr-2">Quick Operations:</span>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              onClick={() => {
                onClose();
                onTransaction?.(material, 'RECEIPT');
              }}
            >
              <ArrowUpCircle className="h-3.5 w-3.5 mr-1" />
              Receive (GRN)
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => {
                onClose();
                onTransaction?.(material, 'ISSUE');
              }}
            >
              <ArrowDownCircle className="h-3.5 w-3.5 mr-1" />
              Issue To Site
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={() => {
                onClose();
                onTransaction?.(material, 'CONSUMPTION');
              }}
            >
              <Layers className="h-3.5 w-3.5 mr-1" />
              Record Consumption
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              onClick={() => {
                onClose();
                onReconcile?.(material);
              }}
            >
              <Scale className="h-3.5 w-3.5 mr-1" />
              Audit Reconcile
            </Button>
          </div>
        )}

        {/* Material Stock Ledger Audit Trail */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-brand-600" />
              Item Audit Trail ({ledger.length} entries)
            </h4>
            <span className="text-[11px] text-ink-400">Append-only immutable record</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-xs text-ink-400">
              Loading ledger audit records...
            </div>
          ) : ledger.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-surface-border py-8 text-xs text-ink-400">
              <ClipboardList className="h-6 w-6 mb-1 opacity-40" />
              No stock transactions recorded yet for this material.
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-surface-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-subtle text-ink-500 font-semibold sticky top-0">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Movement Type</th>
                    <th className="px-3 py-2 text-right">Quantity</th>
                    <th className="px-3 py-2 text-right">Unit Rate</th>
                    <th className="px-3 py-2">Ref / Zone</th>
                    <th className="px-3 py-2">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {ledger.map((entry) => {
                    const badge = TYPE_BADGES[entry.transactionType] || 'bg-surface-subtle text-ink-700 border-surface-border';
                    const isPositive = ['RECEIPT', 'RETURN'].includes(entry.transactionType);
                    const isNegative = ['ISSUE', 'CONSUMPTION', 'WASTAGE'].includes(entry.transactionType);
                    const d = entry.timestamp ? new Date(entry.timestamp) : null;
                    const isValidDate = d && !isNaN(d.getTime());
                    return (
                      <tr key={entry.id} className="hover:bg-surface-subtle/50">
                        <td className="px-3 py-2 text-ink-600 whitespace-nowrap">
                          {isValidDate ? d.toLocaleDateString('en-GB') : '-'}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badge}`}
                          >
                            {entry.transactionType}
                          </span>
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-mono font-bold ${
                            isPositive
                              ? 'text-emerald-600'
                              : isNegative
                              ? 'text-ink-900'
                              : 'text-purple-600'
                          }`}
                        >
                          {isPositive ? '+' : isNegative ? '-' : ''}
                          {Number(entry.quantity).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-ink-900">
                          {entry.unitPrice ? `₹${Number(entry.unitPrice).toLocaleString()}` : '-'}
                        </td>
                        <td className="px-3 py-2 text-ink-600 truncate max-w-[140px]">
                          {entry.referenceId || entry.zone || '-'}
                        </td>
                        <td className="px-3 py-2 text-ink-400 truncate max-w-[180px]" title={entry.remarks}>
                          {entry.remarks || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
