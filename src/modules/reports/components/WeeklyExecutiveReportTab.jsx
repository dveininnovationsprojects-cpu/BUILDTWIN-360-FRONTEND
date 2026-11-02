import React from 'react';
import {
  Activity,
  Users,
  Clock,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Calendar,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '@/modules/projects/constants';
import { StatCard, StatusPill, ProgressBar, Button } from '@/design-system';

export function WeeklyExecutiveReportTab({
  data,
  isLoading,
  selectedWeek,
  onWeekChange,
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-600 border-t-transparent" />
        <p className="text-sm text-ink-500">Loading consolidated weekly executive report...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-surface-border">
        <p className="text-sm text-ink-500">No weekly report data found for this selection.</p>
      </div>
    );
  }

  const planned = Number(data.plannedProgressPercentage ?? 111.99);
  const actual = Number(data.actualProgressPercentage ?? 14.36);
  const progressGap = (planned - actual).toFixed(1);

  return (
    <div className="flex flex-col gap-6">
      {/* Week Selector & Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-surface-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 border border-brand-100 text-brand-700">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-900">
              Weekly Consolidated Executive Synthesis (Week {data.weekNumber || selectedWeek})
            </h3>
            <p className="text-xs text-ink-500">
              Project: <span className="font-semibold text-ink-700">{data.projectName}</span> ({data.projectCode})
            </p>
          </div>
        </div>

        {/* Week Switcher */}
        <div className="flex items-center gap-2">
          <label htmlFor="week-select" className="text-xs font-semibold text-ink-600">Reporting Week:</label>
          <select
            id="week-select"
            value={selectedWeek}
            onChange={(e) => onWeekChange(Number(e.target.value))}
            className="rounded-lg border border-surface-border bg-white px-3 py-1.5 text-xs font-semibold text-ink-800 shadow-2xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Week {i + 1} {i + 1 === 10 ? '(Current Live)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Progress Variance Comparison */}
      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-border">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-ink-400">
              Physical Milestone Progress (S-Curve)
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-extrabold text-ink-900">{actual}%</span>
              <span className="text-xs font-medium text-ink-400">vs target {planned}%</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {data.scheduleStatus === 'BEHIND_SCHEDULE' ? 'Behind Schedule' : 'On Schedule'}
              </span>
            </div>
          </div>
          <div className="text-left md:text-right">
            <span className="text-xs text-ink-500">Critical Schedule Variance</span>
            <p className="text-sm font-bold text-rose-600">
              -{progressGap}% Milestone Lag ({data.totalSiteDelayDays ?? 5} site delay days)
            </p>
          </div>
        </div>

        {/* Visual Progress Trackers */}
        <div className="space-y-3 pt-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-ink-700">Actual Cumulative Progress Verified</span>
              <span className="font-mono font-bold text-brand-700">{actual}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${Math.min(actual, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-ink-500">Planned CPM Baseline Target</span>
              <span className="font-mono text-ink-600">{planned}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-slate-400 opacity-60 transition-all duration-500"
                style={{ width: `${Math.min(planned, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Multi-Domain Synthesis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Labour Summary */}
        <div className="rounded-xl border border-surface-border bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-ink-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Labour &amp; Gangs</span>
            <Users className="h-4 w-4 text-brand-600" />
          </div>
          <p className="text-2xl font-extrabold text-ink-900">{data.totalHeadcount ?? 0}</p>
          <p className="text-xs text-ink-500 mt-1">Workers deployed across trades</p>
          <div className="mt-3 pt-3 border-t border-surface-border/60 text-xs space-y-1">
            <div className="flex justify-between text-ink-600">
              <span>Standard Hours:</span>
              <span className="font-semibold">{data.totalStandardHours} hrs</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>Overtime Hours:</span>
              <span className="font-semibold text-amber-600">{data.totalOvertimeHours} hrs</span>
            </div>
            <div className="flex justify-between text-ink-900 font-bold pt-1">
              <span>Wages Accrued:</span>
              <span className="text-brand-700">{formatCurrency(data.totalLabourCost)}</span>
            </div>
          </div>
        </div>

        {/* Materials Summary */}
        <div className="rounded-xl border border-surface-border bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-ink-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Store &amp; Inventory</span>
            <Package className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-ink-900">{data.materialsTrackedCount ?? 0}</p>
          <p className="text-xs text-ink-500 mt-1">Cataloged material SKUs active</p>
          <div className="mt-3 pt-3 border-t border-surface-border/60 text-xs space-y-1">
            <div className="flex justify-between text-ink-600">
              <span>Low Stock Alerts:</span>
              <span className="font-semibold text-emerald-600">{data.lowStockAlertsCount ?? 0} Critical</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>Consumption Cost:</span>
              <span className="font-semibold">{formatCurrency(data.totalMaterialConsumptionCost)}</span>
            </div>
            <div className="flex justify-between text-ink-900 font-bold pt-1">
              <span>Stock Status:</span>
              <span className="text-emerald-700">Healthy Buffer</span>
            </div>
          </div>
        </div>

        {/* Procurement Summary */}
        <div className="rounded-xl border border-surface-border bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-ink-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Procurement &amp; POs</span>
            <ShoppingCart className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-ink-900">{data.totalPurchaseOrdersCount ?? 0}</p>
          <p className="text-xs text-ink-500 mt-1">Purchase Orders on record</p>
          <div className="mt-3 pt-3 border-t border-surface-border/60 text-xs space-y-1">
            <div className="flex justify-between text-ink-600">
              <span>Committed PO Cost:</span>
              <span className="font-semibold">{formatCurrency(data.committedProcurementCost)}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>Incurred GRN:</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(data.incurredGrnCost)}</span>
            </div>
            <div className="flex justify-between text-ink-900 font-bold pt-1">
              <span>Outstanding Liability:</span>
              <span className="text-amber-700">{formatCurrency(data.outstandingLiability)}</span>
            </div>
          </div>
        </div>

        {/* Cost & EVM Summary */}
        <div className="rounded-xl border border-surface-border bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-ink-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cost &amp; EVM Health</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">
            {data.costHealthStatus?.replace('_', ' ') || 'UNDER BUDGET'}
          </p>
          <p className="text-xs text-ink-500 mt-1">Baseline: {formatCurrency(data.baselineBudget)}</p>
          <div className="mt-3 pt-3 border-t border-surface-border/60 text-xs space-y-1">
            <div className="flex justify-between text-ink-600">
              <span>Cost Variance (CV):</span>
              <span className="font-semibold text-emerald-600">+{formatCurrency(data.costVariance)}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>CPI / SPI Indices:</span>
              <span className="font-semibold">{Number(data.costPerformanceIndex).toFixed(2)} / {Number(data.schedulePerformanceIndex).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-ink-900 font-bold pt-1">
              <span>EAC (Forecasted):</span>
              <span className="text-brand-700">{formatCurrency(data.estimateAtCompletion)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Snags & Delay Issues Bar */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Quality Defect &amp; Critical Blocker Log
              </h4>
              <p className="text-xs text-amber-800">
                There are <strong>{data.criticalBlockersCount ?? 0} critical blockers</strong>, <strong>{data.activeNcrsCount ?? 0} active NCRs</strong>, and <strong>{data.openSnagsCount ?? 0} open snag defects</strong> currently flagged on site.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-amber-900 border border-amber-300 shadow-2xs">
              {data.totalSiteDelayDays ?? 5} Delay Days Incurred
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
