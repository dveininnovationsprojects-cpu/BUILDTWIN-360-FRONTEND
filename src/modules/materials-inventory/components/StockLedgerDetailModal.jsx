import React from 'react';
import {
  Package,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Building,
  Layers,
  Calendar,
  Clock,
  IndianRupee,
  FileText,
  ShieldCheck,
  Tag,
  MapPin,
  ClipboardList,
  CheckCircle2,
  HardHat,
  Hash,
} from 'lucide-react';
import { Modal, Button } from '@/design-system';
import { UNIT_LABEL_MAP } from '../api/materialsInventoryApi';

const TYPE_CONFIG = {
  RECEIPT: {
    label: 'Receipt (Inward)',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    icon: ArrowUpRight,
    direction: 'Inward (+)',
    directionText: 'Inventory Addition to Store',
    isPositive: true,
  },
  ISSUE: {
    label: 'Issue (To Site)',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    icon: ArrowDownRight,
    direction: 'Outward (-)',
    directionText: 'Site Allocation / Handover',
    isPositive: false,
  },
  CONSUMPTION: {
    label: 'Consumption (On-site)',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    icon: ArrowDownRight,
    direction: 'Outward (-)',
    directionText: 'Work Package Utilization',
    isPositive: false,
  },
  WASTAGE: {
    label: 'Wastage / Scrap',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    icon: ArrowDownRight,
    direction: 'Outward (-)',
    directionText: 'Damage / Offcut / Scrap Write-off',
    isPositive: false,
  },
  RETURN: {
    label: 'Return To Store',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
    icon: ArrowUpRight,
    direction: 'Inward (+)',
    directionText: 'Unused Site Material Return',
    isPositive: true,
  },
  ADJUSTMENT: {
    label: 'Audit Adjustment',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    icon: RefreshCw,
    direction: 'Reconciled (±)',
    directionText: 'Physical Stock Count Reconciliation',
    isPositive: null,
  },
};

