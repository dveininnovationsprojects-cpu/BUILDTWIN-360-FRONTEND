import { useState, useMemo } from 'react';
import {
  BrainCircuit,
  Calculator,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Layers,
  Scale,
  Zap,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  BarChart2,
  RefreshCw,
  FileCheck2,
} from 'lucide-react';
import { StatusPill, Button } from '@/design-system';

// Preset real construction project datasets for instant validation
const PRESETS = {
  cement: {
    name: 'OPC 53 Grade Cement (Store #1)',
    unit: 'Bags',
    stock: 120,
    reorderLevel: 200,
    dailyConsumptions: [28, 32, 30, 29, 35, 31, 25], // CR_7d = 30
    activityName: 'Padur PRJ-001 2nd Floor Slab Concreting',
    activityDays: 5,
    activityRequiredQty: 100,
    // Wastage preset
    issuedQty: 500,
    measuredQty: 485,
    returnedQty: 5,
    unitCost: 410,
    benchmarkPct: 2.0,
    // Risk scoring preset
    leadTimeDays: 6,
    isCriticalPath: true,
    supplierOtd: 75,
  },
  steel: {
    name: 'TMT Steel Rebar 12mm Fe550D',
    unit: 'MT',
    stock: 8.5,
    reorderLevel: 15.0,
    dailyConsumptions: [1.2, 1.5, 1.4, 1.6, 1.3, 1.5, 1.2], // avg ~1.38 MT/day
    activityName: 'Podium Beam & Column Rebar Fabrication',
    activityDays: 7,
    activityRequiredQty: 10.0,
    // Wastage preset
    issuedQty: 10.0,
    measuredQty: 9.4,
    returnedQty: 0.3,
    unitCost: 65000,
    benchmarkPct: 2.5,
    // Risk scoring preset
    leadTimeDays: 5,
    isCriticalPath: true,
    supplierOtd: 88,
  },
  sand: {
    name: 'Manufactured M-Sand (Fine Aggregate)',
    unit: 'CFT',
    stock: 2200,
    reorderLevel: 3000,
    dailyConsumptions: [400, 420, 390, 450, 410, 430, 400],
    activityName: 'Internal Block Masonry & Plastering',
    activityDays: 6,
    activityRequiredQty: 2500,
    // Wastage preset
    issuedQty: 3500,
    measuredQty: 3250,
    returnedQty: 50,
    unitCost: 65,
    benchmarkPct: 5.0,
    // Risk scoring preset
    leadTimeDays: 3,
    isCriticalPath: false,
    supplierOtd: 92,
  },
};

