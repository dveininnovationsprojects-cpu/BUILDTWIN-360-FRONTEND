import React from 'react';
import {
  ShoppingCart,
  Users,
  Clock,
  DollarSign,
  Truck,
  CheckCircle2,
  FileCheck,
  Building2,
  Receipt,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '@/modules/projects/constants';

export function ProcurementLabourReportTab({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
        <p className="text-sm text-ink-500">Loading Procurement &amp; Labour Unified Report...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-surface-border">
        <p className="text-sm text-ink-500">No procurement or labour data available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Two Column Section: Left Procurement, Right Labour */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: Procurement & Vendor Commitments */}
        <div className="rounded-xl border border-surface-border bg-white p-5 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink-900">Procurement &amp; Vendor Commitments</h3>
                <p className="text-xs text-ink-500">PO liabilities, GRN fulfillment &amp; payables</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
              {data.totalPurchaseOrders ?? 0} Total POs
            </span>
          </div>

          {/* Key Financial Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-ink-500">Committed Amount</span>
              <p className="text-base font-extrabold text-ink-900 mt-1">
                {formatCurrency(data.totalCommittedAmount)}
              </p>
              <span className="text-[10px] text-ink-400">Issued PO Value</span>
            </div>

            <div className="rounded-lg bg-emerald-50/60 p-3 border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-800">Delivered GRN</span>
              <p className="text-base font-extrabold text-emerald-700 mt-1">
                {formatCurrency(data.totalIncurredGrnCost)}
              </p>
              <span className="text-[10px] text-emerald-600">Goods Incurred</span>
            </div>

            <div className="rounded-lg bg-amber-50/60 p-3 border border-amber-100">
              <span className="text-[11px] font-semibold text-amber-800">Outstanding Payables</span>
              <p className="text-base font-extrabold text-amber-700 mt-1">
                {formatCurrency(data.outstandingLiability)}
              </p>
              <span className="text-[10px] text-amber-600">Net Liability</span>
            </div>
          </div>

          {/* Activity Metrics Strip */}
          <div className="rounded-lg border border-surface-border/80 bg-white p-3 text-xs space-y-2">
            <div className="flex justify-between items-center text-ink-700">
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-ink-400" />
                Goods Received Notes (GRN) Logged
              </span>
              <span className="font-bold text-ink-900">{data.totalGrnReceiptsLogged ?? 0} Receipts</span>
            </div>
            <div className="flex justify-between items-center text-ink-700">
              <span className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-ink-400" />
                Open / In-Progress Commitment Orders
              </span>
              <span className="font-bold text-indigo-700">{data.openCommitmentOrdersCount ?? 0} Active</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: Contractor Labour & Payroll Governance */}
        <div className="rounded-xl border border-surface-border bg-white p-5 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink-900">Contractor Gangs &amp; Labour Deployment</h3>
                <p className="text-xs text-ink-500">Muster roll, trade hours &amp; wage liabilities</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-800 border border-brand-200">
              {data.activeContractorsCount ?? 0} Contractors
            </span>
          </div>

          {/* Key Labour Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-ink-500">Total Headcount</span>
              <p className="text-base font-extrabold text-ink-900 mt-1">
                {data.totalHeadcountDeployed ?? 0}
              </p>
              <span className="text-[10px] text-ink-400">Deployed Workers</span>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-ink-500">Standard / OT Hours</span>
              <p className="text-base font-extrabold text-ink-900 mt-1">
                {Number(data.totalStandardHours).toFixed(0)} <span className="text-xs text-amber-600">+{Number(data.totalOvertimeHours).toFixed(0)} OT</span>
              </p>
              <span className="text-[10px] text-ink-400">Logged Shifts</span>
            </div>

            <div className="rounded-lg bg-emerald-50/60 p-3 border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-800">Total Wage Accrual</span>
              <p className="text-base font-extrabold text-emerald-700 mt-1">
                {formatCurrency(data.totalLabourWageCost)}
              </p>
              <span className="text-[10px] text-emerald-600">Gross Payroll</span>
            </div>
          </div>

          {/* Activity Metrics Strip */}
          <div className="rounded-lg border border-surface-border/80 bg-white p-3 text-xs space-y-2">
            <div className="flex justify-between items-center text-ink-700">
              <span className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-ink-400" />
                Daily Attendance Shift Logs
              </span>
              <span className="font-bold text-ink-900">{data.totalDailyAttendanceLogs ?? 0} Shift Logs</span>
            </div>
            <div className="flex justify-between items-center text-ink-700">
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-ink-400" />
                Active Main &amp; Sub-contractor Directory
              </span>
              <span className="font-bold text-brand-700">{data.activeContractorsCount ?? 0} Active Firms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
