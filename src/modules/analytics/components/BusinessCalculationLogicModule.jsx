import { useState, useMemo } from 'react';
import { StatusPill, Button, Modal, Input } from '@/design-system';
import { BUILDTWIN_KPI_DICTIONARY } from '../constants/kpiDictionaryData';
import { Search, Info, CheckCircle2, Cpu, BookOpen, Layers } from 'lucide-react';

export function BusinessCalculationLogicModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedKpi, setSelectedKpi] = useState(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(BUILDTWIN_KPI_DICTIONARY.map((kpi) => kpi.category)));
    return ['ALL', ...cats];
  }, []);

  const filteredKpis = useMemo(() => {
    return BUILDTWIN_KPI_DICTIONARY.filter((kpi) => {
      const matchesCategory = selectedCategory === 'ALL' || kpi.category === selectedCategory;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        kpi.code.toLowerCase().includes(term) ||
        kpi.name.toLowerCase().includes(term) ||
        kpi.businessPurpose.toLowerCase().includes(term) ||
        kpi.formula.toLowerCase().includes(term) ||
        kpi.sourceTables.some((t) => t.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const getCategoryTone = (category) => {
    switch (category) {
      case 'Progress':
      case 'Health':
        return 'success';
      case 'Schedule':
      case 'Cost':
        return 'info';
      case 'Material':
      case 'Labour':
      case 'Supplier':
        return 'warning';
      case 'Risk':
      case 'Quality':
        return 'danger';
      case 'Forecast':
      default:
        return 'neutral';
    }
  };

  // Interactive Live Calculation Engine State
  const [activeCalcTab, setActiveCalcTab] = useState('PRG'); // 'PRG' | 'SCH_VAR' | 'SPI'

  // Calculator State 1: Physical Progress %
  const [colWeight, setColWeight] = useState(0.40);
  const [colDonePct, setColDonePct] = useState(100);
  const [slabWeight, setSlabWeight] = useState(0.60);
  const [slabDonePct, setSlabDonePct] = useState(50);

  const calculatedPhysicalProgress = useMemo(() => {
    const w1 = parseFloat(colWeight) || 0;
    const p1 = (parseFloat(colDonePct) || 0) / 100;
    const w2 = parseFloat(slabWeight) || 0;
    const p2 = (parseFloat(slabDonePct) || 0) / 100;
    const totalW = w1 + w2 || 1;
    return (((w1 * Math.min(1.0, p1) + w2 * Math.min(1.0, p2)) / totalW) * 100).toFixed(2);
  }, [colWeight, colDonePct, slabWeight, slabDonePct]);

  // Calculator State 2: Schedule Variance & Timing Slippage
  const [calcEv, setCalcEv] = useState(450000);
  const [calcPv, setCalcPv] = useState(500000);
  const [baselineDays, setBaselineDays] = useState(30);
  const [forecastDays, setForecastDays] = useState(36);

  const monetarySv = useMemo(() => calcEv - calcPv, [calcEv, calcPv]);
  const slippageDays = useMemo(() => forecastDays - baselineDays, [forecastDays, baselineDays]);

  // Calculator State 3: Schedule Performance Index (SPI)
  const [spiEv, setSpiEv] = useState(12500000);
  const [spiPv, setSpiPv] = useState(15000000);

  const calculatedSpi = useMemo(() => {
    if (!spiPv || spiPv === 0) return 1.0;
    return (spiEv / spiPv).toFixed(3);
  }, [spiEv, spiPv]);

  return (
    <div className="flex flex-col gap-5">
      {/* Featured Interactive Calculation Simulator for 3 Core Logics */}
      <div className="rounded-xl border border-brand-200 bg-gradient-to-r from-brand-950 via-slate-900 to-brand-900 text-white p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5" /> LIVE CALCULATION LOGIC SIMULATOR
              </span>
              <h3 className="text-lg font-bold text-white">Domain Rule Execution Engine</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Select any of the 3 domain calculation logics to test real-time mathematical evaluations with site inputs.
            </p>
          </div>

          {/* Selector Tabs matching the 3 items from user request */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveCalcTab('PRG')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeCalcTab === 'PRG'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Physical Progress %
            </button>
            <button
              onClick={() => setActiveCalcTab('SCH_VAR')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeCalcTab === 'SCH_VAR'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Schedule Variance & Slippage
            </button>
            <button
              onClick={() => setActiveCalcTab('SPI')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeCalcTab === 'SPI'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. Schedule Performance Index (SPI)
            </button>
          </div>
        </div>

        {/* Tab 1: Physical Progress % Weighted Calculation Logic */}
        {activeCalcTab === 'PRG' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-brand-300 flex items-center justify-between">
                <span>Weighted Activity Work Packages (PRJ-001 Padur Site)</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-PRG-01 Rule</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Col Rebar Weight (w₁)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={colWeight}
                    onChange={(e) => setColWeight(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Col Done % (p₁)</label>
                  <input
                    type="number"
                    value={colDonePct}
                    onChange={(e) => setColDonePct(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Slab Conc Weight (w₂)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={slabWeight}
                    onChange={(e) => setSlabWeight(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Slab Done % (p₂)</label>
                  <input
                    type="number"
                    value={slabDonePct}
                    onChange={(e) => setSlabDonePct(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 font-mono">
                Formula: ∑ (min(1.0, Qty_done / Qty_planned) × Weight) × 100 ➔ ({colWeight} × {colDonePct}%) + ({slabWeight} × {slabDonePct}%)
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Calculated Physical Progress</span>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                  {calculatedPhysicalProgress}%
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Weighted physical completion score across active structure activities.
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Rule Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> VALIDATED
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Schedule Variance & Baseline Timing Slippage Logic */}
        {activeCalcTab === 'SCH_VAR' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-brand-300 flex items-center justify-between">
                <span>Schedule Monetary & Calendar Slippage Inputs</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-SCH-02 Rule</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Earned Value (EV ₹)</label>
                  <input
                    type="number"
                    value={calcEv}
                    onChange={(e) => setCalcEv(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Planned Value (PV ₹)</label>
                  <input
                    type="number"
                    value={calcPv}
                    onChange={(e) => setCalcPv(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Baseline Days</label>
                  <input
                    type="number"
                    value={baselineDays}
                    onChange={(e) => setBaselineDays(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Forecast Days</label>
                  <input
                    type="number"
                    value={forecastDays}
                    onChange={(e) => setForecastDays(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 font-mono">
                Formula: SV_monetary = EV ({calcEv.toLocaleString()}) - PV ({calcPv.toLocaleString()}); SV_days = Forecast ({forecastDays}) - Baseline ({baselineDays})
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Schedule Variance & Slippage</span>
                <div className={`text-2xl font-black font-mono mt-1 ${monetarySv < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ₹ {monetarySv.toLocaleString()}
                </div>
                <div className={`text-sm font-bold font-mono mt-1 ${slippageDays > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {slippageDays > 0 ? `+${slippageDays} Days Baseline Slippage` : `${Math.abs(slippageDays)} Days Ahead`}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Status:</span>
                <span className={`font-bold ${slippageDays > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {slippageDays > 0 ? 'BEHIND SCHEDULE' : 'ON TRACK'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Schedule Performance Index (SPI) */}
        {activeCalcTab === 'SPI' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-brand-300 flex items-center justify-between">
                <span>SPI Efficiency Input Parameters</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-SCH-01 Rule</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Earned Value (EV ₹)</label>
                  <input
                    type="number"
                    value={spiEv}
                    onChange={(e) => setSpiEv(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Planned Value (PV ₹)</label>
                  <input
                    type="number"
                    value={spiPv}
                    onChange={(e) => setSpiPv(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 font-mono">
                Formula: SPI = EV / PV ➔ ({spiEv.toLocaleString()} / {spiPv.toLocaleString()})
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Schedule Performance Index (SPI)</span>
                <div className={`text-3xl font-black font-mono mt-1 ${parseFloat(calculatedSpi) < 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {calculatedSpi}
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  {parseFloat(calculatedSpi) < 1.0
                    ? `SPI < 1.00 (${((1 - parseFloat(calculatedSpi)) * 100).toFixed(1)}% Behind Schedule)`
                    : `SPI ≥ 1.00 (${((parseFloat(calculatedSpi) - 1) * 100).toFixed(1)}% Ahead of Schedule)`}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Efficiency Index:</span>
                <span className={`font-bold ${parseFloat(calculatedSpi) < 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {parseFloat(calculatedSpi) < 1.0 ? 'SLIPPAGE ALERT' : 'OPTIMAL BURN'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-surface-subtle p-3 rounded-lg border border-surface-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
          <Input
            placeholder="Search code, formula, KPI name or source table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-medium text-ink-500 whitespace-nowrap mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'bg-white text-ink-700 hover:bg-slate-100 border border-surface-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Logic Table */}
      <div className="overflow-x-auto rounded-lg border border-surface-border">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-surface-border bg-surface-subtle text-ink-700 font-semibold">
            <tr>
              <th className="px-3.5 py-2.5">Code & Name</th>
              <th className="px-3.5 py-2.5">Category</th>
              <th className="px-3.5 py-2.5">Calculation Formula</th>
              <th className="px-3.5 py-2.5">Source Tables & Domain Rules</th>
              <th className="px-3.5 py-2.5">Owner & Trigger</th>
              <th className="px-3.5 py-2.5 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border bg-white">
            {filteredKpis.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-500">
                  No matching KPI calculation logic definitions found.
                </td>
              </tr>
            ) : (
              filteredKpis.map((kpi) => (
                <tr key={kpi.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="px-3.5 py-3 font-medium text-brand-950">
                    <div className="font-mono text-xs font-bold text-brand-600">{kpi.code}</div>
                    <div className="font-semibold text-ink-900">{kpi.name}</div>
                  </td>
                  <td className="px-3.5 py-3">
                    <StatusPill status={kpi.category} tone={getCategoryTone(kpi.category)} />
                  </td>
                  <td className="px-3.5 py-3 max-w-xs">
                    <code className="block rounded bg-slate-900 text-emerald-300 px-2 py-1 font-mono text-[11px] leading-relaxed break-all">
                      {kpi.formula}
                    </code>
                  </td>
                  <td className="px-3.5 py-3 max-w-xs">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {kpi.sourceTables.map((tbl) => (
                        <span key={tbl} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 border border-slate-200">
                          {tbl}
                        </span>
                      ))}
                    </div>
                    <div className="text-[11px] text-ink-500 line-clamp-2">{kpi.exclusions}</div>
                  </td>
                  <td className="px-3.5 py-3 text-[11px]">
                    <div className="font-medium text-ink-800">{kpi.ownerRole}</div>
                    <div className="text-ink-500">{kpi.refreshTrigger}</div>
                  </td>
                  <td className="px-3.5 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedKpi(kpi)}
                      className="text-xs gap-1"
                    >
                      <BookOpen className="h-3.5 w-3.5" /> Benchmark
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for detailed Domain Rules & Validation Benchmark */}
      {selectedKpi && (
        <Modal
          open={!!selectedKpi}
          onClose={() => setSelectedKpi(null)}
          title={`${selectedKpi.code} — ${selectedKpi.name}`}
          size="lg"
        >
          <div className="flex flex-col gap-4 text-xs text-ink-800">
            <div className="flex items-center justify-between gap-2 border-b border-surface-border pb-3">
              <div>
                <span className="font-mono text-sm font-bold text-brand-600">{selectedKpi.code}</span>
                <h4 className="text-base font-bold text-brand-950">{selectedKpi.name}</h4>
              </div>
              <StatusPill status={selectedKpi.category} tone={getCategoryTone(selectedKpi.category)} />
            </div>

            <div>
              <h5 className="font-semibold text-ink-900 mb-1 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-brand-500" /> Business Purpose
              </h5>
              <p className="rounded-md bg-surface-subtle p-2.5 text-ink-700 leading-relaxed">
                {selectedKpi.businessPurpose}
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-ink-900 mb-1 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-emerald-600" /> Mathematical Formula
              </h5>
              <div className="rounded-md bg-slate-950 p-3 text-emerald-300 font-mono text-xs leading-relaxed overflow-x-auto">
                {selectedKpi.formula}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <h5 className="font-semibold text-ink-900 mb-1 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-500" /> Transactional Source Tables
                </h5>
                <ul className="space-y-1">
                  {selectedKpi.sourceTables.map((st) => (
                    <li key={st} className="rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-800 border border-slate-200">
                      {st}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-ink-900 mb-1">Execution & Governance</h5>
                <div className="space-y-1.5 rounded-md bg-surface-subtle p-2 text-[11px]">
                  <div>
                    <span className="font-semibold text-ink-900">Owner Role:</span> {selectedKpi.ownerRole}
                  </div>
                  <div>
                    <span className="font-semibold text-ink-900">Refresh Frequency:</span> {selectedKpi.refreshTrigger}
                  </div>
                  <div>
                    <span className="font-semibold text-ink-900">Guardrails & Exclusions:</span> {selectedKpi.exclusions}
                  </div>
                </div>
              </div>
            </div>

            {/* Worked Numerical Scenario Validation Benchmark */}
            <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-3.5 space-y-2">
              <h5 className="font-bold text-brand-950 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="h-4 w-4 text-brand-600" /> Worked Validation Benchmark Scenario
              </h5>
              <div className="grid grid-cols-1 gap-2 text-[11px] md:grid-cols-3">
                <div className="rounded bg-white p-2 border border-brand-100">
                  <div className="font-semibold text-brand-900">Site / Context</div>
                  <div className="text-ink-700">{selectedKpi.validationExample.project}</div>
                </div>
                <div className="col-span-2 rounded bg-white p-2 border border-brand-100">
                  <div className="font-semibold text-brand-900">Test Input Scenario</div>
                  <div className="text-ink-700">{selectedKpi.validationExample.scenario}</div>
                </div>
              </div>

              <div className="rounded bg-slate-900 p-2.5 text-xs">
                <div className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold mb-1">
                  Algebraic Evaluation Step
                </div>
                <code className="text-amber-300 font-mono text-[11px]">{selectedKpi.validationExample.calculation}</code>
                <div className="mt-1 flex items-center justify-between border-t border-slate-800 pt-1 text-emerald-400 font-bold">
                  <span className="text-slate-300">Expected Result:</span>
                  <span className="text-emerald-400 font-mono text-sm">{selectedKpi.validationExample.result}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