export function MaterialIntelligenceAnalyticsModule() {
  const [activeTab, setActiveTab] = useState('DEPLETION'); // 'DEPLETION' | 'WASTAGE' | 'SHORTAGE_RISK'
  const [selectedPresetKey, setSelectedPresetKey] = useState('cement');

  const preset = PRESETS[selectedPresetKey];

  // =========================================================================
  // 1. MATERIAL CONSUMPTION RATE & DEPLETION FORECAST MODEL (KPI-MAT-01)
  // =========================================================================
  const [stockBalance, setStockBalance] = useState(preset.stock);
  const [dailyConsumptions, setDailyConsumptions] = useState([...preset.dailyConsumptions]);
  const [plannedActivityName, setPlannedActivityName] = useState(preset.activityName);
  const [plannedDaysUntilActivity, setPlannedDaysUntilActivity] = useState(preset.activityDays);
  const [plannedActivityReqQty, setPlannedActivityReqQty] = useState(preset.activityRequiredQty);

  // Compute 7-day rolling consumption rate
  const rollingAvgDailyRate = useMemo(() => {
    const sum = dailyConsumptions.reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
    return (sum / (dailyConsumptions.length || 7)).toFixed(2);
  }, [dailyConsumptions]);

  // Days to Depletion = Current Stock / Rolling Daily Consumption
  const daysToDepletion = useMemo(() => {
    const rate = parseFloat(rollingAvgDailyRate);
    if (!rate || rate <= 0) return 999;
    return (parseFloat(stockBalance) / rate).toFixed(1);
  }, [stockBalance, rollingAvgDailyRate]);

  // Depletion Date Calculation
  const depletionInfo = useMemo(() => {
    const days = parseFloat(daysToDepletion);
    const now = new Date();
    const runoutDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const actDate = new Date(now.getTime() + plannedDaysUntilActivity * 24 * 60 * 60 * 1000);

    const isShortageBeforeActivity = days < plannedDaysUntilActivity;
    const residualAtActivity = parseFloat(stockBalance) - (parseFloat(rollingAvgDailyRate) * plannedDaysUntilActivity);
    const shortageDeficit = residualAtActivity - parseFloat(plannedActivityReqQty);

    return {
      runoutDateStr: runoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      activityDateStr: actDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isShortageBeforeActivity,
      shortageDeficit: shortageDeficit < 0 ? Math.abs(shortageDeficit).toFixed(1) : 0,
      residualStock: Math.max(0, residualAtActivity).toFixed(1),
    };
  }, [daysToDepletion, plannedDaysUntilActivity, stockBalance, rollingAvgDailyRate, plannedActivityReqQty]);

  // =========================================================================
  // 2. MATERIAL WASTAGE % FORMULA & LOSS MONITORING LOGIC (KPI-MAT-02)
  // =========================================================================
  const [issuedQty, setIssuedQty] = useState(preset.issuedQty);
  const [measuredQty, setMeasuredQty] = useState(preset.measuredQty);
  const [returnedQty, setReturnedQty] = useState(preset.returnedQty);
  const [unitCost, setUnitCost] = useState(preset.unitCost);
  const [benchmarkPct, setBenchmarkPct] = useState(preset.benchmarkPct);

  const wastageCalc = useMemo(() => {
    const iss = parseFloat(issuedQty) || 0;
    const meas = parseFloat(measuredQty) || 0;
    const ret = parseFloat(returnedQty) || 0;
    const cost = parseFloat(unitCost) || 0;
    const bench = parseFloat(benchmarkPct) || 0;

    const netConsumed = Math.max(0, iss - ret);
    const wastedQty = Math.max(0, netConsumed - meas);
    const wastagePct = iss > 0 ? ((wastedQty / iss) * 100).toFixed(2) : '0.00';
    const totalRupeeLoss = (wastedQty * cost).toFixed(0);
    const excessOverBench = (parseFloat(wastagePct) - bench).toFixed(2);
    const isExceeded = parseFloat(wastagePct) > bench;

    let auditSeverity = 'NORMAL';
    let advisory = 'Scrap level within acceptable technical cutting & lap allowance.';
    if (parseFloat(excessOverBench) > 2.0) {
      auditSeverity = 'CRITICAL';
      advisory = 'Anomalous scrap detected! Suspected site leakage, unmeasured damage, or pilferage. Immediate physical stock audit required.';
    } else if (isExceeded) {
      auditSeverity = 'WARNING';
      advisory = 'Wastage exceeds allowable benchmark. Optimize Bar Bending Schedule (BBS) and verify subcontractor handling.';
    }

    return {
      netConsumed: netConsumed.toFixed(2),
      wastedQty: wastedQty.toFixed(2),
      wastagePct,
      totalRupeeLoss,
      excessOverBench,
      isExceeded,
      auditSeverity,
      advisory,
    };
  }, [issuedQty, measuredQty, returnedQty, unitCost, benchmarkPct]);

  // =========================================================================
  // 3. LOW-STOCK & PROJECTED SHORTAGE RISK SCORING ENGINE (KPI-MAT-03)
  // =========================================================================
  const [riskStock, setRiskStock] = useState(preset.stock);
  const [riskReorderLevel, setRiskReorderLevel] = useState(preset.reorderLevel);
  const [riskDailyBurn, setRiskDailyBurn] = useState(rollingAvgDailyRate);
  const [riskLeadTime, setRiskLeadTime] = useState(preset.leadTimeDays);
  const [riskIsCriticalPath, setRiskIsCriticalPath] = useState(preset.isCriticalPath);
  const [riskSupplierOtd, setRiskSupplierOtd] = useState(preset.supplierOtd);

  const shortageRiskEngine = useMemo(() => {
    const curStock = parseFloat(riskStock) || 0;
    const reorder = parseFloat(riskReorderLevel) || 1;
    const burn = parseFloat(riskDailyBurn) || 1;
    const leadTime = parseFloat(riskLeadTime) || 1;
    const otd = parseFloat(riskSupplierOtd) || 0;

    // Factor 1: Buffer Deficit Score (0 - 100, 35% weight)
    const bufferDeficitRatio = Math.max(0, (reorder - curStock) / reorder);
    const bufferScore = Math.min(100, bufferDeficitRatio * 100);

    // Factor 2: Days of Cover vs Lead Time (0 - 100, 30% weight)
    const daysCover = burn > 0 ? curStock / burn : 999;
    let leadTimeRiskScore = 0;
    if (daysCover <= 0.5 * leadTime) {
      leadTimeRiskScore = 100;
    } else if (daysCover < leadTime) {
      leadTimeRiskScore = 80;
    } else if (daysCover <= 1.5 * leadTime) {
      leadTimeRiskScore = 35;
    } else {
      leadTimeRiskScore = 10;
    }

    // Factor 3: Critical Path Impact (0 - 100, 20% weight)
    const criticalScore = riskIsCriticalPath ? 100 : 25;

    // Factor 4: Supplier Delivery Risk (0 - 100, 15% weight)
    const supplierLateRisk = Math.max(0, 100 - otd);

    // Composite Weighted Calculation
    const compositeScore = (
      0.35 * bufferScore +
      0.30 * leadTimeRiskScore +
      0.20 * criticalScore +
      0.15 * supplierLateRisk
    ).toFixed(1);

    const numScore = parseFloat(compositeScore);

    let tier = 'LOW';
    let tone = 'success';
    let recommendation = 'Inventory balance healthy. Proceed with standard automated weekly batch replenishment.';
    if (numScore >= 80) {
      tier = 'CRITICAL SHORTAGE';
      tone = 'danger';
      recommendation = 'EMERGENCY ACTION: Lead time exceeds stock cover. Trigger immediate spot purchase order or site-to-site transfer to prevent work stoppage.';
    } else if (numScore >= 65) {
      tier = 'HIGH RISK';
      tone = 'warning';
      recommendation = 'PRIORITY REORDER: Stock will deplete within supplier lead time window. Release PO to secondary vetted vendor today.';
    } else if (numScore >= 40) {
      tier = 'MODERATE';
      tone = 'info';
      recommendation = 'MONITOR CLOSELY: Stock is nearing reorder threshold. Confirm scheduled delivery date with procurement.';
    }

    return {
      compositeScore,
      tier,
      tone,
      recommendation,
      daysCover: daysCover.toFixed(1),
      bufferScore: bufferScore.toFixed(0),
      leadTimeRiskScore: leadTimeRiskScore.toFixed(0),
      criticalScore: criticalScore.toFixed(0),
      supplierLateRisk: supplierLateRisk.toFixed(0),
      gapDays: (leadTime - daysCover).toFixed(1),
    };
  }, [riskStock, riskReorderLevel, riskDailyBurn, riskLeadTime, riskIsCriticalPath, riskSupplierOtd]);

  // Handle Preset Switching
  const applyPreset = (key) => {
    setSelectedPresetKey(key);
    const p = PRESETS[key];
    setStockBalance(p.stock);
    setDailyConsumptions([...p.dailyConsumptions]);
    setPlannedActivityName(p.activityName);
    setPlannedDaysUntilActivity(p.activityDays);
    setPlannedActivityReqQty(p.activityRequiredQty);

    setIssuedQty(p.issuedQty);
    setMeasuredQty(p.measuredQty);
    setReturnedQty(p.returnedQty);
    setUnitCost(p.unitCost);
    setBenchmarkPct(p.benchmarkPct);

    setRiskStock(p.stock);
    setRiskReorderLevel(p.reorderLevel);
    setRiskLeadTime(p.leadTimeDays);
    setRiskIsCriticalPath(p.isCriticalPath);
    setRiskSupplierOtd(p.supplierOtd);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner Header */}
      <div className="rounded-xl border border-brand-200 bg-gradient-to-r from-slate-950 via-brand-950 to-slate-900 text-white p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1">
                <BrainCircuit className="h-3.5 w-3.5" /> MATERIAL & INVENTORY INTELLIGENCE ENGINE
              </span>
              <h2 className="text-xl font-bold text-white">Advanced Depletion, Wastage & Shortage Risk Suite</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Fully interactive real-time mathematical models aligning with BuildTwin 360 Site Domain Rules and KPI Framework.
            </p>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold px-2">Preset Material:</span>
            {Object.keys(PRESETS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  selectedPresetKey === key
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {key === 'cement' ? 'Cement 53' : key === 'steel' ? 'Rebar 12mm' : 'M-Sand'}
              </button>
            ))}
          </div>
        </div>

        {/* The 3 Core Sub-Model Navigation Tabs matching the exact user screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('DEPLETION')}
            className={`flex items-center gap-2.5 p-3 rounded-lg text-left transition-all border ${
              activeTab === 'DEPLETION'
                ? 'bg-brand-600/30 border-brand-400 text-white shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="p-2 rounded bg-brand-500/20 text-brand-300">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-mono text-brand-300 font-bold">Model 01 • KPI-MAT-01</div>
              <div className="text-xs font-bold leading-tight mt-0.5">Material Consumption Rate & Depletion Forecast Model</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WASTAGE')}
            className={`flex items-center gap-2.5 p-3 rounded-lg text-left transition-all border ${
              activeTab === 'WASTAGE'
                ? 'bg-brand-600/30 border-brand-400 text-white shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="p-2 rounded bg-amber-500/20 text-amber-300">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-mono text-amber-300 font-bold">Model 02 • KPI-MAT-02</div>
              <div className="text-xs font-bold leading-tight mt-0.5">Material Wastage % Formula & Loss Monitoring Logic</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SHORTAGE_RISK')}
            className={`flex items-center gap-2.5 p-3 rounded-lg text-left transition-all border ${
              activeTab === 'SHORTAGE_RISK'
                ? 'bg-brand-600/30 border-brand-400 text-white shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="p-2 rounded bg-rose-500/20 text-rose-300">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-mono text-rose-300 font-bold">Model 03 • KPI-MAT-03</div>
              <div className="text-xs font-bold leading-tight mt-0.5">Low-Stock & Projected Shortage Risk Scoring Engine</div>
            </div>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: MATERIAL CONSUMPTION RATE & DEPLETION FORECAST MODEL */}
      {/* ==================================================================== */}
      {activeTab === 'DEPLETION' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Cols: Interactive Parameter Inputs */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-brand-600" /> Rolling Daily Consumption & Stock Depletion Simulator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculates CR₇d velocity and projects exact run-out date against upcoming schedule activities.
                </p>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold border border-brand-200">
                Formula: Days = Stock / CR₇d
              </span>
            </div>

            {/* Current Stock & Target Activity Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Current Usable Stock ({preset.unit})
                </label>
                <input
                  type="number"
                  value={stockBalance}
                  onChange={(e) => setStockBalance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">Store verified usable inventory</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Upcoming Planned Activity
                </label>
                <input
                  type="text"
                  value={plannedActivityName}
                  onChange={(e) => setPlannedActivityName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs font-medium focus:bg-white focus:border-brand-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">WBS critical milestone</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Activity Execution In (Days)
                </label>
                <input
                  type="number"
                  value={plannedDaysUntilActivity}
                  onChange={(e) => setPlannedDaysUntilActivity(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">Date: {depletionInfo.activityDateStr}</span>
              </div>
            </div>

            {/* 7-Day Rolling Consumption Breakdown */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" /> Rolling 7-Day Historical Daily Issue Log ({preset.unit}/day):
                </span>
                <span className="font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  Rolling CR₇d = {rollingAvgDailyRate} {preset.unit}/day
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2 pt-1">
                {dailyConsumptions.map((val, idx) => (
                  <div key={idx} className="bg-white p-2 rounded border border-slate-200 text-center">
                    <span className="block text-[10px] text-slate-400 font-medium">Day {idx + 1}</span>
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => {
                        const updated = [...dailyConsumptions];
                        updated[idx] = parseFloat(e.target.value) || 0;
                        setDailyConsumptions(updated);
                      }}
                      className="w-full text-center font-mono font-bold text-xs text-slate-900 mt-0.5 focus:outline-none border-b border-transparent focus:border-brand-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Formula & Rule Governance Summary */}
            <div className="bg-brand-50/70 border border-brand-200 rounded-lg p-3 text-xs text-brand-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5 text-brand-600" /> Mathematical Rule Alignment:
              </div>
              <p className="text-[11px] text-brand-800 font-mono">
                CR₇d = ({dailyConsumptions.join(' + ')}) / 7 = {rollingAvgDailyRate} {preset.unit}/day
              </p>
              <p className="text-[11px] text-brand-800 font-mono">
                Days to Runout = Current Stock ({stockBalance}) / {rollingAvgDailyRate} = {daysToDepletion} Days
              </p>
            </div>
          </div>

          {/* Right Col: Live Forecast Readout & Alert Engine */}
          <div className="bg-slate-950 text-white rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inventory Depletion Velocity</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  depletionInfo.isShortageBeforeActivity
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {depletionInfo.isShortageBeforeActivity ? 'DEFICIT ALERT' : 'BUFFER HEALTHY'}
                </span>
              </div>

              <div className="mt-4 text-center p-4 bg-slate-900/90 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Stock Exhaustion In</div>
                <div className="text-4xl font-black text-white font-mono mt-1 flex items-center justify-center gap-1">
                  <span className={parseFloat(daysToDepletion) < 5 ? 'text-rose-400' : 'text-emerald-400'}>
                    {daysToDepletion}
                  </span>
                  <span className="text-lg font-normal text-slate-400">Days</span>
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-1">
                  Depletion Date: <span className="text-white font-mono font-bold">{depletionInfo.runoutDateStr}</span>
                </div>
              </div>

              {/* Status Comparison Card */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="p-3 rounded-lg border bg-slate-900 border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Planned Activity Date:</span>
                    <span className="font-mono font-bold text-white">{depletionInfo.activityDateStr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stock at Activity Start:</span>
                    <span className={`font-mono font-bold ${depletionInfo.isShortageBeforeActivity ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {depletionInfo.residualStock} {preset.unit}
                    </span>
                  </div>
                  {depletionInfo.isShortageBeforeActivity && (
                    <div className="flex justify-between border-t border-slate-800 pt-1 text-rose-400">
                      <span className="font-semibold">Projected Shortage Deficit:</span>
                      <span className="font-mono font-bold">-{depletionInfo.shortageDeficit} {preset.unit}</span>
                    </div>
                  )}
                </div>

                {depletionInfo.isShortageBeforeActivity ? (
                  <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-lg text-rose-200 text-xs flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">CRITICAL SITE ALERT:</span>
                      Material will run out {plannedDaysUntilActivity - parseFloat(daysToDepletion)} days before {plannedActivityName}. Work stoppage predicted!
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-lg text-emerald-200 text-xs flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">BUFFER SATISFIED:</span>
                      Stock covers planned activity requirements with {parseFloat(daysToDepletion) - plannedDaysUntilActivity} days surplus.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Automated Action:</span>
              <span className="font-bold text-brand-300">
                {depletionInfo.isShortageBeforeActivity ? 'Dispatch Emergency Purchase Order' : 'Standard Routine Reorder'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: MATERIAL WASTAGE % FORMULA & LOSS MONITORING LOGIC */}
      {/* ==================================================================== */}
      {activeTab === 'WASTAGE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Cols: Wastage Inputs & Site Audit */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Scale className="h-4 w-4 text-amber-600" /> Material Wastage Variance & Site Loss Engine
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reconciles material issues against physical measured installation to detect leakage and unapproved scrap.
                </p>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                KPI-MAT-02 Formula
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Total Issued Qty ({preset.unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={issuedQty}
                  onChange={(e) => setIssuedQty(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">Store issue vouchers</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Measured Installed ({preset.unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={measuredQty}
                  onChange={(e) => setMeasuredQty(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">Surveyor certified work</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Returned Store Balance ({preset.unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={returnedQty}
                  onChange={(e) => setReturnedQty(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">Unused reusable returns</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Benchmark Limit (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={benchmarkPct}
                  onChange={(e) => setBenchmarkPct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">Max allowable scrap</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Unit Cost Rate (₹ / {preset.unit})
                </label>
                <input
                  type="number"
                  value={unitCost}
                  onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Scrap Breakdown:</span>
                <div className="flex justify-between text-slate-600">
                  <span>Net Consumed:</span>
                  <span className="font-mono font-bold text-slate-900">{wastageCalc.netConsumed} {preset.unit}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Calculated Wasted Quantity:</span>
                  <span className="font-mono font-bold text-rose-600">{wastageCalc.wastedQty} {preset.unit}</span>
                </div>
              </div>
            </div>

            {/* Formula Explainer */}
            <div className="bg-slate-900 text-slate-200 rounded-lg p-3 text-xs font-mono border border-slate-800 space-y-1">
              <span className="text-brand-300 font-bold block">Mathematical Proof:</span>
              <div>Wastage % = ((Issued [{issuedQty}] - Measured [{measuredQty}] - Returned [{returnedQty}]) / Issued [{issuedQty}]) × 100</div>
              <div className="text-emerald-300 font-bold">➔ Computed Wastage = {wastageCalc.wastagePct}% (Benchmark Threshold: {benchmarkPct}%)</div>
            </div>
          </div>

          {/* Right Col: Financial Loss & Audit Verdict */}
          <div className="bg-slate-950 text-white rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scrap Variance Verdict</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  wastageCalc.isExceeded
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {wastageCalc.isExceeded ? 'EXCESS WASTAGE' : 'WITHIN TOLERANCE'}
                </span>
              </div>

              <div className="mt-4 text-center p-4 bg-slate-900/90 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Wastage Percentage</div>
                <div className={`text-4xl font-black font-mono mt-1 ${wastageCalc.isExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {wastageCalc.wastagePct}%
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-1">
                  Threshold: <span className="font-mono font-bold">{benchmarkPct}%</span> | Variance: {wastageCalc.isExceeded ? `+${wastageCalc.excessOverBench}%` : `${wastageCalc.excessOverBench}%`}
                </div>
              </div>

              {/* Financial Rupee Loss */}
              <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Direct Financial Loss:</span>
                  <span className="font-mono text-base font-black text-rose-400">₹ {parseInt(wastageCalc.totalRupeeLoss).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Wasted Scrap Volume:</span>
                  <span className="font-mono font-bold text-slate-200">{wastageCalc.wastedQty} {preset.unit}</span>
                </div>
              </div>

              {/* Advisory Box */}
              <div className={`mt-3 p-3 rounded-lg border text-xs ${
                wastageCalc.auditSeverity === 'CRITICAL'
                  ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                  : wastageCalc.auditSeverity === 'WARNING'
                  ? 'bg-amber-950/60 border-amber-800 text-amber-200'
                  : 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
              }`}>
                <span className="font-bold block mb-0.5">Auditor Advisory:</span>
                {wastageCalc.advisory}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Corrective Protocol:</span>
              <span className="font-bold text-brand-300">{wastageCalc.isExceeded ? 'Mandate Subcontractor BBS Re-Check' : 'Standard Closure'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: LOW-STOCK & PROJECTED SHORTAGE RISK SCORING ENGINE */}
      {/* ==================================================================== */}
      {activeTab === 'SHORTAGE_RISK' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Cols: Risk Factor Weightage Simulator */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-600" /> Multi-Factor Shortage Risk Scoring Algorithm
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evaluates 4 critical operational drivers to synthesize a real-time 0–100 Shortage Risk Index.
                </p>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                KPI-MAT-03 Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Current Stock ({preset.unit})
                </label>
                <input
                  type="number"
                  value={riskStock}
                  onChange={(e) => setRiskStock(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Reorder Level Buffer ({preset.unit})
                </label>
                <input
                  type="number"
                  value={riskReorderLevel}
                  onChange={(e) => setRiskReorderLevel(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Daily Burn Rate ({preset.unit}/day)
                </label>
                <input
                  type="number"
                  value={riskDailyBurn}
                  onChange={(e) => setRiskDailyBurn(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Supplier Delivery Lead Time (Days)
                </label>
                <input
                  type="number"
                  value={riskLeadTime}
                  onChange={(e) => setRiskLeadTime(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Supplier On-Time Reliability (%)
                </label>
                <input
                  type="number"
                  max="100"
                  min="0"
                  value={riskSupplierOtd}
                  onChange={(e) => setRiskSupplierOtd(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Feeds Critical Path Activity?
                </label>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setRiskIsCriticalPath(true)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      riskIsCriticalPath
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    YES (High Severity)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRiskIsCriticalPath(false)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !riskIsCriticalPath
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    NO (Normal)
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Factor Contribution Breakdown Progress Bars */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">4 Risk Drivers Contribution Weight Breakdown:</span>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-600">1. Buffer Deficit Score (Weight: 35%):</span>
                    <span className="font-mono font-bold text-slate-900">{shortageRiskEngine.bufferScore}/100</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${shortageRiskEngine.bufferScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-600">2. Days of Cover vs Lead Time (Weight: 30%):</span>
                    <span className="font-mono font-bold text-slate-900">{shortageRiskEngine.leadTimeRiskScore}/100</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${shortageRiskEngine.leadTimeRiskScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-600">3. Critical Path Activity Impact (Weight: 20%):</span>
                    <span className="font-mono font-bold text-slate-900">{shortageRiskEngine.criticalScore}/100</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${shortageRiskEngine.criticalScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-600">4. Supplier Delivery Lateness Risk (Weight: 15%):</span>
                    <span className="font-mono font-bold text-slate-900">{shortageRiskEngine.supplierLateRisk}/100</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${shortageRiskEngine.supplierLateRisk}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Composite Score Gauge & Action Recommendation */}
          <div className="bg-slate-950 text-white rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shortage Risk Engine</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  shortageRiskEngine.tier === 'CRITICAL SHORTAGE'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : shortageRiskEngine.tier === 'HIGH RISK'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {shortageRiskEngine.tier}
                </span>
              </div>

              <div className="mt-4 text-center p-4 bg-slate-900/90 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Composite Shortage Risk Index</div>
                <div className={`text-4xl font-black font-mono mt-1 ${
                  parseFloat(shortageRiskEngine.compositeScore) >= 80
                    ? 'text-rose-400'
                    : parseFloat(shortageRiskEngine.compositeScore) >= 50
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}>
                  {shortageRiskEngine.compositeScore}
                  <span className="text-xl font-normal text-slate-500"> / 100</span>
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-1">
                  Days of Stock Left: <span className="font-mono font-bold text-white">{shortageRiskEngine.daysCover} Days</span>
                </div>
              </div>

              {/* Lead Time vs Cover Gap */}
              <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Supplier Lead Time:</span>
                  <span className="font-mono font-bold text-white">{riskLeadTime} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stock Runout In:</span>
                  <span className="font-mono font-bold text-amber-400">{shortageRiskEngine.daysCover} Days</span>
                </div>
                {parseFloat(shortageRiskEngine.gapDays) > 0 ? (
                  <div className="flex justify-between border-t border-slate-800 pt-1 text-rose-400 font-semibold">
                    <span>Critical Runout Window Gap:</span>
                    <span className="font-mono font-bold">-{shortageRiskEngine.gapDays} Days Gap!</span>
                  </div>
                ) : (
                  <div className="flex justify-between border-t border-slate-800 pt-1 text-emerald-400 font-semibold">
                    <span>Safety Buffer Margin:</span>
                    <span className="font-mono font-bold">+{Math.abs(parseFloat(shortageRiskEngine.gapDays))} Days Safety</span>
                  </div>
                )}
              </div>

              {/* Recommendation Banner */}
              <div className="mt-3 p-3 bg-brand-950/70 border border-brand-800/80 rounded-lg text-brand-200 text-xs">
                <span className="font-bold block text-white mb-1">Algorithmic Recommendation:</span>
                {shortageRiskEngine.recommendation}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Automated Action:</span>
              <span className="font-bold text-brand-300">
                {parseFloat(shortageRiskEngine.compositeScore) >= 70 ? 'Trigger Immediate PO Expedite' : 'Log Periodic Check'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
