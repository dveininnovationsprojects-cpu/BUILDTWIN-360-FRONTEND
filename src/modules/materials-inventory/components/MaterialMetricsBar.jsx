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
      value: `${totalItems} Items`,
      icon: Package,
      color: 'text-brand-600 bg-brand-50 border-brand-200 dark:bg-brand-950/40 dark:border-brand-800',
      onClick: onSelectTab ? () => onSelectTab('catalog') : undefined,
    },
    {
      label: 'Inventory Valuation',
      value: `₹${totalInventoryValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: IndianRupee,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800',
    },
    {
      label: 'Healthy Stock',
      value: `${healthyCount} Items`,
      icon: CheckCircle2,
      color: 'text-status-success bg-status-successBg border-status-success/30',
    },
    {
      label: 'Low Stock Warnings',
      value: lowStockCount > 0 ? `${lowStockCount} Warnings` : 'Zero Warnings',
      icon: TrendingDown,
      color:
        lowStockCount > 0
          ? 'text-status-warning bg-status-warningBg border-status-warning/30 cursor-pointer'
          : 'text-status-success bg-status-successBg border-status-success/30 cursor-pointer',
      onClick: onSelectTab ? () => onSelectTab('low-stock') : undefined,
    },
    {
      label: 'Critical / Out of Stock',
      value: outOfStockCount > 0 ? `${outOfStockCount} Out of Stock` : 'Zero Stockouts',
      icon: outOfStockCount > 0 ? AlertTriangle : CheckCircle2,
      color:
        outOfStockCount > 0
          ? 'text-status-danger bg-status-dangerBg border-status-danger/30 cursor-pointer'
          : 'text-status-success bg-status-successBg border-status-success/30',
      onClick: onSelectTab ? () => onSelectTab('low-stock') : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map(({ label, value, icon: Icon, color, onClick }) => (
        <div
          key={label}
          onClick={onClick}
          className={`flex items-center gap-3 rounded-xl border p-3 shadow-xs transition-all hover:shadow-md ${color}`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/75 dark:bg-black/20 shadow-xs">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold leading-tight tracking-tight text-ink-900">{value}</p>
            <p className="text-xs font-semibold opacity-90 truncate mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
