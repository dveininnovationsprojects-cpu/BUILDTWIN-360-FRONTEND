import { useState, useMemo } from 'react';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Award,
  Layers,
  Calculator,
  Calendar,
  FileCheck2,
  RefreshCw,
  BarChart2,
  Package,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { StatusPill, Button } from '@/design-system';

// Preset real vendor datasets for instant operational validation
const SUPPLIER_PRESETS = {
  concrete: {
    name: 'Chennai Ready-Mix Concrete Co.',
    category: 'RMC / Ready Mix',
    contractedLeadTime: 2, // 2 days SLA
    totalReceipts: 20,
    onTimeReceipts: 18,
    receivedUnits: 450, // m³
    acceptedUnits: 442,
    rejectedUnits: 8,
    unitCost: 4800,
    recentLeadTimes: [2, 2, 3, 2, 1, 2, 3, 2], // avg ~2.1 days
    leadTimeVarianceThreshold: 1, // days
  },
  steel: {
    name: 'Tata Tiscon Steel Depot',
    category: 'Structural Rebar',
    contractedLeadTime: 6, // 6 days SLA
    totalReceipts: 15,
    onTimeReceipts: 12,
    receivedUnits: 120, // MT
    acceptedUnits: 116.5,
    rejectedUnits: 3.5,
    unitCost: 65000,
    recentLeadTimes: [6, 7, 8, 6, 9, 7, 6, 8], // avg ~7.1 days
    leadTimeVarianceThreshold: 2,
  },
  cement: {
    name: 'UltraTech Cement Bulk Supply',
    category: 'Cement Bags',
    contractedLeadTime: 4, // 4 days SLA
    totalReceipts: 25,
    onTimeReceipts: 24,
    receivedUnits: 5000, // Bags
    acceptedUnits: 4960,
    rejectedUnits: 40,
    unitCost: 410,
    recentLeadTimes: [4, 4, 3, 5, 4, 4, 4, 4], // avg ~4.0 days
    leadTimeVarianceThreshold: 1,
  },
  sand: {
    name: 'Kaveri River Aggregates & Sand',
    category: 'Aggregates',
    contractedLeadTime: 3,
    totalReceipts: 18,
    onTimeReceipts: 13,
    receivedUnits: 6500, // CFT
    acceptedUnits: 6150,
    rejectedUnits: 350,
    unitCost: 70,
    recentLeadTimes: [3, 5, 4, 6, 3, 5, 4, 5], // avg ~4.4 days
    leadTimeVarianceThreshold: 1,
  },
};

