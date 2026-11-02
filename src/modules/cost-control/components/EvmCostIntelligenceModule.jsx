import { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info,
  Calendar,
  RefreshCw,
  Sliders,
  FileSpreadsheet,
  Download,
  Building2,
  HelpCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from 'recharts';
import { StatusPill, Button } from '@/design-system';

// Preset real construction work package datasets for PRJ-001 Padur Site
const WBS_PACKAGES_PRESET = [
  {
    id: 'wbs-1',
    code: 'WBS-1.1',
    category: 'Earthwork & Foundation Excavation',
    bac: 850000,
    pv: 850000,
    ev: 850000,
    ac: 810000,
    owner: 'Ramesh K. (Site Eng)',
  },
  {
    id: 'wbs-2',
    code: 'WBS-1.2',
    category: 'Substructure & Raft Concreting',
    bac: 1800000,
    pv: 1800000,
    ev: 1720000,
    ac: 1910000,
    owner: 'Sundar V. (QC / Site)',
  },
  {
    id: 'wbs-3',
    code: 'WBS-1.3',
    category: 'Superstructure RCC Columns & Slabs',
    bac: 3500000,
    pv: 2800000,
    ev: 2450000,
    ac: 2820000,
    owner: 'Murugan P. (Civil Lead)',
  },
  {
    id: 'wbs-4',
    code: 'WBS-1.4',
    category: 'AAC Blockwork & Brick Masonry',
    bac: 1400000,
    pv: 950000,
    ev: 1020000,
    ac: 960000,
    owner: 'Anand S. (Site Eng)',
  },
  {
    id: 'wbs-5',
    code: 'WBS-1.5',
    category: 'Electrical & Plumbing Rough-in (MEP)',
    bac: 1200000,
    pv: 600000,
    ev: 550000,
    ac: 590000,
    owner: 'Karthik R. (MEP Eng)',
  },
  {
    id: 'wbs-6',
    code: 'WBS-1.6',
    category: 'Internal & External Plastering',
    bac: 950000,
    pv: 300000,
    ev: 290000,
    ac: 280000,
    owner: 'Murugan P. (Civil Lead)',
  },
  {
    id: 'wbs-7',
    code: 'WBS-1.7',
    category: 'Vitrified Flooring & Wall Tiling',
    bac: 1500000,
    pv: 200000,
    ev: 180000,
    ac: 195000,
    owner: 'Sundar V. (Finishes)',
  },
];

// Helper to format Indian Rupee
const formatINR = (val) => {
  const num = Math.round(val);
  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
};

export function EvmCostIntelligenceModule() {
  const [activeTab, setActiveTab] = useState('CPI'); // 'CPI' | 'CV' | 'FAC'
  const [packages, setPackages] = useState(WBS_PACKAGES_PRESET);
  const [selectedWbsId, setSelectedWbsId] = useState('wbs-3');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // =========================================================================
  // MODEL 1: COST PERFORMANCE INDEX (CPI = EV / AC) SIMULATOR STATE
  // =========================================================================
  const selectedWbs = packages.find((p) => p.id === selectedWbsId) || packages[0];
  const [simEv, setSimEv] = useState(selectedWbs.ev);
  const [simAc, setSimAc] = useState(selectedWbs.ac);

  const cpiResult = useMemo(() => {
    const ev = parseFloat(simEv) || 0;
    const ac = parseFloat(simAc) || 0;
    if (ac === 0) {
      return { cpi: 1.0, status: 'On Budget', efficiencyPct: 100, costPerUnit: 1.0 };
    }
    const cpi = ev / ac;
    const efficiencyPct = (cpi * 100).toFixed(1);
    const costPerUnit = (1 / cpi).toFixed(2); // cost to deliver ₹1 of earned value
    let status = 'On Budget';
    let tone = 'info';
    if (cpi >= 1.05) {
      status = 'Under Budget (Highly Efficient)';
      tone = 'success';
    } else if (cpi >= 0.98) {
      status = 'On Budget (Target Achieved)';
      tone = 'info';
    } else if (cpi >= 0.9) {
      status = 'Slight Cost Overrun (Warning)';
      tone = 'warning';
    } else {
      status = 'Severe Cost Overrun (Critical Deficit)';
      tone = 'danger';
    }
    return {
      cpi: cpi.toFixed(3),
      rawCpi: cpi,
      status,
      tone,
      efficiencyPct,
      costPerUnit,
    };
  }, [simEv, simAc]);

  // =========================================================================
  // MODEL 2: BUDGET VARIANCE & COST VARIANCE (CV) ENGINE LOGIC
  // =========================================================================
  const [simBac, setSimBac] = useState(selectedWbs.bac);

  const cvEngineResult = useMemo(() => {
    const ev = parseFloat(simEv) || 0;
    const ac = parseFloat(simAc) || 0;
    const bac = parseFloat(simBac) || 0;

    const cv = ev - ac; // Cost Variance ($/₹)
    const cvPct = ev > 0 ? ((cv / ev) * 100).toFixed(2) : 0; // Cost Variance %
    const budgetVariance = bac - ac; // Budget Variance ($/₹ remaining budget)
    const budgetVariancePct = bac > 0 ? ((budgetVariance / bac) * 100).toFixed(1) : 0;

    const isFavorable = cv >= 0;
    let cvRating = 'FAVORABLE (Surplus)';
    let cvTone = 'success';
    if (cv < 0) {
      if (Math.abs(parseFloat(cvPct)) > 10) {
        cvRating = 'CRITICAL DEFICIT (> 10% Overrun)';
        cvTone = 'danger';
      } else {
        cvRating = 'MODERATE DEFICIT (Under 10% Overrun)';
        cvTone = 'warning';
      }
    }

    return {
      cv,
      cvPct,
      budgetVariance,
      budgetVariancePct,
      isFavorable,
      cvRating,
      cvTone,
    };
  }, [simEv, simAc, simBac]);

  // Sync simulator inputs when user switches selected WBS
  const handleSelectWbs = (pkg) => {
    setSelectedWbsId(pkg.id);
    setSimEv(pkg.ev);
    setSimAc(pkg.ac);
    setSimBac(pkg.bac);
  };

  // =========================================================================
  // MODEL 3: FORECAST AT COMPLETION (FAC) & EVM DASHBOARD SPEC
  // =========================================================================
  // Portfolio-wide EVM metrics calculated across all WBS packages
  const portfolioMetrics = useMemo(() => {
    let totalBac = 0;
    let totalPv = 0;
    let totalEv = 0;
    let totalAc = 0;

    const calculatedPackages = packages.map((pkg) => {
      totalBac += pkg.bac;
      totalPv += pkg.pv;
      totalEv += pkg.ev;
      totalAc += pkg.ac;

      const cpi = pkg.ac > 0 ? pkg.ev / pkg.ac : 1.0;
      const cv = pkg.ev - pkg.ac;
      const cvPct = pkg.ev > 0 ? ((cv / pkg.ev) * 100).toFixed(1) : 0;
      const fac = cpi > 0 ? pkg.bac / cpi : pkg.bac;
      const etc = Math.max(0, fac - pkg.ac);
      const vac = pkg.bac - fac;
      const vacPct = pkg.bac > 0 ? ((vac / pkg.bac) * 100).toFixed(1) : 0;
      const tcpi =
        pkg.bac - pkg.ac !== 0
          ? Math.max(0, (pkg.bac - pkg.ev) / (pkg.bac - pkg.ac)).toFixed(2)
          : '1.00';

      let status = 'On Track';
      let tone = 'info';
      if (cpi >= 1.02) {
        status = 'Cost Surplus';
        tone = 'success';
      } else if (cpi >= 0.95) {
        status = 'On Budget';
        tone = 'info';
      } else if (cpi >= 0.88) {
        status = 'Overrun Alert';
        tone = 'warning';
      } else {
        status = 'Critical Overrun';
        tone = 'danger';
      }

      return {
        ...pkg,
        cpi: cpi.toFixed(2),
        rawCpi: cpi,
        cv,
        cvPct,
        fac: Math.round(fac),
        etc: Math.round(etc),
        vac: Math.round(vac),
        vacPct,
        tcpi,
        status,
        tone,
      };
    });

    const portfolioCpi = totalAc > 0 ? totalEv / totalAc : 1.0;
    const portfolioCv = totalEv - totalAc;
    const portfolioCvPct = totalEv > 0 ? ((portfolioCv / totalEv) * 100).toFixed(1) : 0;
    const portfolioFac = portfolioCpi > 0 ? totalBac / portfolioCpi : totalBac;
    const portfolioEtc = Math.max(0, portfolioFac - totalAc);
    const portfolioVac = totalBac - portfolioFac;
    const portfolioVacPct = totalBac > 0 ? ((portfolioVac / totalBac) * 100).toFixed(1) : 0;
    const portfolioTcpi =
      totalBac - totalAc !== 0
        ? Math.max(0, (totalBac - totalEv) / (totalBac - totalAc)).toFixed(2)
        : '1.00';

    return {
      packages: calculatedPackages,
      totalBac,
      totalPv,
      totalEv,
      totalAc,
      portfolioCpi: portfolioCpi.toFixed(3),
      rawPortfolioCpi: portfolioCpi,
      portfolioCv,
      portfolioCvPct,
      portfolioFac: Math.round(portfolioFac),
      portfolioEtc: Math.round(portfolioEtc),
      portfolioVac: Math.round(portfolioVac),
      portfolioVacPct,
      portfolioTcpi,
    };
  }, [packages]);

  // Chart dataset for Cost Variance across WBS packages
  const chartData = useMemo(() => {
    return portfolioMetrics.packages.map((pkg) => ({
      name: pkg.code,
      fullName: pkg.category,
      BAC: Math.round(pkg.bac / 100000), // in Lakhs
      AC: Math.round(pkg.ac / 100000),
      EV: Math.round(pkg.ev / 100000),
      FAC: Math.round(pkg.fac / 100000),
      CV: Math.round(pkg.cv / 1000), // in Thousands
      CPI: parseFloat(pkg.cpi),
    }));
  }, [portfolioMetrics]);

  // Filtered packages for the WBS Table
  const filteredPackages = useMemo(() => {
    if (filterStatus === 'ALL') return portfolioMetrics.packages;
    if (filterStatus === 'SURPLUS')
      return portfolioMetrics.packages.filter((p) => p.rawCpi >= 1.0);
    if (filterStatus === 'DEFICIT')
      return portfolioMetrics.packages.filter((p) => p.rawCpi < 1.0);
    if (filterStatus === 'CRITICAL')
      return portfolioMetrics.packages.filter((p) => p.rawCpi < 0.9);
    return portfolioMetrics.packages;
  }, [portfolioMetrics, filterStatus]);

  // Export summary report
  const handleExportSummary = () => {
    const header = [
      'WBS Code',
      'Cost Category',
      'BAC (₹)',
      'Earned Value (₹)',
      'Actual Cost (₹)',
      'Cost Variance (₹)',
      'CPI',
      'Forecast at Completion (₹)',
      'Variance at Completion (₹)',
      'TCPI',
      'Status',
    ];
    const rows = portfolioMetrics.packages.map((p) => [
      p.code,
      `"${p.category}"`,
      p.bac,
      p.ev,
      p.ac,
      p.cv,
      p.cpi,
      p.fac,
      p.vac,
      p.tcpi,
      p.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [header.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BuildTwin360_EVM_Cost_Report_PRJ001.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Module Master Banner */}
      <div className="rounded-xl border border-brand-200 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-brand-500/20 text-brand-300 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold border border-brand-500/30 flex items-center gap-1">
                <Calculator className="h-3.5 w-3.5" /> SUITE 3 • EVM & COST INTELLIGENCE
              </span>
              <h2 className="text-xl font-bold text-white">
                Earned Value Management (EVM), Cost Variance & Forecast Engine
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Complete implementation of Cost Performance Index (CPI = EV/AC), Budget & Cost Variance (CV = EV - AC) Engine, and Forecast at Completion (FAC = BAC/CPI) Dashboard Specification.
            </p>
          </div>

          {/* Tab Selector Pills matching all 3 exact models from image */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('CPI')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                activeTab === 'CPI'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              1. CPI Formula Logic
            </button>
            <button
              onClick={() => setActiveTab('CV')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                activeTab === 'CV'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <TrendingDown className="h-3.5 w-3.5" />
              2. Budget & Cost Variance
            </button>
            <button
              onClick={() => setActiveTab('FAC')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                activeTab === 'FAC'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400/80 hover:text-emerald-300'
              }`}
            >
              <PieIcon className="h-3.5 w-3.5" />
              3. FAC & EVM Dashboard Spec
            </button>
          </div>
        </div>

        {/* Global Key Metrics Overview Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 text-xs">
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Budget (BAC)</div>
            <div className="text-base font-bold text-white font-mono mt-0.5">
              {formatINR(portfolioMetrics.totalBac)}
            </div>
            <div className="text-[10px] text-slate-400">7 Work Packages</div>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Earned Value (EV)</div>
            <div className="text-base font-bold text-brand-300 font-mono mt-0.5">
              {formatINR(portfolioMetrics.totalEv)}
            </div>
            <div className="text-[10px] text-slate-400">Physical Work Delivered</div>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Actual Cost Spent (AC)</div>
            <div className="text-base font-bold text-rose-300 font-mono mt-0.5">
              {formatINR(portfolioMetrics.totalAc)}
            </div>
            <div className="text-[10px] text-slate-400">Posted Invoices & Bills</div>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Portfolio CPI</div>
            <div
              className={`text-base font-bold font-mono mt-0.5 ${
                parseFloat(portfolioMetrics.portfolioCpi) >= 1.0
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {portfolioMetrics.portfolioCpi}
            </div>
            <div className="text-[10px] text-slate-400">
              {parseFloat(portfolioMetrics.portfolioCpi) >= 1.0 ? 'Under Budget' : 'Cost Inefficient'}
            </div>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Net Cost Variance (CV)</div>
            <div
              className={`text-base font-bold font-mono mt-0.5 ${
                portfolioMetrics.portfolioCv >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatINR(portfolioMetrics.portfolioCv)}
            </div>
            <div className="text-[10px] text-slate-400">{portfolioMetrics.portfolioCvPct}% Variance</div>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Projected FAC</div>
            <div className="text-base font-bold text-purple-300 font-mono mt-0.5">
              {formatINR(portfolioMetrics.portfolioFac)}
            </div>
            <div className="text-[10px] text-rose-400">
              {portfolioMetrics.portfolioVac < 0
                ? `${formatINR(portfolioMetrics.portfolioVac)} Overrun`
                : `${formatINR(portfolioMetrics.portfolioVac)} Savings`}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. COST PERFORMANCE INDEX (CPI = EV/AC) FORMULA LOGIC SECTION           */}
      {/* ========================================================================= */}
      {activeTab === 'CPI' && (
        <div className="flex flex-col gap-5">
          {/* Formula Card & Logic Explainer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Cost Performance Index (CPI = EV / AC) Formula Logic
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standard EVM Metric KPI-CST-01 • Domain Calculation Engine
                    </p>
                  </div>
                </div>
                <StatusPill tone={cpiResult.tone}>{cpiResult.status}</StatusPill>
              </div>

              {/* Formula Blueprint Box */}
              <div className="bg-slate-900 text-white rounded-lg p-4 font-mono text-xs mb-4">
                <div className="text-slate-400 text-[11px] uppercase tracking-wider mb-1 font-sans">
                  Mathematical Definition:
                </div>
                <div className="text-sm font-bold text-emerald-400">
                  CPI = Earned Value (EV) / Actual Cost (AC)
                </div>
                <div className="text-slate-300 mt-2 text-[11px] leading-relaxed font-sans">
                  • <strong>EV (Earned Value):</strong> Budgeted cost of physical work completed to date (WBS % × BAC).<br />
                  • <strong>AC (Actual Cost):</strong> Total direct & indirect financial expenditure incurred to date.<br />
                  • <strong>Zero Division Rule:</strong> If AC = 0, default CPI = 1.00 (Prevents NaN/Infinity).
                </div>
              </div>

              {/* Interactive Preset Selectors */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Select WBS Package for Live CPI Calculation:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => handleSelectWbs(pkg)}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                        selectedWbsId === pkg.id
                          ? 'border-brand-500 bg-brand-50 text-brand-950 font-bold shadow-sm'
                          : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-mono text-[10px] text-slate-500">{pkg.code}</div>
                      <div className="truncate font-semibold">{pkg.category}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        EV: {formatINR(pkg.ev)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Inputs for Simulation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Earned Value (EV) in ₹ (Physical Value Achieved)
                  </label>
                  <input
                    type="number"
                    value={simEv}
                    onChange={(e) => setSimEv(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Calculated: {formatINR(simEv)}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Actual Cost (AC) in ₹ (Money Spent In Invoices)
                  </label>
                  <input
                    type="number"
                    value={simAc}
                    onChange={(e) => setSimAc(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Calculated: {formatINR(simAc)}
                  </span>
                </div>
              </div>

              {/* Calculation Result Summary Bar */}
              <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between text-xs">
                <div className="text-indigo-900 font-mono">
                  CPI = {formatINR(simEv)} ÷ {formatINR(simAc)} = <strong>{cpiResult.cpi}</strong>
                </div>
                <div className="text-indigo-800 font-medium">
                  Financial Efficiency: <strong>{cpiResult.efficiencyPct}%</strong>
                </div>
              </div>
            </div>

            {/* CPI Interpretation & Efficiency Meter */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  CPI Cost Efficiency Index
                </div>
                <div
                  className={`text-4xl font-black font-mono mt-1 ${
                    parseFloat(cpiResult.cpi) >= 1.0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {cpiResult.cpi}
                </div>
                <div className="text-xs font-medium text-slate-600 mt-1">
                  {parseFloat(cpiResult.cpi) >= 1.0 ? '✅ Cost Favorable' : '⚠️ Cost Inefficient'}
                </div>

                {/* Plain English Business Translation */}
                <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                  <div className="font-semibold text-slate-900">Domain Rule Interpretation:</div>
                  <p>
                    For every <strong>₹1.00</strong> of capital spent, the project delivers{' '}
                    <strong className="text-brand-700">₹{cpiResult.cpi}</strong> worth of physical
                    construction.
                  </p>
                  <p>
                    To produce <strong>₹1.00</strong> of physical work, the team is currently spending{' '}
                    <strong className="text-rose-700">₹{cpiResult.costPerUnit}</strong>.
                  </p>
                </div>

                {/* CPI Benchmarks Reference */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    EVM Standard Thresholds:
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-emerald-50 text-emerald-800 font-mono text-[11px]">
                    <span>CPI &gt; 1.00</span>
                    <span className="font-sans font-medium">Under Budget (Surplus)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-blue-50 text-blue-800 font-mono text-[11px]">
                    <span>CPI = 1.00</span>
                    <span className="font-sans font-medium">On Target Budget</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-amber-50 text-amber-800 font-mono text-[11px]">
                    <span>0.90 ≤ CPI &lt; 1.00</span>
                    <span className="font-sans font-medium">Moderate Overrun (Flag)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-rose-50 text-rose-800 font-mono text-[11px]">
                    <span>CPI &lt; 0.90</span>
                    <span className="font-sans font-medium">Critical Deficit (Escalate)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Governance Rule: Cost transactions posted daily in DPR trigger real-time CPI recalculations.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BUDGET VARIANCE & COST VARIANCE (CV) ENGINE LOGIC SECTION              */}
      {/* ========================================================================= */}
      {activeTab === 'CV' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Budget Variance & Cost Variance (CV) Engine Logic
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standard EVM Metric KPI-CST-02 • Net Monetary Deviation Engine
                    </p>
                  </div>
                </div>
                <StatusPill tone={cvEngineResult.cvTone}>{cvEngineResult.cvRating}</StatusPill>
              </div>

              {/* Mathematical Blueprint */}
              <div className="bg-slate-900 text-white rounded-lg p-4 font-mono text-xs mb-4">
                <div className="text-slate-400 text-[11px] uppercase tracking-wider mb-1 font-sans">
                  Engine Calculation Formulas:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-emerald-400 text-xs">
                  <div>1. CV = EV - AC</div>
                  <div>2. CV % = ((EV - AC) / EV) × 100</div>
                  <div>3. Budget Var = BAC - AC</div>
                </div>
                <div className="text-slate-300 mt-2 text-[11px] leading-relaxed font-sans">
                  • <strong>Positive CV (+):</strong> Work was delivered for less than the budgeted cost (Cost Underrun / Favorable).<br />
                  • <strong>Negative CV (-):</strong> Work cost more than planned (Cost Overrun / Deficit).<br />
                  • <strong>Budget Variance (BAC - AC):</strong> Total baseline funds remaining for this WBS scope.
                </div>
              </div>

              {/* Package selector */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Select WBS Cost Head for Engine Evaluation:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => handleSelectWbs(pkg)}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                        selectedWbsId === pkg.id
                          ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-sm'
                          : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-mono text-[10px] text-slate-500">{pkg.code}</div>
                      <div className="truncate font-semibold">{pkg.category}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        BAC: {formatINR(pkg.bac)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Engine Parameters Slider / Input */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Budget at Completion (BAC)
                  </label>
                  <input
                    type="number"
                    value={simBac}
                    onChange={(e) => setSimBac(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {formatINR(simBac)}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Earned Value (EV)
                  </label>
                  <input
                    type="number"
                    value={simEv}
                    onChange={(e) => setSimEv(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {formatINR(simEv)}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Actual Cost Spent (AC)
                  </label>
                  <input
                    type="number"
                    value={simAc}
                    onChange={(e) => setSimAc(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {formatINR(simAc)}
                  </span>
                </div>
              </div>

              {/* Detailed Mathematical Decomposition */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-slate-500 text-[11px] font-semibold">Cost Variance (CV = EV - AC)</div>
                  <div
                    className={`text-lg font-bold font-mono mt-1 ${
                      cvEngineResult.cv >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {formatINR(cvEngineResult.cv)} ({cvEngineResult.cvPct}%)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Formula: {formatINR(simEv)} - {formatINR(simAc)}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-slate-500 text-[11px] font-semibold">
                    Budget Variance (Remaining Funds: BAC - AC)
                  </div>
                  <div
                    className={`text-lg font-bold font-mono mt-1 ${
                      cvEngineResult.budgetVariance >= 0 ? 'text-blue-600' : 'text-rose-600'
                    }`}
                  >
                    {formatINR(cvEngineResult.budgetVariance)} ({cvEngineResult.budgetVariancePct}%)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Formula: {formatINR(simBac)} - {formatINR(simAc)}
                  </div>
                </div>
              </div>
            </div>

            {/* Variance Alert Engine & Risk Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Engine Variance Signal
                </div>
                <div
                  className={`text-3xl font-black font-mono mt-1 ${
                    cvEngineResult.cv >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {formatINR(cvEngineResult.cv)}
                </div>
                <div className="text-xs font-semibold text-slate-600 mt-1">
                  {cvEngineResult.cv >= 0 ? 'Favorable Cost Underrun' : 'Cost Overrun Deficit'}
                </div>

                {/* Progress bar visual for CV % */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Deviation Percentage (CV %)</span>
                    <span className="font-mono font-bold">{cvEngineResult.cvPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${
                        cvEngineResult.cv >= 0
                          ? 'bg-emerald-500'
                          : Math.abs(parseFloat(cvEngineResult.cvPct)) > 10
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(10, Math.abs(parseFloat(cvEngineResult.cvPct)) * 3))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Alert Notification Card */}
                <div
                  className={`mt-4 p-3.5 rounded-lg border text-xs space-y-1.5 ${
                    cvEngineResult.cv >= 0
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : Math.abs(parseFloat(cvEngineResult.cvPct)) > 10
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {cvEngineResult.cv >= 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-600" />
                    )}
                    <span>{cvEngineResult.cvRating}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {cvEngineResult.cv >= 0
                      ? `Package is operating within allocated baseline funds with a net cost saving of ${formatINR(cvEngineResult.cv)}.`
                      : `Capital spent exceeds the physical value produced by ${formatINR(Math.abs(cvEngineResult.cv))}. Requires value engineering review.`}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Cost Control Action: Auto-flags change orders if CV% drops below -10%.
              </div>
            </div>
          </div>

          {/* Variance Comparison Chart Across All Packages (NO GRIDLINES per user requirement) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Cost Variance (CV = EV - AC) by Work Package Breakdown
                </h4>
                <p className="text-xs text-slate-500">
                  Visualized in thousands (₹'000) • Green indicates savings, Red indicates budget overruns
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">PRJ-001 Padur Site</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  {/* Gridlines removed as requested */}
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={(v) => `₹${v}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-xs border border-slate-700">
                          <div className="font-bold text-slate-200">{data.name}: {data.fullName}</div>
                          <div className="mt-1 font-mono text-[11px] space-y-0.5">
                            <div>EV: ₹{(data.EV).toLocaleString()} Lakhs</div>
                            <div>AC: ₹{(data.AC).toLocaleString()} Lakhs</div>
                            <div className={data.CV >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              Cost Variance (CV): ₹{(data.CV).toLocaleString()}k
                            </div>
                            <div>CPI: {data.CPI}</div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="CV"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FORECAST AT COMPLETION (FAC) & EVM DASHBOARD SPEC SECTION             */}
      {/* ========================================================================= */}
      {activeTab === 'FAC' && (
        <div className="flex flex-col gap-5">
          {/* Top Formula Spec Box */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Forecast at Completion (FAC) & Comprehensive EVM Dashboard Specification
                  </h3>
                  <p className="text-xs text-slate-400">
                    Standard EVM Metric KPI-CST-03 • Multi-Variable Predictive Closeout Engine
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportSummary}>
                  <Download className="h-3.5 w-3.5 mr-1" /> Export CSV Report
                </Button>
              </div>
            </div>

            {/* Formula Matrices */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px] font-sans uppercase">1. Forecast at Completion</div>
                <div className="text-sm font-bold text-emerald-400 mt-1">FAC = BAC / CPI</div>
                <div className="text-[10px] text-slate-400 mt-1 font-sans">
                  Predicts final project cost based on current cost efficiency rate.
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px] font-sans uppercase">2. Estimate to Complete</div>
                <div className="text-sm font-bold text-brand-400 mt-1">ETC = FAC - AC</div>
                <div className="text-[10px] text-slate-400 mt-1 font-sans">
                  Funds required from today until full project completion.
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px] font-sans uppercase">3. Variance at Completion</div>
                <div className="text-sm font-bold text-amber-400 mt-1">VAC = BAC - FAC</div>
                <div className="text-[10px] text-slate-400 mt-1 font-sans">
                  Final projected budget surplus (+) or cost overrun deficit (-).
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px] font-sans uppercase">4. To-Complete Index (TCPI)</div>
                <div className="text-sm font-bold text-purple-400 mt-1">
                  TCPI = (BAC - EV) / (BAC - AC)
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-sans">
                  Efficiency required on remaining work to stay within budget.
                </div>
              </div>
            </div>
          </div>

          {/* S-Curve & Cost Breakdown Visual Chart (NO GRIDLINES per user instruction) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Budget at Completion (BAC) vs Actual Cost (AC) vs Forecast at Completion (FAC)
                </h4>
                <p className="text-xs text-slate-500">
                  Expressed in Lakhs (₹ Lakhs) • Real-time project cost trendline per WBS package
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="h-3 w-3 rounded-sm bg-slate-400 inline-block" /> BAC (Baseline)
                </span>
                <span className="flex items-center gap-1.5 font-medium text-brand-600">
                  <span className="h-3 w-3 rounded-sm bg-brand-500 inline-block" /> AC (Actual Spent)
                </span>
                <span className="flex items-center gap-1.5 font-medium text-purple-600">
                  <span className="h-3 w-3 rounded-sm bg-purple-500 inline-block" /> FAC (Forecast)
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  {/* Clean chart with NO gridlines */}
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={(v) => `₹${v}L`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-700">
                          <div className="font-bold text-white mb-1.5">
                            {data.name}: {data.fullName}
                          </div>
                          <div className="space-y-1 font-mono text-[11px]">
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Baseline Budget (BAC):</span>
                              <span>₹{data.BAC} Lakhs</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Earned Value (EV):</span>
                              <span className="text-emerald-400">₹{data.EV} Lakhs</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Actual Cost (AC):</span>
                              <span className="text-rose-400">₹{data.AC} Lakhs</span>
                            </div>
                            <div className="flex justify-between gap-4 pt-1 border-t border-slate-800">
                              <span className="text-slate-400">Projected FAC:</span>
                              <span className="text-purple-400 font-bold">₹{data.FAC} Lakhs</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Performance (CPI):</span>
                              <span className="font-bold">{data.CPI}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="BAC" fill="#94a3b8" radius={[3, 3, 0, 0]} name="BAC" />
                  <Bar dataKey="AC" fill="#3b82f6" radius={[3, 3, 0, 0]} name="AC" />
                  <Bar dataKey="FAC" fill="#a855f7" radius={[3, 3, 0, 0]} name="FAC" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Master WBS EVM Specification Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Full Work Breakdown Structure (WBS) EVM Intelligence Table
                </h4>
                <p className="text-xs text-slate-500">
                  Calculated live across all 7 work packages with BAC, EV, AC, CV, CPI, FAC, VAC, and TCPI
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Filter:</span>
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    filterStatus === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  All ({portfolioMetrics.packages.length})
                </button>
                <button
                  onClick={() => setFilterStatus('SURPLUS')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    filterStatus === 'SURPLUS'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-300 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  Surplus (CPI ≥ 1)
                </button>
                <button
                  onClick={() => setFilterStatus('DEFICIT')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    filterStatus === 'DEFICIT'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white border border-slate-300 text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  Overrun (CPI &lt; 1)
                </button>
                <button
                  onClick={() => setFilterStatus('CRITICAL')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    filterStatus === 'CRITICAL'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white border border-slate-300 text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  Critical (CPI &lt; 0.9)
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <th className="p-3">WBS Code</th>
                    <th className="p-3">Cost Head / Category</th>
                    <th className="p-3 text-right">BAC (₹)</th>
                    <th className="p-3 text-right">Earned Value (₹)</th>
                    <th className="p-3 text-right">Actual Cost (₹)</th>
                    <th className="p-3 text-right">Cost Var (CV)</th>
                    <th className="p-3 text-center">CPI</th>
                    <th className="p-3 text-right">FAC (₹)</th>
                    <th className="p-3 text-right">VAC (₹)</th>
                    <th className="p-3 text-center">TCPI</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{pkg.code}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{pkg.category}</div>
                        <div className="text-[10px] text-slate-500">{pkg.owner}</div>
                      </td>
                      <td className="p-3 text-right font-mono font-medium text-slate-700">
                        {formatINR(pkg.bac)}
                      </td>
                      <td className="p-3 text-right font-mono font-medium text-brand-700">
                        {formatINR(pkg.ev)}
                      </td>
                      <td className="p-3 text-right font-mono font-medium text-slate-900">
                        {formatINR(pkg.ac)}
                      </td>
                      <td
                        className={`p-3 text-right font-mono font-bold ${
                          pkg.cv >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatINR(pkg.cv)}
                        <span className="text-[10px] block font-normal text-slate-500">
                          {pkg.cvPct}%
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            parseFloat(pkg.cpi) >= 1.0
                              ? 'bg-emerald-100 text-emerald-800'
                              : parseFloat(pkg.cpi) >= 0.9
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {pkg.cpi}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-purple-900">
                        {formatINR(pkg.fac)}
                      </td>
                      <td
                        className={`p-3 text-right font-mono font-bold ${
                          pkg.vac >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatINR(pkg.vac)}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-700">{pkg.tcpi}</td>
                      <td className="p-3 text-center">
                        <StatusPill tone={pkg.tone}>{pkg.status}</StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-800 font-mono">
                    <td className="p-3 font-sans" colSpan={2}>
                      PORTFOLIO AGGREGATE TOTALS
                    </td>
                    <td className="p-3 text-right">{formatINR(portfolioMetrics.totalBac)}</td>
                    <td className="p-3 text-right text-brand-300">
                      {formatINR(portfolioMetrics.totalEv)}
                    </td>
                    <td className="p-3 text-right text-rose-300">
                      {formatINR(portfolioMetrics.totalAc)}
                    </td>
                    <td
                      className={`p-3 text-right ${
                        portfolioMetrics.portfolioCv >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatINR(portfolioMetrics.portfolioCv)}
                    </td>
                    <td className="p-3 text-center text-amber-300">
                      {portfolioMetrics.portfolioCpi}
                    </td>
                    <td className="p-3 text-right text-purple-300">
                      {formatINR(portfolioMetrics.portfolioFac)}
                    </td>
                    <td
                      className={`p-3 text-right ${
                        portfolioMetrics.portfolioVac >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatINR(portfolioMetrics.portfolioVac)}
                    </td>
                    <td className="p-3 text-center">{portfolioMetrics.portfolioTcpi}</td>
                    <td className="p-3 text-center font-sans">
                      <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px]">
                        DEFICIT FLAG
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
