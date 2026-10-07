import React from 'react';
import { Package, TrendingDown, AlertTriangle, CheckCircle2, IndianRupee } from 'lucide-react';

export function MaterialMetricsBar({
  materials = [],
  lowStock = [],
  reorderAlerts = [],
  onSelectTab,
}) {
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
      icon: Package,
      color: 'text-brand-700 bg-brand-50/70 border-brand-200 dark:bg-brand-950/40 dark:border-brand-800 dark:text-brand-300',
      onClick: onSelectTab ? () => onSelectTab('catalog') : undefined,
    },
    {
      label: 'Inventory Value',
      value: `₹${totalInventoryValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: IndianRupee,
      color: 'text-indigo-700 bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300',
    },
    {
      label: 'Healthy Stock',
      value: healthyCount,
      icon: CheckCircle2,
      color: 'text-status-success bg-status-successBg border-status-success/30',
    },
    {
      label: 'Low Stock Alerts',
      value: lowStockCount,
      icon: TrendingDown,
      color:
        lowStockCount > 0
          ? 'text-status-warning bg-status-warningBg border-status-warning/30 cursor-pointer'
          : 'text-status-success bg-status-successBg border-status-success/30 cursor-pointer',
      onClick: onSelectTab ? () => onSelectTab('low-stock') : undefined,
    },
    {
      label: 'Out of Stock',
      value: outOfStockCount,
      icon: outOfStockCount > 0 ? AlertTriangle : CheckCircle2,
      color:
        outOfStockCount > 0
          ? 'text-status-danger bg-status-dangerBg border-status-danger/30 cursor-pointer'
          : 'text-status-success bg-status-successBg border-status-success/30',
      onClick: onSelectTab ? () => onSelectTab('low-stock') : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map(({ label, value, icon: Icon, color, onClick }) => (
        <div
          key={label}
          onClick={onClick}
          className={`group flex flex-col justify-between rounded-xl border p-3 shadow-xs transition-all hover:shadow-md min-h-[82px] ${color} ${
            onClick ? 'cursor-pointer' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold opacity-85 leading-tight">
              {label}
            </span>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/80 dark:bg-black/25 shadow-xs">
              <Icon className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-ink-900 leading-none">
              {value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
