import { useState, useMemo } from 'react';
import {
  Activity,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Award,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Cpu,
  Building2,
  Gauge,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Button, StatusPill } from '@/design-system';

export function ProjectHealthIndexModule({ projectId = 1 }) {
  // Live Simulator Inputs for Executive "What-If" Sensitivity
  const [simSpi, setSimSpi] = useState(0.92);           // Schedule Performance Index (0.50 - 1.50)
  const [simCpi, setSimCpi] = useState(0.94);           // Cost Performance Index (0.50 - 1.50)
  const [simAvgDrs, setSimAvgDrs] = useState(48);       // Average Activity Delay Risk Score (0 - 100)
  const [simQualityClosure, setSimQualityClosure] = useState(76); // NCR Resolution % (0 - 100)
  const [simMaterialHealth, setSimMaterialHealth] = useState(68); // Material Stock Cover % (0 - 100)

  // Composite Project Health Index (PHI 0-100) Calculation (KPI-HLT-01)
  const phiResult = useMemo(() => {
    // 1. Schedule Health component (Weight: 30%)
    // Normalized to 0-100: SPI 1.0 = 100%, SPI 0.8 = 80%, capped at 100
    const rawSpi = parseFloat(simSpi) || 1.0;
    const s_spi = Math.min(100, Math.max(0, rawSpi * 100));
    const schedPoints = (0.30 * s_spi);

    // 2. Cost Health component (Weight: 25%)
    // Normalized: CPI 1.0 = 100%, CPI 0.9 = 90%, capped at 100
    const rawCpi = parseFloat(simCpi) || 1.0;
    const s_cpi = Math.min(100, Math.max(0, rawCpi * 100));
    const costPoints = (0.25 * s_cpi);

    // 3. Risk & Predecessor Health component (Weight: 20%)
    // Inverted DRS: High DRS (e.g. 70) means Low Health (30)
    const rawDrs = parseFloat(simAvgDrs) || 0;
    const s_risk = Math.max(0, 100 - rawDrs);
    const riskPoints = (0.20 * s_risk);

    // 4. Quality Closure Health component (Weight: 15%)
    const rawQlt = parseFloat(simQualityClosure) || 0;
    const qualityPoints = (0.15 * rawQlt);

    // 5. Material Inventory Health component (Weight: 10%)
    const rawMat = parseFloat(simMaterialHealth) || 0;
    const materialPoints = (0.10 * rawMat);

    // Composite PHI = Sum of weighted points
    const totalPhi = (schedPoints + costPoints + riskPoints + qualityPoints + materialPoints).toFixed(1);
    const numericPhi = parseFloat(totalPhi);

    let trafficLight = 'GREEN';
    let statusLabel = 'HEALTHY & ON TRACK';
    let statusTone = 'text-emerald-700 bg-emerald-50 border-emerald-300';
    let executiveAction = 'Operations performing within allowable baseline variances. Standard weekly review cadence.';

    if (numericPhi < 70) {
      trafficLight = 'RED';
      statusLabel = 'CRITICAL ATTENTION REQUIRED';
      statusTone = 'text-rose-800 bg-rose-50 border-rose-300';
      executiveAction = 'Immediate intervention required by Managing Director & Project Lead. Freeze scope deviations, expedite critical path materials, and inject weekend labour.';
    } else if (numericPhi < 85) {
      trafficLight = 'AMBER';
      statusLabel = 'NEEDS ATTENTION / MODERATE VARIANCE';
      statusTone = 'text-amber-800 bg-amber-50 border-amber-300';
      executiveAction = 'Monitor cost commitments and resolve open NCRs over 14 days old to recover to green benchmark.';
    }

    return {
      totalPhi,
      numericPhi,
      trafficLight,
      statusLabel,
      statusTone,
      executiveAction,
      breakdown: {
        schedule: { score: s_spi.toFixed(1), weighted: schedPoints.toFixed(1), weightPct: '30%' },
        cost: { score: s_cpi.toFixed(1), weighted: costPoints.toFixed(1), weightPct: '25%' },
        risk: { score: s_risk.toFixed(1), weighted: riskPoints.toFixed(1), weightPct: '20%' },
        quality: { score: rawQlt.toFixed(1), weighted: qualityPoints.toFixed(1), weightPct: '15%' },
        material: { score: rawMat.toFixed(1), weighted: materialPoints.toFixed(1), weightPct: '10%' },
      },
    };
  }, [simSpi, simCpi, simAvgDrs, simQualityClosure, simMaterialHealth]);

  // Pillar Contribution Chart Data
  const pillarChartData = useMemo(() => [
    { pillar: 'Schedule (SPI)', weighted: parseFloat(phiResult.breakdown.schedule.weighted), max: 30, color: '#3b82f6' },
    { pillar: 'Cost Control (CPI)', weighted: parseFloat(phiResult.breakdown.cost.weighted), max: 25, color: '#10b981' },
    { pillar: 'Float & Risk (DRS)', weighted: parseFloat(phiResult.breakdown.risk.weighted), max: 20, color: '#f59e0b' },
    { pillar: 'Quality / NCRs', weighted: parseFloat(phiResult.breakdown.quality.weighted), max: 15, color: '#8b5cf6' },
    { pillar: 'Material Inventory', weighted: parseFloat(phiResult.breakdown.material.weighted), max: 10, color: '#06b6d4' },
  ], [phiResult]);

  // Portfolio Multi-Project Comparison for Executive Overview
  const portfolioProjects = useMemo(() => [
    {
      code: 'PRJ-001',
      name: 'Ashok Grandeur, Padur',
      phi: 78.7,
      spi: 0.92,
      cpi: 0.94,
      drs: 48,
      status: 'AMBER',
      activeIssues: 14,
    },
    {
      code: 'PRJ-002',
      name: 'OMR Commercial Complex',
      phi: 89.2,
      spi: 1.04,
      cpi: 1.01,
      drs: 22,
      status: 'GREEN',
      activeIssues: 5,
    },
    {
      code: 'PRJ-003',
      name: 'ECR Seaside Villa Enclave',
      phi: 64.5,
      spi: 0.78,
      cpi: 0.88,
      drs: 72,
      status: 'RED',
      activeIssues: 26,
    },
    {
      code: 'PRJ-004',
      name: 'Sholinganallur Tech Park B',
      phi: 82.1,
      spi: 0.96,
      cpi: 0.98,
      drs: 38,
      status: 'AMBER',
      activeIssues: 9,
    },
  ], []);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: Module Identity & Formula Specifications */}
      <div className="rounded-xl border border-brand-200 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-3 py-1 rounded-full font-bold border border-emerald-500/40 flex items-center gap-1.5">
                <HeartPulse className="h-4 w-4" /> KPI-HLT-01 EXECUTIVE SPEC
              </span>
              <h2 className="text-xl font-black tracking-tight text-white">
                Project Health Index (PHI 0-100) Composite Score Engine
              </h2>
            </div>
            <p className="mt-2 text-xs text-slate-300 max-w-3xl leading-relaxed">
              Unified mathematical executive index synthesizing Schedule (SPI), Cost (CPI), Float &amp; Delay Risk (DRS), Quality NCR Ageing, and Material Shortage vulnerabilities into a single decision-grade metric.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`rounded-xl border px-5 py-3 text-right bg-slate-950/80 ${
              phiResult.numericPhi >= 85
                ? 'border-emerald-500/50'
                : phiResult.numericPhi >= 70
                ? 'border-amber-500/50'
                : 'border-rose-500/50'
            }`}>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Composite Health Score</span>
              <span className={`font-mono text-3xl font-black ${
                phiResult.numericPhi >= 85 ? 'text-emerald-400' : phiResult.numericPhi >= 70 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {phiResult.totalPhi} <span className="text-sm font-sans font-normal text-slate-400">/ 100</span>
              </span>
            </div>
          </div>
        </div>

        {/* 5 Core Domain Weighted Metric Pills */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Schedule Health (30%)</span>
            <span className="text-xl font-bold font-mono text-blue-400 mt-1 block">{phiResult.breakdown.schedule.weighted} pts</span>
            <span className="text-[10px] text-slate-500">SPI = {simSpi}</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Cost Health (25%)</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{phiResult.breakdown.cost.weighted} pts</span>
            <span className="text-[10px] text-slate-500">CPI = {simCpi}</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Risk &amp; Float (20%)</span>
            <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">{phiResult.breakdown.risk.weighted} pts</span>
            <span className="text-[10px] text-slate-500">DRS = {simAvgDrs}</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Quality NCRs (15%)</span>
            <span className="text-xl font-bold font-mono text-purple-400 mt-1 block">{phiResult.breakdown.quality.weighted} pts</span>
            <span className="text-[10px] text-slate-500">Closure = {simQualityClosure}%</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Material Inventory (10%)</span>
            <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">{phiResult.breakdown.material.weighted} pts</span>
            <span className="text-[10px] text-slate-500">Cover = {simMaterialHealth}%</span>
          </div>
        </div>
      </div>

      {/* Section 1: Executive Action Guidance Banner */}
      <div className={`rounded-xl border p-4 shadow-sm flex items-start gap-3.5 ${phiResult.statusTone}`}>
        <div className="mt-0.5">
          {phiResult.trafficLight === 'GREEN' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : phiResult.trafficLight === 'AMBER' ? (
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-rose-600" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs uppercase tracking-wider">{phiResult.statusLabel}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/10 font-bold">
              Score: {phiResult.totalPhi} / 100
            </span>
          </div>
          <p className="mt-1 text-xs font-medium leading-relaxed">{phiResult.executiveAction}</p>
        </div>
      </div>

      {/* Section 2: Interactive Sensitivity Simulator (Executive "What-If" Analysis) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-brand-600" /> Executive "What-If" Sensitivity Simulator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate operational impacts on project health: test recovery scenarios by improving SPI, CPI, or closing overdue NCRs.
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 font-semibold text-slate-700">
            Formula: PHI = 0.30&times;SPI + 0.25&times;CPI + 0.20&times;(100-DRS) + 0.15&times;QLT + 0.10&times;MAT
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-xs">
          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Schedule (SPI)</span>
              <span className="font-mono font-bold text-blue-700">{simSpi}</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="1.30"
              step="0.02"
              value={simSpi}
              onChange={(e) => setSimSpi(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Weight: 30%</span>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Cost (CPI)</span>
              <span className="font-mono font-bold text-emerald-700">{simCpi}</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="1.30"
              step="0.02"
              value={simCpi}
              onChange={(e) => setSimCpi(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Weight: 25%</span>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Delay Risk (DRS)</span>
              <span className="font-mono font-bold text-amber-700">{simAvgDrs}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simAvgDrs}
              onChange={(e) => setSimAvgDrs(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Weight: 20% (Inverted)</span>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Quality Closure</span>
              <span className="font-mono font-bold text-purple-700">{simQualityClosure}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simQualityClosure}
              onChange={(e) => setSimQualityClosure(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Weight: 15%</span>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Material Cover</span>
              <span className="font-mono font-bold text-cyan-700">{simMaterialHealth}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simMaterialHealth}
              onChange={(e) => setSimMaterialHealth(Number(e.target.value))}
              className="w-full accent-cyan-600"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Weight: 10%</span>
          </div>
        </div>
      </div>

      {/* Section 3: Visual Analytics: Weighted Pillar Points & Portfolio Benchmarks (NO GRIDLINES) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weighted Pillar Points Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Project Health Index Point Contribution (by Domain)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Points accrued toward total 100-point ceiling</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pillarChartData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                {/* STRICT USER MANDATE: ZERO CARTESIAN GRIDLINES */}
                <XAxis dataKey="pillar" fontSize={10} stroke="#64748b" tickLine={false} interval={0} angle={-10} textAnchor="end" />
                <YAxis fontSize={11} stroke="#64748b" tickLine={false} domain={[0, 35]} />
                <Tooltip
                  formatter={(val, _, item) => [`${val} / ${item.payload.max} pts`, 'Accrued Points']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="weighted" radius={[4, 4, 0, 0]}>
                  {pillarChartData.map((entry, idx) => (
                    <Cell key={`pillar-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Multi-Project Comparison */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enterprise Portfolio Project Health Matrix</h3>
              <p className="text-xs text-slate-500">Cross-project governance ranking across Chennai sites</p>
            </div>
            <Building2 className="h-4 w-4 text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="py-2 px-2.5 font-semibold">Project</th>
                  <th className="py-2 px-2.5 font-semibold text-center">PHI</th>
                  <th className="py-2 px-2.5 font-semibold text-center">SPI / CPI</th>
                  <th className="py-2 px-2.5 font-semibold text-center">DRS</th>
                  <th className="py-2 px-2.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {portfolioProjects.map((p) => (
                  <tr key={p.code} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-2.5 font-medium text-slate-900">
                      <span className="font-bold block">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{p.code}</span>
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-mono font-black text-sm">
                      <span className={p.phi >= 85 ? 'text-emerald-700' : p.phi >= 70 ? 'text-amber-700' : 'text-rose-700'}>
                        {p.phi}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-mono text-[11px] text-slate-700">
                      {p.spi} / {p.cpi}
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-mono text-slate-700 font-bold">
                      {p.drs}
                    </td>
                    <td className="py-2.5 px-2.5 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                          p.status === 'GREEN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'AMBER'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
