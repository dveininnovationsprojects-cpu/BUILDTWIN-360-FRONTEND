import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { formatCurrency } from '@/modules/projects/constants';

export function CostQualityReportTab({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-600 border-t-transparent" />
        <p className="text-sm text-ink-500">Loading Cost &amp; Quality Unified Report...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-surface-border">
        <p className="text-sm text-ink-500">No cost and quality report data available.</p>
      </div>
    );
  }

  const cpi = Number(data.costPerformanceIndex ?? 1.0).toFixed(2);
  const spi = Number(data.schedulePerformanceIndex ?? 0.13).toFixed(2);
  const resolutionRate = Number(data.qualityResolutionPercentage ?? 86.67).toFixed(1);

  return (
    <div className="flex flex-col gap-6">
      {/* SECTION 1: Cost & Earned Value (EVM) Financial Analysis */}
      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink-900">Cost Breakdown &amp; EVM Performance</h3>
              <p className="text-xs text-ink-500">Earned Value Indices, Budget Variance &amp; EAC Forecasting</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {data.budgetStatus?.replace('_', ' ') || 'UNDER BUDGET'}
          </span>
        </div>

        {/* Financial KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100">
            <span className="text-[11px] font-semibold text-ink-500">Baseline Budget (BAC)</span>
            <p className="text-lg font-extrabold text-ink-900 mt-1">
              {formatCurrency(data.baselineBudget)}
            </p>
            <span className="text-[10px] text-ink-400">Approved Allocation</span>
          </div>

          <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100">
            <span className="text-[11px] font-semibold text-ink-500">Revised Budget</span>
            <p className="text-lg font-extrabold text-ink-900 mt-1">
              {formatCurrency(data.revisedBudget)}
            </p>
            <span className="text-[10px] text-ink-400">Scope Adjustments</span>
          </div>

          <div className="rounded-lg bg-emerald-50/60 p-3.5 border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-800">Net Budget Variance</span>
            <p className="text-lg font-extrabold text-emerald-700 mt-1">
              +{formatCurrency(data.netBudgetVariance)}
            </p>
            <span className="text-[10px] text-emerald-600">Favorable Variance</span>
          </div>

          <div className="rounded-lg bg-indigo-50/60 p-3.5 border border-indigo-100">
            <span className="text-[11px] font-semibold text-indigo-800">Estimate at Completion (EAC)</span>
            <p className="text-lg font-extrabold text-indigo-700 mt-1">
              {formatCurrency(data.estimateAtCompletion)}
            </p>
            <span className="text-[10px] text-indigo-600">Forecasted Total Cost</span>
          </div>
        </div>

        {/* EVM Indices Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="rounded-lg border border-surface-border p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-ink-700">Cost Performance Index (CPI)</span>
              <p className="text-[11px] text-ink-500">Earned Value vs Actual Cost Ratio</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-emerald-600">{cpi}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Cost Efficient (&gt; 1.0)
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-surface-border p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-ink-700">Schedule Performance Index (SPI)</span>
              <p className="text-[11px] text-ink-500">Earned Value vs Planned Value Ratio</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-rose-600">{spi}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                Behind Schedule (&lt; 1.0)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Quality & Defect Resolution Governance */}
      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink-900">Quality, Defect Governance &amp; Delay Risks</h3>
              <p className="text-xs text-ink-500">Snags, Non-Conformance Reports (NCR) and Critical Site Blockers</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            {resolutionRate}% Resolved
          </span>
        </div>

        {/* Quality Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100">
            <span className="text-[11px] font-semibold text-ink-500">Total Issues Logged</span>
            <p className="text-lg font-extrabold text-ink-900 mt-1">
              {data.totalIssuesReported ?? 0}
            </p>
            <span className="text-[10px] text-ink-400">Total NCRs &amp; Snags</span>
          </div>

          <div className="rounded-lg bg-amber-50/60 p-3.5 border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-800">Open Snags</span>
            <p className="text-lg font-extrabold text-amber-700 mt-1">
              {data.openSnagsCount ?? 0}
            </p>
            <span className="text-[10px] text-amber-600">Minor Punchlist Items</span>
          </div>

          <div className="rounded-lg bg-rose-50/60 p-3.5 border border-rose-100">
            <span className="text-[11px] font-semibold text-rose-800">Active NCRs</span>
            <p className="text-lg font-extrabold text-rose-700 mt-1">
              {data.activeNcrsCount ?? 0}
            </p>
            <span className="text-[10px] text-rose-600">Non-Conformance</span>
          </div>

          <div className="rounded-lg bg-rose-100/60 p-3.5 border border-rose-200">
            <span className="text-[11px] font-semibold text-rose-900">Critical Blockers</span>
            <p className="text-lg font-extrabold text-rose-800 mt-1">
              {data.criticalBlockersCount ?? 0}
            </p>
            <span className="text-[10px] text-rose-700">Halting Critical Path</span>
          </div>
        </div>

        {/* Delay Impact Footer */}
        <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Cumulative Site Delay Impact: <strong>{data.totalSiteDelayDays ?? 5} Days</strong></span>
          </div>
          <span className="font-semibold text-amber-800">
            Overdue Issues: {data.overdueIssuesCount ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}
