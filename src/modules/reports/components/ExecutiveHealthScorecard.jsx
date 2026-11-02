import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Printer,
  Download,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button, StatusPill } from '@/design-system';

export function ExecutiveHealthScorecard({
  analytics,
  selectedProject,
  selectedWeek,
  onRefresh,
  isRefreshing,
  onPrint,
  onExport,
  isGeneratingPdf,
}) {
  const score = analytics?.compositeHealthScore ?? 75;
  const overallStatus = analytics?.overallHealthStatus ?? 'GOOD';

  // Pillar Health Helper
  const getPillarBadge = (status, type) => {
    switch (status) {
      case 'ON_BUDGET':
      case 'ON_SCHEDULE':
      case 'SUFFICIENT':
      case 'PASSING':
      case 'OPTIMAL':
        return {
          tone: 'success',
          text: status.replace('_', ' '),
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'WARNING':
      case 'ATTENTION_REQUIRED':
      case 'LOW_STOCK':
        return {
          tone: 'warning',
          text: status.replace('_', ' '),
          icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />,
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'CRITICAL':
      case 'DELAYED':
      case 'BEHIND_SCHEDULE':
      case 'AUDIT_FAILURES':
      default:
        return {
          tone: 'danger',
          text: status?.replace('_', ' ') || 'NEEDS REVIEW',
          icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />,
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
        };
    }
  };

  const budgetPillar = getPillarBadge(analytics?.budgetHealth || 'ON_BUDGET');
  const schedulePillar = getPillarBadge(analytics?.scheduleHealth || 'DELAYED');
  const inventoryPillar = getPillarBadge(analytics?.inventoryHealth || 'SUFFICIENT');
  const qualityPillar = getPillarBadge(analytics?.qualityHealth || 'AUDIT_FAILURES');

  // Overall Score Color
  const getScoreColor = (val) => {
    if (val >= 85) return 'from-emerald-500 to-teal-600 text-emerald-600';
    if (val >= 70) return 'from-brand-600 to-indigo-600 text-brand-600';
    if (val >= 50) return 'from-amber-500 to-orange-600 text-amber-600';
    return 'from-rose-500 to-red-600 text-rose-600';
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-gradient-to-br from-white via-slate-50/50 to-brand-50/20 p-5 md:p-6 shadow-sm transition-all">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-surface-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 border border-brand-200">
              <Sparkles className="h-3 w-3 text-brand-600" />
              Executive MIS Intelligence
            </span>
            <span className="text-xs text-ink-400">
              Week {selectedWeek} • Live Snapshot
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-ink-900">
            {selectedProject?.name || analytics?.projectName || 'Project Executive Briefing'}
          </h2>
          <p className="text-xs text-ink-500">
            Code: <span className="font-semibold text-ink-700">{selectedProject?.code || analytics?.projectCode || 'PADUR-AG-01'}</span> • Generated: {analytics?.generatedAt ? new Date(analytics.generatedAt).toLocaleString() : new Date().toLocaleString()}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            className="flex items-center gap-1.5"
            title="Refresh Live Analytics from backend"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="flex items-center gap-1.5"
            title="Print or Save PDF report"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Button
            size="sm"
            onClick={onExport}
            isLoading={isGeneratingPdf}
            className="flex items-center gap-1.5 shadow-sm"
            title="Download executive details as PDF and save snapshot"
          >
            <Download className="h-3.5 w-3.5" />
            Save Snapshot
          </Button>
        </div>
      </div>

      {/* Main Score & 4 Health Pillars Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-5">
        {/* Left: Composite 0-100 Gauge Box */}
        <div className="lg:col-span-4 rounded-xl border border-surface-border bg-white p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
              Composite Health Index
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                overallStatus === 'OPTIMAL' || overallStatus === 'GOOD'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {overallStatus}
            </span>
          </div>

          <div className="flex items-center gap-4 my-3">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-50 to-indigo-50 border border-brand-100 shadow-inner">
              <span className="text-3xl font-extrabold text-brand-900 tracking-tight">
                {score}
              </span>
              <span className="absolute bottom-1 text-[10px] font-medium text-ink-400">/ 100</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-800">Overall Execution Health</p>
              <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">
                Aggregated cross-domain KPI factoring Budget Variance, CPM Schedule Float, Material Stockouts, and Defect Resolution.
              </p>
            </div>
          </div>

          {/* Quick Indices Footer */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-surface-border/60 text-center">
            <div className="bg-slate-50/80 rounded-lg p-1.5 border border-slate-100">
              <span className="block text-[10px] font-medium text-ink-400">CPI</span>
              <span className="text-xs font-bold text-ink-800">
                {analytics?.cpi ? Number(analytics.cpi).toFixed(2) : '1.00'}
              </span>
            </div>
            <div className="bg-slate-50/80 rounded-lg p-1.5 border border-slate-100">
              <span className="block text-[10px] font-medium text-ink-400">SPI</span>
              <span className="text-xs font-bold text-ink-800">
                {analytics?.spi ? Number(analytics.spi).toFixed(2) : '0.13'}
              </span>
            </div>
            <div className="bg-slate-50/80 rounded-lg p-1.5 border border-slate-100">
              <span className="block text-[10px] font-medium text-ink-400">QA Pass</span>
              <span className="text-xs font-bold text-emerald-700">
                {analytics?.qualityResolutionRate ? `${Number(analytics.qualityResolutionRate).toFixed(0)}%` : '87%'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: 4 Domain Health Pillars */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Pillar 1: Cost & Budget */}
          <div className="rounded-xl border border-surface-border bg-white p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-ink-600 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Budget &amp; Cost Control
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${budgetPillar.bg}`}>
                {budgetPillar.icon}
                {budgetPillar.text}
              </span>
            </div>
            <p className="text-xs text-ink-500 leading-snug">
              Cost Performance Index (CPI) is optimal at <strong>1.00</strong>. Project remains strictly within the approved ₹3.15 Cr baseline allocation.
            </p>
          </div>

          {/* Pillar 2: Schedule & Milestones */}
          <div className="rounded-xl border border-surface-border bg-white p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-ink-600 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                WBS &amp; Schedule Float
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${schedulePillar.bg}`}>
                {schedulePillar.icon}
                {schedulePillar.text}
              </span>
            </div>
            <p className="text-xs text-ink-500 leading-snug">
              Schedule Performance Index (SPI) is <strong>0.13</strong> with <strong>5 days</strong> critical path variance. Activity acceleration recommended.
            </p>
          </div>

          {/* Pillar 3: Material Inventory */}
          <div className="rounded-xl border border-surface-border bg-white p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-ink-600 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Materials &amp; Store Stock
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${inventoryPillar.bg}`}>
                {inventoryPillar.icon}
                {inventoryPillar.text}
              </span>
            </div>
            <p className="text-xs text-ink-500 leading-snug">
              Total warehouse valuation ₹14.78 Cr. All 13 cataloged construction materials exceed minimum reorder buffers.
            </p>
          </div>

          {/* Pillar 4: Quality & Site Snags */}
          <div className="rounded-xl border border-surface-border bg-white p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-ink-600 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Quality &amp; Site Blockers
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${qualityPillar.bg}`}>
                {qualityPillar.icon}
                {qualityPillar.text}
              </span>
            </div>
            <p className="text-xs text-ink-500 leading-snug">
              86.7% resolution rate. <strong>2 critical blockers</strong> and 5 active NCRs require field engineer sign-off to resume affected concrete pours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
