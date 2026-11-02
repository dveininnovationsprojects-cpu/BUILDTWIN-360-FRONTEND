import React, { useState } from 'react';
import { Modal, Button } from '@/design-system';
import { Printer, Download, FileText, CheckCircle2, AlertTriangle, Building2, Calendar, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/modules/projects/constants';
import { generateExecutiveReportPdf } from '../utils/reportPdfGenerator';

export function ReportExportModal({
  open,
  onClose,
  report,
  liveData,
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  if (!report && !liveData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await generateExecutiveReportPdf({
        project: { name: weekly?.projectName, code: weekly?.projectCode },
        weekNumber: weekly?.weekNumber || 10,
        analytics,
        weekly,
        inventory: inv,
        procLabour: proc,
        costQuality: cost,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const weekly = liveData?.weekly;
  const analytics = liveData?.analytics;
  const cost = liveData?.costQuality;
  const proc = liveData?.procLabour;
  const inv = liveData?.inventory;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={report?.name || 'Executive Comprehensive Project Dossier'}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-ink-500">
            BuildTwin 360 Certified Executive Record • Generated {new Date().toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              isLoading={isDownloading}
              className="flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button size="sm" onClick={handlePrint} className="flex items-center gap-1.5">
              <Printer className="h-4 w-4" />
              Print / Save
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-ink-900 p-2 print:p-0">
        {/* Printable Header */}
        <div className="border-b-2 border-brand-900 pb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-brand-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-700">
                BUILDTWIN 360 SITE INTELLIGENCE
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-ink-900 mt-1">
              {report?.name || 'Weekly Executive Portfolio S-Curve Progress Report'}
            </h1>
            <p className="text-xs text-ink-500 mt-0.5">
              Project: <strong className="text-ink-800">{weekly?.projectName || 'Ashok Grandeur - Padur, Chennai'}</strong> • Code: {weekly?.projectCode || 'PADUR-AG-01'}
            </p>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-800 border border-brand-200">
              OFFICIAL MIS DOSSIER
            </span>
            <p className="text-[11px] text-ink-400 mt-1 font-mono">
              Period: {report?.period || `Week ${weekly?.weekNumber || 10}`}
            </p>
          </div>
        </div>

        {/* Executive Score Summary Strip */}
        <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-surface-border">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Composite Health</span>
            <p className="text-xl font-extrabold text-brand-900">{analytics?.compositeHealthScore ?? 75}/100</p>
            <span className="text-[11px] font-semibold text-emerald-700">{analytics?.overallHealthStatus || 'GOOD'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Actual Milestone</span>
            <p className="text-xl font-extrabold text-ink-900">{weekly?.actualProgressPercentage ?? 14.36}%</p>
            <span className="text-[11px] font-semibold text-rose-600">Target: {weekly?.plannedProgressPercentage ?? 111.99}%</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Cost EVM (CPI)</span>
            <p className="text-xl font-extrabold text-emerald-700">{Number(weekly?.costPerformanceIndex ?? 1.0).toFixed(2)}</p>
            <span className="text-[11px] font-semibold text-ink-500">Under Budget</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Total Labour Headcount</span>
            <p className="text-xl font-extrabold text-ink-900">{weekly?.totalHeadcount ?? 272}</p>
            <span className="text-[11px] font-semibold text-ink-500">Across 10 Contractors</span>
          </div>
        </div>

        {/* Multi-Section Breakdown Table */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 border-b pb-1">
            Section 1: Milestone Progress &amp; WBS Execution
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg border border-surface-border space-y-1">
              <span className="font-semibold text-ink-600">Planned vs Actual Milestone:</span>
              <p className="text-sm font-bold text-ink-800">
                {weekly?.actualProgressPercentage ?? 14.36}% achieved vs {weekly?.plannedProgressPercentage ?? 111.99}% target
              </p>
              <p className="text-[11px] text-rose-600">
                Critical path lag: -{(Number(weekly?.plannedProgressPercentage ?? 111.99) - Number(weekly?.actualProgressPercentage ?? 14.36)).toFixed(1)}% ({weekly?.totalSiteDelayDays ?? 5} site delay days)
              </p>
            </div>
            <div className="p-3 rounded-lg border border-surface-border space-y-1">
              <span className="font-semibold text-ink-600">Schedule Performance Index (SPI):</span>
              <p className="text-sm font-bold text-rose-600">{Number(weekly?.schedulePerformanceIndex ?? 0.13).toFixed(2)}</p>
              <p className="text-[11px] text-ink-500">Recommendation: Accelerate tower superstructure concrete pours.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 border-b pb-1">
            Section 2: Cost Control, EVM &amp; Procurement Liabilities
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-surface-border">
              <span className="text-ink-500">Baseline Budget (BAC)</span>
              <p className="text-sm font-bold text-ink-900 mt-1">{formatCurrency(weekly?.baselineBudget)}</p>
            </div>
            <div className="p-3 rounded-lg border border-surface-border">
              <span className="text-ink-500">Forecasted EAC</span>
              <p className="text-sm font-bold text-brand-700 mt-1">{formatCurrency(weekly?.estimateAtCompletion)}</p>
            </div>
            <div className="p-3 rounded-lg border border-surface-border">
              <span className="text-ink-500">Net Budget Variance</span>
              <p className="text-sm font-bold text-emerald-700 mt-1">+{formatCurrency(weekly?.costVariance)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 border-b pb-1">
            Section 3: Material Store Valuation &amp; Manpower Hours
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-surface-border">
              <span className="text-ink-500">Inventory Valuation</span>
              <p className="text-sm font-bold text-ink-900 mt-1">{formatCurrency(inv?.totalInventoryValuation)}</p>
              <span className="text-[10px] text-emerald-600">{inv?.totalMaterialsCataloged ?? 13} cataloged materials</span>
            </div>
            <div className="p-3 rounded-lg border border-surface-border">
              <span className="text-ink-500">Weekly Labour Wages</span>
              <p className="text-sm font-bold text-ink-900 mt-1">{formatCurrency(weekly?.totalLabourCost)}</p>
              <span className="text-[10px] text-ink-500">{weekly?.totalStandardHours}h regular + {weekly?.totalOvertimeHours}h OT</span>
            </div>
            <div className="p-3 rounded-lg border border-surface-border">
              <span className="text-ink-500">Quality Resolution</span>
              <p className="text-sm font-bold text-amber-700 mt-1">{cost?.qualityResolutionPercentage ?? 86.7}% Resolved</p>
              <span className="text-[10px] text-rose-600">{weekly?.criticalBlockersCount ?? 2} Critical Blockers</span>
            </div>
          </div>
        </div>

        {/* Verification Signatures Strip */}
        <div className="pt-6 border-t border-surface-border grid grid-cols-2 gap-8 text-xs text-ink-500">
          <div>
            <div className="h-10 border-b border-dashed border-ink-300" />
            <p className="mt-1 font-semibold text-ink-700">Project Manager / Lead Engineer</p>
            <p className="text-[10px]">Verified on-site physical progress</p>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-ink-300" />
            <p className="mt-1 font-semibold text-ink-700">Director / Executive Sponsor</p>
            <p className="text-[10px]">Authorized executive review</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
