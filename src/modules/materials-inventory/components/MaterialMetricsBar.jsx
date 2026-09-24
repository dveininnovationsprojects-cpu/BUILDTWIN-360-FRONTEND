import React from 'react';
import { Package, TrendingDown, AlertTriangle, BarChart2, DollarSign } from 'lucide-react';

export function MaterialMetricsBar({ materials = [], lowStock = [], reorderAlerts = [] }) {
  const totalItems = materials.length;
  const outOfStockCount = materials.filter((m) => Number(m.currentStock ?? 0) === 0).length;
  // Low stock count: items with stock at or below reorder level, but still above zero
  const lowStockCount = materials.filter((m) => {
    const stock = Number(m.currentStock ?? 0);
    const reorder = Number(m.reorderLevel ?? 0);
    return stock > 0 && stock <= reorder;
  }).length;
  const healthyCount = materials.filter((m) => {
    const stock = Number(m.currentStock ?? 0);
    const reorder = Number(m.reorderLevel ?? 0);
    return stock > reorder;
  }).length;

  const totalInventoryValuation = materials.reduce((acc, m) => {
    const stock = Number(m.currentStock ?? 0);
    const rate = Number(m.standardRate ?? 0);
    return acc + stock * rate;
  }, 0);

  const cards = [
    {
      label: 'Catalog Items',
      value: totalItems,
      sub: `${materials.reduce((acc, m) => acc + (m.category ? 1 : 0), 0)} tracked`,
      icon: Package,
      border: 'border-brand-500/20',
      bg: 'bg-brand-50/50 dark:bg-brand-950/20',
      iconColor: 'text-brand-600 dark:text-brand-400',
    },
    {
      label: 'Inventory Valuation',
      value: `₹${totalInventoryValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      sub: 'Standard unit rates',
      icon: DollarSign,
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Healthy Stock',
      value: healthyCount,
      sub: 'Above reorder level',
      icon: BarChart2,
      border: 'border-status-success/30',
      bg: 'bg-status-successBg',
      iconColor: 'text-status-success',
    },
    {
      label: 'Low Stock Warnings',
      value: lowStockCount,
      sub: 'At reorder threshold',
      icon: TrendingDown,
      border: 'border-amber-500/30',
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Critical / Out of Stock',
      value: outOfStockCount,
      sub: outOfStockCount > 0 ? `${outOfStockCount} zero stock` : 'Zero stockouts',
      icon: AlertTriangle,
      border: outOfStockCount > 0 ? 'border-status-danger/30' : 'border-surface-border',
      bg: outOfStockCount > 0 ? 'bg-status-dangerBg' : 'bg-surface-subtle/50',
      iconColor: outOfStockCount > 0 ? 'text-status-danger' : 'text-ink-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-150 hover:shadow-sm ${c.border} ${c.bg}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-600">{c.label}</span>
              <div className={`rounded-lg p-1.5 ${c.bg}`}>
                <Icon className={`h-4 w-4 ${c.iconColor}`} />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold tracking-tight text-ink-900">{c.value}</div>
              <p className="mt-0.5 text-[11px] text-ink-500">{c.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
