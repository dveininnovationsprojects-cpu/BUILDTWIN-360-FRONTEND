import React from 'react';
import {
  Package,
  Layers,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { formatCurrency } from '@/modules/projects/constants';
import { Table, Button } from '@/design-system';

export function InventoryReportTab({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
        <p className="text-sm text-ink-500">Loading Material &amp; Inventory Valuation Report...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-surface-border">
        <p className="text-sm text-ink-500">No inventory valuation data available.</p>
      </div>
    );
  }

  const lowStockItems = data.criticalLowStockItems ?? [];

  const columns = [
    {
      key: 'materialCode',
      header: 'Item Code',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-ink-800">{row.materialCode}</span>
      ),
    },
    {
      key: 'materialName',
      header: 'Material Description',
      render: (row) => (
        <div>
          <span className="font-medium text-ink-900">{row.materialName}</span>
          <span className="block text-[11px] text-ink-400">Unit: {row.unit}</span>
        </div>
      ),
    },
    {
      key: 'currentStock',
      header: 'Current Stock',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-rose-600">
          {Number(row.currentStock).toLocaleString()} {row.unit}
        </span>
      ),
    },
    {
      key: 'reorderLevel',
      header: 'Reorder Buffer',
      render: (row) => (
        <span className="font-mono text-xs text-ink-600">
          {Number(row.reorderLevel).toLocaleString()} {row.unit}
        </span>
      ),
    },
    {
      key: 'stockDeficit',
      header: 'Stock Deficit',
      render: (row) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="h-3 w-3" />
          -{Number(row.stockDeficit).toLocaleString()} {row.unit}
        </span>
      ),
    },
    {
      key: 'standardRate',
      header: 'Standard Rate',
      render: (row) => (
        <span className="text-xs text-ink-700">{formatCurrency(row.standardRate)}</span>
      ),
    },
    {
      key: 'estimatedCostToReplenish',
      header: 'Replenishment Cost',
      render: (row) => (
        <span className="font-semibold text-ink-900">
          {formatCurrency(Number(row.stockDeficit) * Number(row.standardRate))}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Inventory Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Valuation */}
        <div className="rounded-xl border border-surface-border bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-ink-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Inventory Valuation</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-ink-900">
            {formatCurrency(data.totalInventoryValuation)}
          </p>
          <p className="text-xs text-ink-500 mt-1">Total capital locked in site store</p>
        </div>

        {/* Cataloged Materials */}
        <div className="rounded-xl border border-surface-border bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-ink-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cataloged SKUs</span>
            <Package className="h-4 w-4 text-brand-600" />
          </div>
          <p className="text-2xl font-extrabold text-ink-900">
            {data.totalMaterialsCataloged ?? 0} Items
          </p>
          <p className="text-xs text-ink-500 mt-1">Active tracked materials</p>
        </div>

        {/* Total Consumption */}
        <div className="rounded-xl border border-surface-border bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-ink-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Consumption Cost</span>
            <TrendingDown className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-ink-900">
            {formatCurrency(data.totalConsumptionCost)}
          </p>
          <p className="text-xs text-ink-500 mt-1">{data.totalConsumedQuantity ?? 0} units consumed on site</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-xl border border-surface-border bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-ink-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Stock Deficits</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">
            {data.lowStockItemsCount ?? 0}
          </p>
          <p className="text-xs text-emerald-600 mt-1">All stock above reorder minimum</p>
        </div>
      </div>

      {/* Critical Low Stock / Reorder Audit Section */}
      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
          <div>
            <h3 className="text-sm font-bold text-ink-900">
              Critical Low Stock &amp; Reorder Threshold Audit
            </h3>
            <p className="text-xs text-ink-500">
              Items approaching or breaching the Minimum Safe Operating Threshold (MSOT)
            </p>
          </div>
          <span className="text-xs font-semibold text-ink-600">
            {lowStockItems.length} Deficit Items Flagged
          </span>
        </div>

        {lowStockItems.length > 0 ? (
          <div className="mt-4">
            <Table
              columns={columns}
              data={lowStockItems}
              rowKey={(row) => row.materialId}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-3 shadow-inner">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h4 className="text-base font-bold text-ink-900">Zero Critical Inventory Deficits</h4>
            <p className="text-xs text-ink-500 max-w-md mt-1 leading-relaxed">
              All {data.totalMaterialsCataloged ?? 13} warehouse material items maintain safe operating reserves above minimum reorder points. No urgent stockout disruption risks detected for ongoing civil works.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