export function StockLedgerDetailModal({
  open,
  onClose,
  entry,
  materials = [],
  projects = [],
  wbsActivities = [],
  contractors = [],
}) {
  if (!entry) return null;

  // Resolve associated material
  const mat =
    entry.material ||
    materials.find((m) => String(m.id) === String(entry.materialId));

  const materialName = entry.materialName || mat?.name || `Material #${entry.materialId}`;
  const materialCode = entry.materialCode || mat?.materialCode || 'N/A';
  const category = mat?.category || 'General Materials';
  const unit = mat ? UNIT_LABEL_MAP[mat.unit] || mat.unit : 'Units';

  // Resolve associated project
  const project = projects.find((p) => String(p.id) === String(entry.projectId));
  const projectName = project ? `${project.code || `PROJ-${project.id}`} - ${project.name}` : `Project #${entry.projectId || '1'}`;

  // Resolve associated WBS Activity
  const activity = wbsActivities.find((w) => String(w.id) === String(entry.activityId));

  // Resolve associated contractor
  const contractor = contractors.find((c) => String(c.id) === String(entry.contractorId));

  // Movement config
  const typeCfg = TYPE_CONFIG[entry.transactionType] || {
    label: entry.transactionType || 'Transaction',
    badgeClass: 'bg-surface-subtle text-ink-700 border-surface-border',
    icon: ClipboardList,
    direction: 'Recorded',
    directionText: 'Inventory Movement',
    isPositive: null,
  };
  const TypeIcon = typeCfg.icon;

  // Formatted date and time
  const d = entry.timestamp ? new Date(entry.timestamp) : null;
  const isValidDate = d && !isNaN(d.getTime());
  const dateFormatted = isValidDate ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const timeFormatted = isValidDate ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  // Valuation
  const rate = Number(entry.unitPrice ?? mat?.standardRate ?? 0);
  const qty = Number(entry.quantity ?? 0);
  const totalValuation = rate * qty;

  const prefix = typeCfg.isPositive === true ? '+' : typeCfg.isPositive === false ? '-' : '';
  const qtyColor =
    typeCfg.isPositive === true
      ? 'text-emerald-600'
      : typeCfg.isPositive === false
      ? 'text-ink-900'
      : 'text-purple-600';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Stock Ledger Transaction Details"
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Immutable Append-Only Audit Entry #{entry.id}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Top Header Card: Transaction Summary Banner */}
        <div className="rounded-xl border border-surface-border bg-gradient-to-r from-surface-subtle via-surface-card to-surface-subtle p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 border border-brand-500/20 shadow-xs">
                <TypeIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${typeCfg.badgeClass}`}>
                    <TypeIcon className="h-3 w-3" />
                    {typeCfg.label}
                  </span>
                  <span className="font-mono text-xs font-semibold text-ink-500">
                    ID #{entry.id}
                  </span>
                </div>
                <h3 className="mt-1 text-base font-bold text-ink-900">
                  {materialName}
                </h3>
              </div>
            </div>

            {/* Quick Hero Numbers */}
            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                  Quantity
                </span>
                <span className={`font-mono text-xl font-black ${qtyColor}`}>
                  {prefix}{qty.toLocaleString()} {unit}
                </span>
              </div>
              {totalValuation > 0 && (
                <div className="border-l border-surface-border pl-4">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                    Total Value
                  </span>
                  <span className="font-mono text-xl font-black text-emerald-600">
                    ₹{totalValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 Detailed Information Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Card 1: Material & SKU Specifications */}
          <div className="flex flex-col justify-between rounded-xl border border-surface-border bg-surface-card p-4 shadow-xs transition-all hover:border-brand-200">
            <div>
              <div className="flex items-center justify-between border-b border-surface-border pb-2.5 mb-3">
                <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300">
                  <Package className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Material Specification
                  </h4>
                </div>
                <span className="rounded-md bg-surface-subtle px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-700 border border-surface-border">
                  {materialCode}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">Material Name</span>
                  <span className="font-semibold text-ink-900 text-right">{materialName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">Category</span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-ink-700">
                    <Tag className="h-3 w-3 mr-1 text-ink-400" />
                    {category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">Unit of Measure</span>
                  <span className="font-medium text-ink-800">{unit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">Standard Rate</span>
                  <span className="font-mono font-semibold text-ink-800">
                    {rate > 0 ? `₹${rate.toLocaleString()} / ${unit}` : 'Not Specified'}
                  </span>
                </div>
              </div>
            </div>

            {mat && (
              <div className="mt-3.5 pt-2.5 border-t border-surface-border flex items-center justify-between text-[11px]">
                <span className="text-ink-400">Current Catalog Stock</span>
                <span className="font-bold text-brand-700 dark:text-brand-300">
                  {Number(mat.currentStock).toLocaleString()} {unit}
                </span>
              </div>
            )}
          </div>

          {/* Card 2: Movement & Financial Valuation */}
          <div className="flex flex-col justify-between rounded-xl border border-surface-border bg-surface-card p-4 shadow-xs transition-all hover:border-emerald-200">
            <div>
              <div className="flex items-center justify-between border-b border-surface-border pb-2.5 mb-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <IndianRupee className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Movement & Valuation
                  </h4>
                </div>
                <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                  {typeCfg.direction}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">Movement Flow</span>
                  <span className="font-semibold text-ink-900">{typeCfg.directionText}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">Quantity Transacted</span>
                  <span className={`font-mono font-bold text-sm ${qtyColor}`}>
                    {prefix}{qty.toLocaleString()} {unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">Applied Unit Price</span>
                  <span className="font-mono text-ink-800">
                    {rate > 0 ? `₹${rate.toLocaleString()}` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">Total Transaction Value</span>
                  <span className="font-mono font-bold text-sm text-emerald-600">
                    {totalValuation > 0 ? `₹${totalValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-surface-border flex items-center justify-between text-[11px]">
              <span className="text-ink-400">Inventory Balance Action</span>
              <span className="font-medium text-ink-700">
                {typeCfg.isPositive === true
                  ? 'Credited to On-hand Store'
                  : typeCfg.isPositive === false
                  ? 'Debited from Central Stock'
                  : 'Ledger Audit Adjustment'}
              </span>
            </div>
          </div>

          {/* Card 3: Site, WBS & Zone Allocation */}
          <div className="flex flex-col justify-between rounded-xl border border-surface-border bg-surface-card p-4 shadow-xs transition-all hover:border-indigo-200">
            <div>
              <div className="flex items-center justify-between border-b border-surface-border pb-2.5 mb-3">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                  <Building className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Site & Allocation Details
                  </h4>
                </div>
                <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-200">
                  Site Logistics
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-ink-500 shrink-0">Project</span>
                  <span className="font-medium text-ink-900 text-right">{projectName}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-ink-500 shrink-0">WBS Activity</span>
                  {activity ? (
                    <span className="font-semibold text-brand-700 dark:text-brand-300 text-right">
                      [{activity.code || activity.wbsCode}] {activity.name}
                    </span>
                  ) : entry.activityId ? (
                    <span className="font-medium text-ink-700">WBS Package #{entry.activityId}</span>
                  ) : (
                    <span className="text-ink-400">General Stock Intake (Not Tagged)</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">Zone / Tower</span>
                  <span className="font-medium text-ink-800">
                    {entry.zone || 'Central Warehouse'}
                  </span>
                </div>
                {entry.contractorId && (
                  <div className="flex items-center justify-between">
                    <span className="text-ink-500">Issued To Contractor</span>
                    <span className="inline-flex items-center text-ink-800 font-medium">
                      <HardHat className="h-3 w-3 mr-1 text-ink-400" />
                      {contractor ? (contractor.contractorName || contractor.name || contractor.companyName) : `Contractor #${entry.contractorId}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-surface-border flex items-center justify-between text-[11px]">
              <span className="text-ink-400">Location Tag</span>
              <span className="inline-flex items-center gap-1 text-ink-700 font-medium">
                <MapPin className="h-3 w-3 text-red-500" />
                {entry.zone ? `Zone: ${entry.zone}` : 'Central Yard / Store'}
              </span>
            </div>
          </div>

          {/* Card 4: Audit Verification, References & Notes */}
          <div className="flex flex-col justify-between rounded-xl border border-surface-border bg-surface-card p-4 shadow-xs transition-all hover:border-amber-200">
            <div>
              <div className="flex items-center justify-between border-b border-surface-border pb-2.5 mb-3">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <FileText className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Audit Verification & Notes
                  </h4>
                </div>
                <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">Reference / Challan No.</span>
                  <span className="font-mono font-bold text-ink-900">
                    {entry.referenceId || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">Date Logged</span>
                  <span className="inline-flex items-center gap-1 text-ink-800 font-medium">
                    <Calendar className="h-3 w-3 text-ink-400" />
                    {dateFormatted}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">Time Logged</span>
                  <span className="inline-flex items-center gap-1 text-ink-800 font-medium">
                    <Clock className="h-3 w-3 text-ink-400" />
                    {timeFormatted}
                  </span>
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-ink-500">Remarks & Audit Notes:</span>
                  <p className="rounded-lg bg-surface-subtle p-2 text-xs text-ink-800 border border-surface-border leading-relaxed whitespace-pre-wrap">
                    {entry.remarks || 'No additional remarks logged for this stock movement.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-surface-border flex items-center justify-between text-[11px]">
              <span className="text-ink-400">Ledger Lock</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Immutable Entry
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