export function ProcurementLeadTimeAnalyticsModule() {
  const [activeTab, setActiveTab] = useState('OTD'); // 'OTD' | 'REJECTION_LEADTIME' | 'DASHBOARD_SPEC'
  const [selectedKey, setSelectedKey] = useState('steel');

  const preset = SUPPLIER_PRESETS[selectedKey];

  // =========================================================================
  // 1. SUPPLIER ON-TIME DELIVERY % (OTD %) METRIC LOGIC (KPI-SUP-01)
  // =========================================================================
  const [totalOrders, setTotalOrders] = useState(preset.totalReceipts);
  const [onTimeOrders, setOnTimeOrders] = useState(preset.onTimeReceipts);
  const [targetSlaPct, setTargetSlaPct] = useState(90);

  const otdCalculation = useMemo(() => {
    const tot = parseFloat(totalOrders) || 1;
    const ont = parseFloat(onTimeOrders) || 0;
    const late = Math.max(0, tot - ont);
    const otdPct = ((ont / tot) * 100).toFixed(1);
    const numOtd = parseFloat(otdPct);
    const target = parseFloat(targetSlaPct) || 90;

    const varianceFromTarget = (numOtd - target).toFixed(1);
    const isCompliant = numOtd >= target;

    let tier = 'EXCELLENT';
    let tone = 'success';
    if (numOtd < 75) {
      tier = 'CRITICAL SLA BREACH';
      tone = 'danger';
    } else if (numOtd < 88) {
      tier = 'SLA WARNING';
      tone = 'warning';
    }

    return {
      otdPct,
      late,
      isCompliant,
      varianceFromTarget,
      tier,
      tone,
    };
  }, [totalOrders, onTimeOrders, targetSlaPct]);

  // =========================================================================
  // 2. SUPPLIER REJECTION RATE & AVERAGE LEAD TIME MODELS (KPI-SUP-02 & KPI-SUP-03)
  // =========================================================================
  const [receivedQty, setReceivedQty] = useState(preset.receivedUnits);
  const [rejectedQty, setRejectedQty] = useState(preset.rejectedUnits);
  const [unitCost, setUnitCost] = useState(preset.unitCost);
  const [qaTolerancePct, setQaTolerancePct] = useState(2.0);

  // Lead Time inputs
  const [contractedLeadTime, setContractedLeadTime] = useState(preset.contractedLeadTime);
  const [recentLeadTimes, setRecentLeadTimes] = useState([...preset.recentLeadTimes]);

  const rejectionCalculation = useMemo(() => {
    const rec = parseFloat(receivedQty) || 1;
    const rej = parseFloat(rejectedQty) || 0;
    const cost = parseFloat(unitCost) || 0;
    const tol = parseFloat(qaTolerancePct) || 2.0;

    const accepted = Math.max(0, rec - rej);
    const rejectionPct = ((rej / rec) * 100).toFixed(2);
    const rupeeDefectLoss = (rej * cost).toFixed(0);
    const numRej = parseFloat(rejectionPct);
    const isExceeded = numRej > tol;

    let severity = 'COMPLIANT';
    if (numRej > 5.0) {
      severity = 'CRITICAL DEFECT RATE';
    } else if (isExceeded) {
      severity = 'TOLERANCE EXCEEDED';
    }

    return {
      accepted: accepted.toFixed(1),
      rejectionPct,
      rupeeDefectLoss,
      isExceeded,
      severity,
      excessOverTol: (numRej - tol).toFixed(2),
    };
  }, [receivedQty, rejectedQty, unitCost, qaTolerancePct]);

  const leadTimeModel = useMemo(() => {
    const times = recentLeadTimes.map((t) => parseFloat(t) || 0);
    const sum = times.reduce((a, b) => a + b, 0);
    const avg = times.length ? (sum / times.length).toFixed(1) : '0.0';
    const numAvg = parseFloat(avg);
    const contracted = parseFloat(contractedLeadTime) || 1;
    const slippage = (numAvg - contracted).toFixed(1);
    const isDelayed = numAvg > contracted;

    // Variance index
    const varianceRatio = contracted > 0 ? (((numAvg - contracted) / contracted) * 100).toFixed(0) : '0';

    return {
      avgLeadTime: avg,
      slippage,
      isDelayed,
      varianceRatio,
      min: times.length ? Math.min(...times) : 0,
      max: times.length ? Math.max(...times) : 0,
    };
  }, [recentLeadTimes, contractedLeadTime]);

  // =========================================================================
  // 3. PROCUREMENT LEAD-TIME ANALYSIS & DASHBOARD SPEC
  // =========================================================================
  // Cross-supplier lead time comparison table
  const crossSupplierDashboard = useMemo(() => {
    return Object.entries(SUPPLIER_PRESETS).map(([key, data]) => {
      const avgLt = (data.recentLeadTimes.reduce((a, b) => a + b, 0) / data.recentLeadTimes.length).toFixed(1);
      const varDays = (parseFloat(avgLt) - data.contractedLeadTime).toFixed(1);
      const otd = ((data.onTimeReceipts / data.totalReceipts) * 100).toFixed(0);
      const rejRate = ((data.rejectedUnits / data.receivedUnits) * 100).toFixed(1);

      return {
        key,
        name: data.name,
        category: data.category,
        contracted: data.contractedLeadTime,
        actualAvg: avgLt,
        variance: varDays,
        otd: `${otd}%`,
        rejectionRate: `${rejRate}%`,
        status: parseFloat(varDays) > 1.5 ? 'CRITICAL DELAY' : parseFloat(varDays) > 0 ? 'MINOR SLIPPAGE' : 'ON SCHEDULE',
      };
    });
  }, []);

  const handleApplyPreset = (key) => {
    setSelectedKey(key);
    const p = SUPPLIER_PRESETS[key];
    setTotalOrders(p.totalReceipts);
    setOnTimeOrders(p.onTimeReceipts);
    setReceivedQty(p.receivedUnits);
    setRejectedQty(p.rejectedUnits);
    setUnitCost(p.unitCost);
    setContractedLeadTime(p.contractedLeadTime);
    setRecentLeadTimes([...p.recentLeadTimes]);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header Banner */}
      <div className="rounded-xl border border-brand-200 bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950 text-white p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" /> PROCUREMENT & SUPPLIER INTELLIGENCE ENGINE
              </span>
              <h2 className="text-xl font-bold text-white">Supplier OTD, Rejection & Lead-Time Analysis Suite</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Real-time mathematical models for vendor delivery reliability, quality rejection rates, and supply cycle lead-time velocity.
            </p>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold px-2">Sample Vendor:</span>
            {Object.keys(SUPPLIER_PRESETS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleApplyPreset(key)}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  selectedKey === key
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {key === 'concrete' ? 'RMC Concrete' : key === 'steel' ? 'Tata Rebar' : key === 'cement' ? 'UltraTech' : 'River Sand'}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Core Tabs matching user screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('OTD')}
            className={`flex items-center gap-2.5 p-3 rounded-lg text-left transition-all border ${
              activeTab === 'OTD'
                ? 'bg-brand-600/30 border-brand-400 text-white shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="p-2 rounded bg-emerald-500/20 text-emerald-300">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-mono text-emerald-300 font-bold">Model 01 • KPI-SUP-01</div>
              <div className="text-xs font-bold leading-tight mt-0.5">Supplier On-Time Delivery % (OTD %) Metric Logic</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REJECTION_LEADTIME')}
            className={`flex items-center gap-2.5 p-3 rounded-lg text-left transition-all border ${
              activeTab === 'REJECTION_LEADTIME'
                ? 'bg-brand-600/30 border-brand-400 text-white shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="p-2 rounded bg-amber-500/20 text-amber-300">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-mono text-amber-300 font-bold">Model 02 • KPI-SUP-02 & 03</div>
              <div className="text-xs font-bold leading-tight mt-0.5">Supplier Rejection Rate & Average Lead Time Models</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DASHBOARD_SPEC')}
            className={`flex items-center gap-2.5 p-3 rounded-lg text-left transition-all border ${
              activeTab === 'DASHBOARD_SPEC'
                ? 'bg-brand-600/30 border-brand-400 text-white shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="p-2 rounded bg-brand-500/20 text-brand-300">
              <BarChart2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-mono text-brand-300 font-bold">Model 03 • Lead-Time Spec</div>
              <div className="text-xs font-bold leading-tight mt-0.5">Procurement Lead-Time Analysis & Dashboard Spec</div>
            </div>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: SUPPLIER ON-TIME DELIVERY % (OTD %) METRIC LOGIC */}
      {/* ==================================================================== */}
      {activeTab === 'OTD' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" /> On-Time Delivery (OTD %) Compliance Simulator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evaluates vendor delivery punctuality comparing GRN physical receipt timestamps against PO contractual due dates.
                </p>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                KPI-SUP-01 Rule
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Total PO Consignments Received</label>
                <input
                  type="number"
                  value={totalOrders}
                  onChange={(e) => setTotalOrders(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">Total recorded GRN shipments</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">On-Time Deliveries (GRN ≤ PO Due)</label>
                <input
                  type="number"
                  value={onTimeOrders}
                  onChange={(e) => setOnTimeOrders(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">Delivered on or before agreed date</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target SLA Benchmark (%)</label>
                <input
                  type="number"
                  value={targetSlaPct}
                  onChange={(e) => setTargetSlaPct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">Contractual SLA minimum threshold</span>
              </div>
            </div>

            {/* Delivery Performance Breakdown */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Consignment Dispatch Ledger:</span>
                <span className="font-mono text-slate-600">Late Deliveries: <strong className="text-rose-600">{otdCalculation.late} Orders</strong></span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${otdCalculation.otdPct}%` }} />
                <div className="bg-rose-500 h-full" style={{ width: `${100 - parseFloat(otdCalculation.otdPct)}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> On-Time: {onTimeOrders} Orders ({otdCalculation.otdPct}%)
                </span>
                <span className="text-rose-700 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Delayed: {otdCalculation.late} Orders ({(100 - parseFloat(otdCalculation.otdPct)).toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Formula Explainer */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-950 font-mono space-y-1">
              <span className="font-bold block">Mathematical Proof:</span>
              <div>Supplier OTD % = (On-time Receipts [{onTimeOrders}] / Total Receipts [{totalOrders}]) × 100</div>
              <div className="font-bold text-emerald-700">➔ Computed OTD = {otdCalculation.otdPct}% (Target SLA: {targetSlaPct}%)</div>
            </div>
          </div>

          {/* Right Col: OTD Result & SLA Enforcement */}
          <div className="bg-slate-950 text-white rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Punctuality Score</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  otdCalculation.isCompliant
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {otdCalculation.tier}
                </span>
              </div>

              <div className="mt-4 text-center p-4 bg-slate-900/90 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Supplier On-Time Delivery Rate</div>
                <div className={`text-4xl font-black font-mono mt-1 ${otdCalculation.isCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {otdCalculation.otdPct}%
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-1">
                  SLA Benchmark: <span className="font-mono font-bold">{targetSlaPct}%</span> | Variance: {otdCalculation.varianceFromTarget}%
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vendor Status:</span>
                  <span className="font-bold text-white">{preset.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery SLA Compliance:</span>
                  <span className={`font-mono font-bold ${otdCalculation.isCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {otdCalculation.isCompliant ? 'SLA MET' : 'PENALTY APPLIED'}
                  </span>
                </div>
              </div>

              <div className={`mt-3 p-3 rounded-lg border text-xs ${
                otdCalculation.isCompliant
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-800 text-rose-200'
              }`}>
                <span className="font-bold block mb-0.5">Procurement Protocol:</span>
                {otdCalculation.isCompliant
                  ? 'Vendor meets prime tier reliability standards. Eligible for annual preferred framework renewal.'
                  : 'SLA violation logged. Issue formal notice to supplier and re-route secondary order volume to alternative vendors.'}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Automated Vendor Action:</span>
              <span className="font-bold text-brand-300">
                {otdCalculation.isCompliant ? 'Approve Preferred Allocation' : 'Enforce Delay LD Clause'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: SUPPLIER REJECTION RATE & AVERAGE LEAD TIME MODELS */}
      {/* ==================================================================== */}
      {activeTab === 'REJECTION_LEADTIME' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Sub-Model 2A: Supplier Rejection Rate Model */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-600" /> Supplier Material Rejection Rate Model
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Measures defect percentage during gate QA inspection and quantifies direct scrap replacement cost.
                  </p>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
                  KPI-SUP-02
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Received Units</label>
                  <input
                    type="number"
                    value={receivedQty}
                    onChange={(e) => setReceivedQty(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rejected Defective Units</label>
                  <input
                    type="number"
                    value={rejectedQty}
                    onChange={(e) => setRejectedQty(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Material Unit Rate (₹)</label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">QA Rejection Tolerance (%)</label>
                  <input
                    type="number"
                    value={qaTolerancePct}
                    onChange={(e) => setQaTolerancePct(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Readout Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Calculated Rejection Rate</span>
                  <div className={`text-3xl font-black font-mono mt-0.5 ${rejectionCalculation.isExceeded ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {rejectionCalculation.rejectionPct}%
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Direct Financial Defect Loss: <strong className="text-rose-600 font-mono">₹ {parseInt(rejectionCalculation.rupeeDefectLoss).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono border ${
                    rejectionCalculation.isExceeded
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {rejectionCalculation.severity}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-2 font-mono">
                    Tolerance: ≤ {qaTolerancePct}%
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-slate-300 rounded-lg p-3 text-xs font-mono border border-slate-800">
                Formula: ({rejectedQty} Rejected / {receivedQty} Received) × 100 = {rejectionCalculation.rejectionPct}%
              </div>
            </div>
          </div>

          {/* Sub-Model 2B: Average Lead Time Model */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brand-600" /> Historical Average Lead Time Model
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Calculates average cycle velocity from PO release to site GRN receipt across delivery history.
                  </p>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold border border-brand-200">
                  KPI-SUP-03
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contracted Lead Time SLA (Days)</label>
                  <input
                    type="number"
                    value={contractedLeadTime}
                    onChange={(e) => setContractedLeadTime(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Vendor agreed turnaround</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lead Time Variance Lag</label>
                  <div className={`w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-sm ${
                    leadTimeModel.isDelayed ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {leadTimeModel.isDelayed ? `+${leadTimeModel.slippage} Days Lag` : `${leadTimeModel.slippage} Days`}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Variance against contractual SLA</span>
                </div>
              </div>

              {/* Historical Lead Time Sequence Editor */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Recent Order Lead Times (Days):</span>
                  <span className="font-mono text-[11px] text-brand-600 font-bold">
                    Avg: {leadTimeModel.avgLeadTime} Days (Range: {leadTimeModel.min} - {leadTimeModel.max}d)
                  </span>
                </div>
                <div className="grid grid-cols-8 gap-1.5">
                  {recentLeadTimes.map((val, idx) => (
                    <div key={idx} className="bg-white p-1.5 rounded border border-slate-200 text-center">
                      <span className="text-[9px] text-slate-400 block">PO {idx + 1}</span>
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => {
                          const updated = [...recentLeadTimes];
                          updated[idx] = parseFloat(e.target.value) || 0;
                          setRecentLeadTimes(updated);
                        }}
                        className="w-full text-center font-mono font-bold text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 text-slate-300 rounded-lg p-3 text-xs font-mono border border-slate-800">
                Formula: Avg Lead Time = ({recentLeadTimes.join(' + ')}) / {recentLeadTimes.length} = {leadTimeModel.avgLeadTime} Days
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: PROCUREMENT LEAD-TIME ANALYSIS & DASHBOARD SPEC */}
      {/* ==================================================================== */}
      {activeTab === 'DASHBOARD_SPEC' && (
        <div className="space-y-5">
          {/* Key KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block">Average Lead Time Across Vendors</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">4.4 Days</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Contract SLA Benchmark: 3.8d</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block">Worst Lead-Time Slippage</span>
              <div className="text-2xl font-black text-rose-600 font-mono mt-1">+1.8 Days</div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Tata Tiscon Rebar Supply</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block">Portfolio Average OTD</span>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-1">87.5%</div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Target SLA Minimum: 85%</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block">Total Rejection Rate</span>
              <div className="text-2xl font-black text-amber-600 font-mono mt-1">2.4%</div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Within 2.5% allowance</span>
            </div>
          </div>

          {/* Supplier Lead-Time Comparison Table Specification */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Vendor Contracted vs Actual Lead Time Specification Table</h3>
                <p className="text-xs text-slate-500 mt-0.5">Automated cross-vendor delivery duration analysis and schedule bottleneck risk detection.</p>
              </div>
              <span className="text-xs bg-brand-50 text-brand-700 font-bold px-2.5 py-1 rounded border border-brand-200 font-mono">
                Live Procurement Sync
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Supplier Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-center">Contracted SLA</th>
                    <th className="px-4 py-3 text-center">Actual Avg Lead Time</th>
                    <th className="px-4 py-3 text-center">Variance (Lag)</th>
                    <th className="px-4 py-3 text-center">OTD %</th>
                    <th className="px-4 py-3 text-center">Rejection %</th>
                    <th className="px-4 py-3 text-right">Risk Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {crossSupplierDashboard.map((row) => (
                    <tr key={row.key} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">{row.name}</td>
                      <td className="px-4 py-3 text-slate-500">{row.category}</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-slate-700">{row.contracted} Days</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-900">{row.actualAvg} Days</td>
                      <td className={`px-4 py-3 text-center font-mono font-bold ${
                        parseFloat(row.variance) > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {parseFloat(row.variance) > 0 ? `+${row.variance}d` : `${row.variance}d`}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-emerald-600">{row.otd}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-700">{row.rejectionRate}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                          row.status === 'CRITICAL DELAY'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : row.status === 'MINOR SLIPPAGE'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Explanatory Footnote */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5 text-brand-600" /> Lead time measured from Purchase Order (PO) creation timestamp to first signed GRN.
              </span>
              <span className="font-semibold text-brand-700">Automatic Expedite Protocol: Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
