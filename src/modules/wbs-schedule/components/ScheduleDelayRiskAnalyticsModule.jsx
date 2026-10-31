import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  TrendingDown,
  TrendingUp,
  Cpu,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Activity,
  ArrowRight,
  Flame,
  Truck,
  Users,
  Wrench,
  Milestone,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { Button, StatusPill } from '@/design-system';

export function ScheduleDelayRiskAnalyticsModule({ projectId = 1 }) {
  // Simulator State 1: Delay Risk Score Composite Engine (KPI-RSK-01)
  const [predScore, setPredScore] = useState(75); // 0-100 Predecessor late score
  const [matScore, setMatScore] = useState(85);  // 0-100 Material shortage score
  const [lbrScore, setLbrScore] = useState(60);  // 0-100 Labour muster deficit
  const [prodScore, setProdScore] = useState(40); // 0-100 Productivity underperformance
  const [qltScore, setQltScore] = useState(65);  // 0-100 Open NCR defect hold

  // Simulator State 2: Blocker Schedule Drag (KPI-RSK-02)
  const [blockerDuration, setBlockerDuration] = useState(6);
  const [totalFloat, setTotalFloat] = useState(2);
  const [isCriticalPath, setIsCriticalPath] = useState(true);

  // Simulator State 3: Forecast Completion Date (KPI-FCT-01)
  const [baselineRemainingDays, setBaselineRemainingDays] = useState(42);
  const [rollingSpi, setRollingSpi] = useState(0.85);
  const [weatherContingencyDays, setWeatherContingencyDays] = useState(4);

  // 1. Calculate Composite Delay Risk Score (DRS 0-100)
  const drsResult = useMemo(() => {
    const s_pred = parseFloat(predScore) || 0;
    const s_mat = parseFloat(matScore) || 0;
    const s_lbr = parseFloat(lbrScore) || 0;
    const s_prod = parseFloat(prodScore) || 0;
    const s_qlt = parseFloat(qltScore) || 0;

    // DRS Formula: 0.35 * S_pred + 0.25 * S_mat + 0.20 * S_lbr + 0.10 * S_prod + 0.10 * S_qlt
    const rawScore = 0.35 * s_pred + 0.25 * s_mat + 0.20 * s_lbr + 0.10 * s_prod + 0.10 * s_qlt;
    const drs = rawScore.toFixed(1);

    let riskTier = 'LOW';
    let riskBadgeTone = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    let recommendation = 'Schedule flow normal. Regular tracking.';

    if (rawScore >= 75) {
      riskTier = 'CRITICAL FAILURE RISK';
      riskBadgeTone = 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
      recommendation = 'Immediate recovery meeting required. Reallocate labor & expedite critical path materials.';
    } else if (rawScore >= 50) {
      riskTier = 'HIGH RISK';
      riskBadgeTone = 'bg-orange-100 text-orange-800 border-orange-300';
      recommendation = 'Monitor predecessor completion daily and confirm supplier delivery commit.';
    } else if (rawScore >= 30) {
      riskTier = 'MODERATE RISK';
      riskBadgeTone = 'bg-amber-100 text-amber-800 border-amber-300';
      recommendation = 'Minor variance observed. Ensure backup rebar delivery is queued.';
    }

    return { drs, riskTier, riskBadgeTone, recommendation };
  }, [predScore, matScore, lbrScore, prodScore, qltScore]);

  // 2. Calculate Blocker Schedule Drag on Critical Path
  const blockerDragResult = useMemo(() => {
    const bDuration = parseFloat(blockerDuration) || 0;
    const tFloat = parseFloat(totalFloat) || 0;
    const multiplier = isCriticalPath ? 1.0 : 0.4;
    const weightedBlocker = bDuration * multiplier;
    const netDragDays = Math.max(0, weightedBlocker - tFloat).toFixed(1);
    const floatRemaining = Math.max(0, tFloat - weightedBlocker).toFixed(1);

    return {
      netDragDays,
      floatRemaining,
      isMilestoneDelayed: parseFloat(netDragDays) > 0,
    };
  }, [blockerDuration, totalFloat, isCriticalPath]);

  // 3. Calculate Forecast Completion Date (FCD)
  const fcdResult = useMemo(() => {
    const baselineDays = parseFloat(baselineRemainingDays) || 1;
    const spi = Math.max(0.40, parseFloat(rollingSpi) || 1.0);
    const weather = parseFloat(weatherContingencyDays) || 0;
    const blockerDrag = parseFloat(blockerDragResult.netDragDays) || 0;

    // Adjusted Remaining Days = Baseline / Rolling SPI + Blocker Delays + Weather
    const adjustedRemainingDays = Math.round((baselineDays / spi) + blockerDrag + weather);
    const slippageDays = adjustedRemainingDays - baselineDays;

    const today = new Date();
    const baselineFinish = new Date(today);
    baselineFinish.setDate(baselineFinish.getDate() + baselineDays);

    const forecastFinish = new Date(today);
    forecastFinish.setDate(forecastFinish.getDate() + adjustedRemainingDays);

    return {
      adjustedRemainingDays,
      slippageDays,
      baselineFinishFormatted: baselineFinish.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
      forecastFinishFormatted: forecastFinish.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
      isDelayed: slippageDays > 0,
    };
  }, [baselineRemainingDays, rollingSpi, weatherContingencyDays, blockerDragResult]);

  // Sample WBS Critical Activities & Delay Risk Register (Padur Residence Site)
  const sampleWbsRiskRegister = useMemo(() => [
    {
      code: 'ACT-104',
      title: 'First Floor Slab Concreting & Post-Tensioning',
      wbsGroup: 'Superstructure / Structural Frame',
      plannedStart: '2026-10-22',
      plannedEnd: '2026-10-30',
      totalFloat: 0,
      isCritical: true,
      predStatus: 'Late (+3d on Beams)',
      matStatus: 'Cement Shortage (4d cover)',
      lbrStatus: '6 Bar Benders Deficit',
      drs: 78.5,
      riskLevel: 'CRITICAL',
      forecastEnd: '2026-11-08',
      slippageDays: 9,
    },
    {
      code: 'ACT-105',
      title: 'External AAC Block Masonry Grid A-D',
      wbsGroup: 'Masonry & Enclosure',
      plannedStart: '2026-10-28',
      plannedEnd: '2026-11-10',
      totalFloat: 4,
      isCritical: false,
      predStatus: 'On Track',
      matStatus: 'Stock Healthy (12d cover)',
      lbrStatus: 'Full Muster',
      drs: 28.0,
      riskLevel: 'LOW',
      forecastEnd: '2026-11-10',
      slippageDays: 0,
    },
    {
      code: 'ACT-106',
      title: 'Plumbing & Drainage Vertical Stack Riser Clamping',
      wbsGroup: 'MEP Services',
      plannedStart: '2026-11-02',
      plannedEnd: '2026-11-14',
      totalFloat: 1,
      isCritical: true,
      predStatus: 'Waiting Slab Deshuttering',
      matStatus: 'CPVC Pipes Delayed (+2d)',
      lbrStatus: '2 Plumbers Missing',
      drs: 62.5,
      riskLevel: 'HIGH',
      forecastEnd: '2026-11-18',
      slippageDays: 4,
    },
    {
      code: 'ACT-107',
      title: 'Podium Waterproofing Membrane Application',
      wbsGroup: 'Specialist Waterproofing',
      plannedStart: '2026-11-05',
      plannedEnd: '2026-11-18',
      totalFloat: 3,
      isCritical: false,
      predStatus: 'Surface Curing Active',
      matStatus: 'Primer Membrane at Site',
      lbrStatus: 'Subcontractor Mobilized',
      drs: 36.5,
      riskLevel: 'MODERATE',
      forecastEnd: '2026-11-20',
      slippageDays: 2,
    },
    {
      code: 'ACT-108',
      title: 'Second Floor Column Rebar & Shuttering',
      wbsGroup: 'Superstructure / Structural Frame',
      plannedStart: '2026-11-01',
      plannedEnd: '2026-11-09',
      totalFloat: 0,
      isCritical: true,
      predStatus: 'Blocked by ACT-104 Pour',
      matStatus: '20mm Fe550D Rebar Pending',
      lbrStatus: 'Carpenter Crew Shared',
      drs: 84.0,
      riskLevel: 'CRITICAL',
      forecastEnd: '2026-11-19',
      slippageDays: 10,
    },
  ], []);

  // Delay Driver Decomposition Chart Data
  const delayDriverChartData = useMemo(() => [
    { driver: 'Predecessor Cascading Lag (35%)', points: (0.35 * predScore).toFixed(1), color: '#ef4444' },
    { driver: 'Material Inventory Deficit (25%)', points: (0.25 * matScore).toFixed(1), color: '#f97316' },
    { driver: 'Labour Muster Deficit (20%)', points: (0.20 * lbrScore).toFixed(1), color: '#f59e0b' },
    { driver: 'Crew Productivity Drag (10%)', points: (0.10 * prodScore).toFixed(1), color: '#3b82f6' },
    { driver: 'Open Quality NCR Holds (10%)', points: (0.10 * qltScore).toFixed(1), color: '#8b5cf6' },
  ], [predScore, matScore, lbrScore, prodScore, qltScore]);

  // Milestone Waterfall Data
  const milestoneWaterfallData = useMemo(() => [
    { milestone: 'Baseline Days', days: baselineRemainingDays },
    { milestone: 'SPI Inefficiency Drag', days: Math.max(0, Math.round(baselineRemainingDays / rollingSpi - baselineRemainingDays)) },
    { milestone: 'Critical Blocker Drag', days: parseFloat(blockerDragResult.netDragDays) },
    { milestone: 'Weather / Buffer Contingency', days: weatherContingencyDays },
    { milestone: 'Total Adjusted Forecast', days: fcdResult.adjustedRemainingDays },
  ], [baselineRemainingDays, rollingSpi, blockerDragResult, weatherContingencyDays, fcdResult]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: Module Identity & Formula Specifications */}
      <div className="rounded-xl border border-brand-200 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 font-mono text-xs px-3 py-1 rounded-full font-bold border border-amber-500/40 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> KPI-RSK-01, RSK-02 &amp; FCT-01
              </span>
              <h2 className="text-xl font-black tracking-tight text-white">
                WBS Blocker Impact, Delay Risk Score (DRS) &amp; Forecast Completion Engine
              </h2>
            </div>
            <p className="mt-2 text-xs text-slate-300 max-w-3xl leading-relaxed">
              Multi-driver statistical simulation modeling predecessor dependency slip, inventory runout, crew muster deficits, active critical path blockers, and statistical forecast project finish dates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2 text-right">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Composite Delay Risk</span>
              <span className="font-mono text-2xl font-black text-rose-400">{drsResult.drs} / 100</span>
            </div>
          </div>
        </div>

        {/* Real-time KPI Metric Summary Cards */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Current Delay Risk</span>
            <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">{drsResult.drs}</span>
            <span className="text-[10px] text-rose-400 font-bold uppercase">{drsResult.riskTier}</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Critical Path Drag</span>
            <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">+{blockerDragResult.netDragDays} Days</span>
            <span className="text-[10px] text-slate-400">Direct milestone impact</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Rolling 14-Day SPI</span>
            <span className="text-xl font-bold font-mono text-blue-300 mt-1 block">{rollingSpi}</span>
            <span className="text-[10px] text-slate-400">Site progress velocity</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Baseline Finish Date</span>
            <span className="text-xl font-bold font-mono text-slate-300 mt-1 block">{fcdResult.baselineFinishFormatted}</span>
            <span className="text-[10px] text-slate-500">{baselineRemainingDays} days remaining</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Forecast Finish (FCD)</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{fcdResult.forecastFinishFormatted}</span>
            <span className="text-[10px] text-emerald-500/80">Statistically adjusted</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Project Slippage</span>
            <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">+{fcdResult.slippageDays} Days</span>
            <span className="text-[10px] text-rose-400">Variance vs baseline</span>
          </div>
        </div>
      </div>

      {/* Section 1: Multi-Driver Interactive Delay Risk Simulator (DRS Engine) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-brand-600" /> Multi-Driver Delay Risk Score Simulator (DRS 0-100 Engine)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust sensitivity sliders for predecessor lag, material stock deficit, labor attendance, crew productivity, and open defect holds.
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 font-semibold text-slate-700">
            Formula: DRS = 0.35&times;Pred + 0.25&times;Mat + 0.20&times;Lbr + 0.10&times;Prod + 0.10&times;Qlt
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sliders Grid */}
          <div className="lg:col-span-2 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Predecessor Activity Lag Risk (Weight: 35%)</span>
                <span className="font-mono font-bold text-rose-700">{predScore} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={predScore}
                onChange={(e) => setPredScore(Number(e.target.value))}
                className="w-full accent-rose-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Material Inventory Shortage Risk (Weight: 25%)</span>
                <span className="font-mono font-bold text-orange-700">{matScore} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={matScore}
                onChange={(e) => setMatScore(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Labour Muster &amp; Headcount Deficit (Weight: 20%)</span>
                <span className="font-mono font-bold text-amber-700">{lbrScore} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={lbrScore}
                onChange={(e) => setLbrScore(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Productivity Deficit (10%)</span>
                  <span className="font-mono font-bold text-blue-700">{prodScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={prodScore}
                  onChange={(e) => setProdScore(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Open NCR Defect Hold (10%)</span>
                  <span className="font-mono font-bold text-purple-700">{qltScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={qltScore}
                  onChange={(e) => setQltScore(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Result Gauge Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity Delay Vulnerability</span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono text-slate-900">{drsResult.drs}</span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase border ${drsResult.riskBadgeTone}`}>
                  {drsResult.riskTier}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-800 block mb-1">Algorithmic Recommendation:</span>
              <p className="text-slate-600 leading-relaxed">{drsResult.recommendation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Blocker Schedule Drag & Forecast Completion Date (FCD) Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blocker Schedule Drag Engine (KPI-RSK-02) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Issue &amp; Blocker Schedule Drag Engine
              </h3>
              <p className="text-xs text-slate-500">
                Calculates direct project finish date drag from open blockers &amp; stop-work notices
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              KPI-RSK-02
            </span>
          </div>

          <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Blocker Duration</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={blockerDuration}
                    onChange={(e) => setBlockerDuration(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-900"
                  />
                  <span className="text-slate-500 text-[11px]">Days</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Available Float</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={totalFloat}
                    onChange={(e) => setTotalFloat(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-900"
                  />
                  <span className="text-slate-500 text-[11px]">Days</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Critical Path?</label>
                <select
                  value={isCriticalPath ? 'YES' : 'NO'}
                  onChange={(e) => setIsCriticalPath(e.target.value === 'YES')}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-900"
                >
                  <option value="YES">Yes (100% Impact)</option>
                  <option value="NO">No (Non-Critical)</option>
                </select>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/80 p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-rose-900">Direct Schedule Drag on Project Finish:</span>
                <p className="text-xs text-rose-700">Formula: Max(0, Blocker Duration &times; Criticality - Total Float)</p>
              </div>
              <span className="text-xl font-black font-mono text-rose-700">
                +{blockerDragResult.netDragDays} Days
              </span>
            </div>
          </div>
        </div>

        {/* Forecast Completion Date (FCD) Model (KPI-FCT-01) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Forecast Completion Date (FCD) Model
              </h3>
              <p className="text-xs text-slate-500">
                Adjusts project finish for rolling SPI, blocker slippage, and weather contingency
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              KPI-FCT-01
            </span>
          </div>

          <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Baseline Remaining</label>
                <input
                  type="number"
                  min="5"
                  max="365"
                  value={baselineRemainingDays}
                  onChange={(e) => setBaselineRemainingDays(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Rolling 14d SPI</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.4"
                  max="1.5"
                  value={rollingSpi}
                  onChange={(e) => setRollingSpi(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Weather Buffer</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={weatherContingencyDays}
                  onChange={(e) => setWeatherContingencyDays(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50/80 p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-brand-900">Total Adjusted Remaining Days:</span>
                <p className="text-xs text-brand-700">Finish: <span className="font-bold">{fcdResult.forecastFinishFormatted}</span> (+{fcdResult.slippageDays}d Slippage)</p>
              </div>
              <span className="text-xl font-black font-mono text-brand-800">
                {fcdResult.adjustedRemainingDays} Days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Visual Analytics: Milestone Waterfall & Driver Decomposition (NO GRIDLINES) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delay Driver Contribution Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Delay Risk Driver Points Decomposition (Weighted DRS)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Relative contribution of each domain root-cause factor</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayDriverChartData} layout="vertical" margin={{ top: 5, right: 30, left: 160, bottom: 5 }}>
                {/* STRICT USER MANDATE: ZERO CARTESIAN GRIDLINES */}
                <XAxis type="number" fontSize={11} stroke="#64748b" tickLine={false} />
                <YAxis dataKey="driver" type="category" fontSize={10} stroke="#64748b" tickLine={false} width={150} />
                <Tooltip
                  formatter={(val) => [`${val} points`, 'Weighted Impact']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="points" radius={[0, 4, 4, 0]}>
                  {delayDriverChartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Milestone Slippage Waterfall */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Milestone Schedule Slippage Waterfall (Days)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Cumulative breakdown leading to final completion forecast</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={milestoneWaterfallData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                {/* ZERO GRIDLINES */}
                <XAxis dataKey="milestone" fontSize={10} stroke="#64748b" tickLine={false} interval={0} angle={-15} textAnchor="end" />
                <YAxis fontSize={11} stroke="#64748b" tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} Days`, 'Duration / Drag']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="days" fill="#2563eb" radius={[4, 4, 0, 0]}>
                  {milestoneWaterfallData.map((_, idx) => (
                    <Cell key={`bar-${idx}`} fill={idx === 4 ? '#059669' : idx === 0 ? '#64748b' : '#ea580c'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 4: Live WBS Activities Delay Risk Ledger */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Critical Path WBS Activities Delay Risk Register
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated across live predecessor dependencies, inventory cover, and crew productivity
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500">Padur Residence Master WBS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">Activity Code &amp; Title</th>
                <th className="py-2.5 px-3 font-semibold">WBS Work Package</th>
                <th className="py-2.5 px-3 font-semibold text-center">Float</th>
                <th className="py-2.5 px-3 font-semibold">Key Constraint Drivers</th>
                <th className="py-2.5 px-3 font-semibold text-center">DRS Score</th>
                <th className="py-2.5 px-3 font-semibold text-center">Risk Level</th>
                <th className="py-2.5 px-3 font-semibold text-right">Forecast Finish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sampleWbsRiskRegister.map((row) => (
                <tr key={row.code} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3 align-top font-mono">
                    <span className="font-bold text-brand-700 block">{row.code}</span>
                    <span className="font-sans font-semibold text-slate-900 block">{row.title}</span>
                  </td>
                  <td className="py-3 px-3 align-top text-slate-600">{row.wbsGroup}</td>
                  <td className="py-3 px-3 align-top text-center font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${row.totalFloat === 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                      {row.totalFloat === 0 ? '0d (Critical)' : `${row.totalFloat}d`}
                    </span>
                  </td>
                  <td className="py-3 px-3 align-top text-[11px] text-slate-600 space-y-0.5">
                    <p><span className="font-semibold text-slate-800">Pred:</span> {row.predStatus}</p>
                    <p><span className="font-semibold text-slate-800">Stock:</span> {row.matStatus}</p>
                    <p><span className="font-semibold text-slate-800">Crew:</span> {row.lbrStatus}</p>
                  </td>
                  <td className="py-3 px-3 align-top text-center font-mono font-black text-sm">
                    <span className={row.drs > 75 ? 'text-rose-600' : row.drs > 50 ? 'text-orange-600' : 'text-emerald-700'}>
                      {row.drs}
                    </span>
                  </td>
                  <td className="py-3 px-3 align-top text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.riskLevel === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : row.riskLevel === 'HIGH'
                          ? 'bg-orange-100 text-orange-800 border border-orange-300'
                          : row.riskLevel === 'MODERATE'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {row.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-3 align-top text-right font-mono">
                    <span className="font-bold text-slate-900 block">{row.forecastEnd}</span>
                    {row.slippageDays > 0 ? (
                      <span className="text-[10px] font-bold text-rose-600">+{row.slippageDays}d Slippage</span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600">On Time</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
