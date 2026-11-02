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

  // Calculator State 4: Material Depletion Forecast (KPI-MAT-01)
  const [calcMatStock, setCalcMatStock] = useState(120);
  const [calcMatDailyRate, setCalcMatDailyRate] = useState(30);
  const [calcMatTargetDays, setCalcMatTargetDays] = useState(5);

  const calcMatDaysToDepletion = useMemo(() => {
    const rate = parseFloat(calcMatDailyRate) || 1;
    return (parseFloat(calcMatStock) / rate).toFixed(1);
  }, [calcMatStock, calcMatDailyRate]);

  // Calculator State 5: Material Wastage % (KPI-MAT-02)
  const [calcWstIssued, setCalcWstIssued] = useState(10.0);
  const [calcWstMeasured, setCalcWstMeasured] = useState(9.4);
  const [calcWstReturned, setCalcWstReturned] = useState(0.3);
  const [calcWstBenchmark, setCalcWstBenchmark] = useState(2.5);

  const calcWastageResult = useMemo(() => {
    const iss = parseFloat(calcWstIssued) || 1;
    const meas = parseFloat(calcWstMeasured) || 0;
    const ret = parseFloat(calcWstReturned) || 0;
    const wasted = Math.max(0, (iss - ret) - meas);
    const pct = ((wasted / iss) * 100).toFixed(2);
    const isExceeded = parseFloat(pct) > parseFloat(calcWstBenchmark);
    return { pct, wasted: wasted.toFixed(2), isExceeded };
  }, [calcWstIssued, calcWstMeasured, calcWstReturned, calcWstBenchmark]);

  // Calculator State 6: Shortage Risk Scoring Engine (KPI-MAT-03)
  const [calcRiskStock, setCalcRiskStock] = useState(45);
  const [calcRiskReorder, setCalcRiskReorder] = useState(100);
  const [calcRiskBurn, setCalcRiskBurn] = useState(15);
  const [calcRiskLeadTime, setCalcRiskLeadTime] = useState(6);
  const [calcRiskCritical, setCalcRiskCritical] = useState(true);

  const calcRiskScoreResult = useMemo(() => {
    const cur = parseFloat(calcRiskStock) || 0;
    const reorder = parseFloat(calcRiskReorder) || 1;
    const burn = parseFloat(calcRiskBurn) || 1;
    const lead = parseFloat(calcRiskLeadTime) || 1;

    const bufferScore = Math.min(100, Math.max(0, ((reorder - cur) / reorder) * 100));
    const daysCover = burn > 0 ? cur / burn : 999;
    const leadTimeRisk = daysCover < lead ? 100 : daysCover <= 1.5 * lead ? 40 : 10;
    const critScore = calcRiskCritical ? 100 : 25;
    const score = (0.35 * bufferScore + 0.35 * leadTimeRisk + 0.30 * critScore).toFixed(1);
    return { score, daysCover: daysCover.toFixed(1) };
  }, [calcRiskStock, calcRiskReorder, calcRiskBurn, calcRiskLeadTime, calcRiskCritical]);

  // Calculator State 7: Supplier OTD % (KPI-SUP-01)
  const [calcOtdTotal, setCalcOtdTotal] = useState(20);
  const [calcOtdOnTime, setCalcOtdOnTime] = useState(18);
  const calcOtdPct = useMemo(() => {
    const tot = parseFloat(calcOtdTotal) || 1;
    const ont = parseFloat(calcOtdOnTime) || 0;
    return ((ont / tot) * 100).toFixed(1);
  }, [calcOtdTotal, calcOtdOnTime]);

  // Calculator State 8: Supplier Rejection Rate & Lead Time (KPI-SUP-02 & 03)
  const [calcRejRec, setCalcRejRec] = useState(100);
  const [calcRejDef, setCalcRejDef] = useState(2.5);
  const [calcContractedLt, setCalcContractedLt] = useState(5);
  const [calcActualLt, setCalcActualLt] = useState(6.8);

  const calcSupplierQuality = useMemo(() => {
    const rec = parseFloat(calcRejRec) || 1;
    const def = parseFloat(calcRejDef) || 0;
    const rejPct = ((def / rec) * 100).toFixed(1);
    const cLt = parseFloat(calcContractedLt) || 1;
    const aLt = parseFloat(calcActualLt) || 1;
    const variance = (aLt - cLt).toFixed(1);
    return { rejPct, variance, isDelayed: aLt > cLt, isRejExceeded: parseFloat(rejPct) > 2.0 };
  }, [calcRejRec, calcRejDef, calcContractedLt, calcActualLt]);

  // Calculator State 9: Cost Performance Index (CPI) & Cost Variance (CV) Engine (KPI-CST-01 & 02)
  const [calcEvmEv, setCalcEvmEv] = useState(450000);
  const [calcEvmAc, setCalcEvmAc] = useState(480000);
  const [calcEvmBac, setCalcEvmBac] = useState(1200000);

  const calcEvmCpiResult = useMemo(() => {
    const ev = parseFloat(calcEvmEv) || 0;
    const ac = parseFloat(calcEvmAc) || 0;
    const bac = parseFloat(calcEvmBac) || 0;
    const cpi = ac > 0 ? (ev / ac).toFixed(3) : '1.000';
    const cv = ev - ac;
    const cvPct = ev > 0 ? (((ev - ac) / ev) * 100).toFixed(2) : '0.00';
    const budgetVar = bac - ac;
    const isOverrun = cv < 0;
    return { cpi, cv, cvPct, budgetVar, isOverrun };
  }, [calcEvmEv, calcEvmAc, calcEvmBac]);

  // Calculator State 10: Forecast at Completion (FAC) & Variance at Completion (VAC) (KPI-CST-03)
  const [calcFacBac, setCalcFacBac] = useState(5000000);
  const [calcFacCpi, setCalcFacCpi] = useState(0.938);
  const [calcFacAc, setCalcFacAc] = useState(2800000);
  const [calcFacEv, setCalcFacEv] = useState(2625000);

  const calcFacMetrics = useMemo(() => {
    const bac = parseFloat(calcFacBac) || 0;
    const cpi = parseFloat(calcFacCpi) || 1.0;
    const ac = parseFloat(calcFacAc) || 0;
    const ev = parseFloat(calcFacEv) || 0;

    const fac = cpi > 0 ? Math.round(bac / cpi) : bac;
    const etc = Math.max(0, fac - ac);
    const vac = bac - fac;
    const tcpi = bac - ac !== 0 ? Math.max(0, (bac - ev) / (bac - ac)).toFixed(2) : '1.00';

    return { fac, etc, vac, tcpi, isDeficit: vac < 0 };
  }, [calcFacBac, calcFacCpi, calcFacAc, calcFacEv]);


  // Calculator State 11: NCR Ageing Metric & Unresolved Quality Defect Logic (KPI-QLT-01)
  const [calcNcrAgeDays, setCalcNcrAgeDays] = useState(12);
  const [calcNcrSla, setCalcNcrSla] = useState(7);
  const [calcNcrTotalLogged, setCalcNcrTotalLogged] = useState(60);
  const [calcNcrClosed, setCalcNcrClosed] = useState(46);

  const calcNcrAgeingMetrics = useMemo(() => {
    const age = parseFloat(calcNcrAgeDays) || 0;
    const sla = parseFloat(calcNcrSla) || 1;
    const total = parseFloat(calcNcrTotalLogged) || 1;
    const closed = parseFloat(calcNcrClosed) || 0;
    const isBreach = age > sla;
    const overdueDays = Math.max(0, age - sla);
    const closureIndex = ((closed / total) * 100).toFixed(1);
    const breachSeverity = overdueDays > 7 ? 'CRITICAL ESCALATION' : overdueDays > 0 ? 'WARNING (OVERDUE)' : 'WITHIN SLA';
    return { age, sla, isBreach, overdueDays, closureIndex, breachSeverity };
  }, [calcNcrAgeDays, calcNcrSla, calcNcrTotalLogged, calcNcrClosed]);

  // Calculator State 12: Recurring Defect Category & Severity Analysis (KPI-QLT-02)
  const [calcDefCrit, setCalcDefCrit] = useState(2);
  const [calcDefHigh, setCalcDefHigh] = useState(5);
  const [calcDefMed, setCalcDefMed] = useState(8);
  const [calcDefLow, setCalcDefLow] = useState(12);

  const calcDefectSeverityScore = useMemo(() => {
    const c = parseFloat(calcDefCrit) || 0;
    const h = parseFloat(calcDefHigh) || 0;
    const m = parseFloat(calcDefMed) || 0;
    const l = parseFloat(calcDefLow) || 0;
    // Weights: Critical=10, High=5, Medium=2, Low=1
    const totalPoints = (c * 10) + (h * 5) + (m * 2) + (l * 1);
    const totalDefects = c + h + m + l;
    const alertLevel = totalPoints > 50 ? 'HIGH SEVERITY ALERT' : totalPoints > 25 ? 'MODERATE DEFECT DENSITY' : 'ACCEPTABLE';
    return { totalPoints, totalDefects, alertLevel };
  }, [calcDefCrit, calcDefHigh, calcDefMed, calcDefLow]);

  // Calculator State 13: Issue & Blocker Schedule Drag (KPI-RSK-02)
  const [calcBlkDuration, setCalcBlkDuration] = useState(7);
  const [calcBlkFloat, setCalcBlkFloat] = useState(2);
  const [calcBlkCritical, setCalcBlkCritical] = useState(true);

  const calcBlockerDragScore = useMemo(() => {
    const dur = parseFloat(calcBlkDuration) || 0;
    const flt = parseFloat(calcBlkFloat) || 0;
    const mult = calcBlkCritical ? 1.0 : 0.4;
    const weighted = dur * mult;
    const drag = Math.max(0, weighted - flt).toFixed(1);
    const erodedFloat = Math.min(flt, weighted).toFixed(1);
    return { drag, erodedFloat, isMilestoneHit: parseFloat(drag) > 0 };
  }, [calcBlkDuration, calcBlkFloat, calcBlkCritical]);

  // Calculator State 14: Activity Delay Risk Score Composite Engine (KPI-RSK-01)
  const [calcDrsPred, setCalcDrsPred] = useState(70);
  const [calcDrsMat, setCalcDrsMat] = useState(85);
  const [calcDrsLbr, setCalcDrsLbr] = useState(60);
  const [calcDrsProd, setCalcDrsProd] = useState(40);
  const [calcDrsQlt, setCalcDrsQlt] = useState(65);

  const calcCompositeDrs = useMemo(() => {
    const p = parseFloat(calcDrsPred) || 0;
    const m = parseFloat(calcDrsMat) || 0;
    const l = parseFloat(calcDrsLbr) || 0;
    const pr = parseFloat(calcDrsProd) || 0;
    const q = parseFloat(calcDrsQlt) || 0;
    // DRS = 0.35*Pred + 0.25*Mat + 0.20*Lbr + 0.10*Prod + 0.10*Qlt
    const drs = (0.35 * p + 0.25 * m + 0.20 * l + 0.10 * pr + 0.10 * q).toFixed(1);
    const tier = drs >= 75 ? 'CRITICAL RISK' : drs >= 50 ? 'HIGH RISK' : drs >= 30 ? 'MODERATE' : 'LOW';
    return { drs, tier };
  }, [calcDrsPred, calcDrsMat, calcDrsLbr, calcDrsProd, calcDrsQlt]);

  // Calculator State 15: Forecast Completion Date Model (KPI-FCT-01)
  const [calcFcdRemaining, setCalcFcdRemaining] = useState(45);
  const [calcFcdSpi, setCalcFcdSpi] = useState(0.85);
  const [calcFcdBlocker, setCalcFcdBlocker] = useState(5);
  const [calcFcdWeather, setCalcFcdWeather] = useState(3);

  const calcFcdModelResult = useMemo(() => {
    const rem = parseFloat(calcFcdRemaining) || 1;
    const spi = Math.max(0.4, parseFloat(calcFcdSpi) || 1.0);
    const blk = parseFloat(calcFcdBlocker) || 0;
    const wth = parseFloat(calcFcdWeather) || 0;
    // Remaining Work Days_adj = Baseline Remaining Days / Rolling 14-Day SPI + Blocker Delays + Weather
    const adjustedRemaining = Math.round((rem / spi) + blk + wth);
    const slippage = adjustedRemaining - rem;
    return { adjustedRemaining, slippage, isDelayed: slippage > 0 };
  }, [calcFcdRemaining, calcFcdSpi, calcFcdBlocker, calcFcdWeather]);

  // Calculator State 16: Project Health Index Composite Score Engine (KPI-HLT-01)
  const [calcPhiSpiVal, setCalcPhiSpiVal] = useState(0.92);
  const [calcPhiCpiVal, setCalcPhiCpiVal] = useState(0.94);
  const [calcPhiDrsVal, setCalcPhiDrsVal] = useState(45);
  const [calcPhiQltVal, setCalcPhiQltVal] = useState(78);
  const [calcPhiMatVal, setCalcPhiMatVal] = useState(70);

  const calcPhiModelScore = useMemo(() => {
    const spi = Math.min(100, Math.max(0, (parseFloat(calcPhiSpiVal) || 1.0) * 100));
    const cpi = Math.min(100, Math.max(0, (parseFloat(calcPhiCpiVal) || 1.0) * 100));
    const drsHealth = Math.max(0, 100 - (parseFloat(calcPhiDrsVal) || 0));
    const qlt = parseFloat(calcPhiQltVal) || 0;
    const mat = parseFloat(calcPhiMatVal) || 0;

    // PHI = 0.30*SPI + 0.25*CPI + 0.20*(100-DRS) + 0.15*Quality + 0.10*Material
    const phi = (0.30 * spi + 0.25 * cpi + 0.20 * drsHealth + 0.15 * qlt + 0.10 * mat).toFixed(1);
    const band = phi >= 85 ? 'GREEN (HEALTHY)' : phi >= 70 ? 'AMBER (NEEDS ATTENTION)' : 'RED (CRITICAL ALERT)';
    return { phi, band };
  }, [calcPhiSpiVal, calcPhiCpiVal, calcPhiDrsVal, calcPhiQltVal, calcPhiMatVal]);

  return (
    <div className="flex flex-col gap-5">
      {/* Featured Interactive Calculation Simulator for 10 Core Logics */}
      <div className="rounded-xl border border-brand-200 bg-gradient-to-r from-brand-950 via-slate-900 to-brand-900 text-white p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5" /> 16 LIVE DOMAIN CALCULATION ENGINES
              </span>
              <h3 className="text-lg font-bold text-white">Domain Rule Execution Engine</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Test real-time mathematical evaluations for schedule progress, material depletion, wastage, shortage risk, supplier SLAs, and EVM cost forecasting.
            </p>
          </div>

          {/* Selector Tabs matching all 8 domain engines */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveCalcTab('PRG')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'PRG'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Physical %
            </button>
            <button
              onClick={() => setActiveCalcTab('SCH_VAR')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'SCH_VAR'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Schedule Var
            </button>
            <button
              onClick={() => setActiveCalcTab('SPI')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'SPI'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. SPI Index
            </button>
            <button
              onClick={() => setActiveCalcTab('MAT_DEP')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'MAT_DEP'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400/80 hover:text-emerald-300'
              }`}
            >
              4. Depletion Forecast
            </button>
            <button
              onClick={() => setActiveCalcTab('MAT_WST')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'MAT_WST'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              5. Wastage % & Loss
            </button>
            <button
              onClick={() => setActiveCalcTab('MAT_RSK')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'MAT_RSK'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-400/80 hover:text-rose-300'
              }`}
            >
              6. Shortage Risk Score
            </button>
            <button
              onClick={() => setActiveCalcTab('SUP_OTD')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'SUP_OTD'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-400/80 hover:text-indigo-300'
              }`}
            >
              7. Supplier OTD %
            </button>
            <button
              onClick={() => setActiveCalcTab('SUP_LT')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'SUP_LT'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-400/80 hover:text-purple-300'
              }`}
            >
              8. Lead Time & Rejection
            </button>
            <button
              onClick={() => setActiveCalcTab('EVM_CPI_CV')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'EVM_CPI_CV'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-brand-400/80 hover:text-brand-300'
              }`}
            >
              9. CPI & Cost Variance
            </button>
            <button
              onClick={() => setActiveCalcTab('EVM_FAC')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'EVM_FAC'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400/80 hover:text-emerald-300'
              }`}
            >
              10. FAC & TCPI Forecast
            </button>
            <button
              onClick={() => setActiveCalcTab('NCR_AGEING')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'NCR_AGEING'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-400/80 hover:text-rose-300'
              }`}
            >
              11. NCR Ageing
            </button>
            <button
              onClick={() => setActiveCalcTab('DEFECT_PARETO')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'DEFECT_PARETO'
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'text-rose-400/80 hover:text-rose-300'
              }`}
            >
              12. Defect Severity
            </button>
            <button
              onClick={() => setActiveCalcTab('BLOCKER_DRAG')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'BLOCKER_DRAG'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              13. Blocker Drag
            </button>
            <button
              onClick={() => setActiveCalcTab('COMPOSITE_DRS')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'COMPOSITE_DRS'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-orange-400/80 hover:text-orange-300'
              }`}
            >
              14. DRS Engine
            </button>
            <button
              onClick={() => setActiveCalcTab('FCD_FORECAST')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'FCD_FORECAST'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-400/80 hover:text-blue-300'
              }`}
            >
              15. Forecast Finish
            </button>
            <button
              onClick={() => setActiveCalcTab('PROJECT_HEALTH')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                activeCalcTab === 'PROJECT_HEALTH'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400/80 hover:text-emerald-300'
              }`}
            >
              16. Project Health
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

        {/* Tab 4: Material Consumption Rate & Depletion Forecast Model */}
        {activeCalcTab === 'MAT_DEP' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-emerald-300 flex items-center justify-between">
                <span>Material Consumption & Upcoming Milestone Inputs</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-MAT-01 Rule</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Usable Store Balance (Bags)</label>
                  <input
                    type="number"
                    value={calcMatStock}
                    onChange={(e) => setCalcMatStock(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Rolling Consumption CR₇d (Bags/day)</label>
                  <input
                    type="number"
                    value={calcMatDailyRate}
                    onChange={(e) => setCalcMatDailyRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Planned Activity In (Days)</label>
                  <input
                    type="number"
                    value={calcMatTargetDays}
                    onChange={(e) => setCalcMatTargetDays(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 font-mono">
                Formula: Days to Depletion = Stock ({calcMatStock}) / CR₇d ({calcMatDailyRate}) = {calcMatDaysToDepletion} Days
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Depletion Forecast Velocity</span>
                <div className={`text-3xl font-black font-mono mt-1 ${parseFloat(calcMatDaysToDepletion) < calcMatTargetDays ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {calcMatDaysToDepletion} Days
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  {parseFloat(calcMatDaysToDepletion) < calcMatTargetDays
                    ? `⚠️ Runs out ${(calcMatTargetDays - parseFloat(calcMatDaysToDepletion)).toFixed(1)} days BEFORE planned activity!`
                    : `✅ Covers activity with ${(parseFloat(calcMatDaysToDepletion) - calcMatTargetDays).toFixed(1)} days safety buffer.`}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Inventory Status:</span>
                <span className={`font-bold ${parseFloat(calcMatDaysToDepletion) < calcMatTargetDays ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {parseFloat(calcMatDaysToDepletion) < calcMatTargetDays ? 'SHORTAGE ALERT' : 'ADEQUATE COVER'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Material Wastage % Formula & Loss Monitoring Logic */}
        {activeCalcTab === 'MAT_WST' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-amber-300 flex items-center justify-between">
                <span>Material Reconciliation & Scrap Input Audit</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-MAT-02 Rule</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Issued Qty (MT)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcWstIssued}
                    onChange={(e) => setCalcWstIssued(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Measured (MT)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcWstMeasured}
                    onChange={(e) => setCalcWstMeasured(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Returned (MT)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcWstReturned}
                    onChange={(e) => setCalcWstReturned(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Benchmark (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcWstBenchmark}
                    onChange={(e) => setCalcWstBenchmark(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 font-mono">
                Formula: ((Issued [{calcWstIssued}] - Measured [{calcWstMeasured}] - Returned [{calcWstReturned}]) / Issued [{calcWstIssued}]) × 100 = {calcWastageResult.pct}%
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Wastage % vs Benchmark</span>
                <div className={`text-3xl font-black font-mono mt-1 ${calcWastageResult.isExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {calcWastageResult.pct}%
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Threshold: {calcWstBenchmark}% • Net Scrap: {calcWastageResult.wasted} MT
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Audit Status:</span>
                <span className={`font-bold ${calcWastageResult.isExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {calcWastageResult.isExceeded ? 'EXCESS SCRAP DETECTED' : 'NORMAL TOLERANCE'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Low-Stock & Projected Shortage Risk Scoring Engine */}
        {activeCalcTab === 'MAT_RSK' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-rose-300 flex items-center justify-between">
                <span>Multi-Factor Risk Scoring Parameters</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-MAT-03 Engine</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={calcRiskStock}
                    onChange={(e) => setCalcRiskStock(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={calcRiskReorder}
                    onChange={(e) => setCalcRiskReorder(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Burn Rate (/day)</label>
                  <input
                    type="number"
                    value={calcRiskBurn}
                    onChange={(e) => setCalcRiskBurn(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={calcRiskLeadTime}
                    onChange={(e) => setCalcRiskLeadTime(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 font-mono">
                Weighted: (0.35 * Buffer Deficit) + (0.35 * Lead Time Gap) + (0.30 * Critical Path)
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Shortage Risk Index</span>
                <div className={`text-3xl font-black font-mono mt-1 ${parseFloat(calcRiskScoreResult.score) >= 70 ? 'text-rose-400' : parseFloat(calcRiskScoreResult.score) >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {calcRiskScoreResult.score} / 100
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Days of Stock Left: {calcRiskScoreResult.daysCover} Days vs {calcRiskLeadTime} Days Lead Time
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Risk Assessment:</span>
                <span className={`font-bold ${parseFloat(calcRiskScoreResult.score) >= 70 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {parseFloat(calcRiskScoreResult.score) >= 70 ? 'CRITICAL SHORTAGE' : 'CONTROLLED'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Supplier On-Time Delivery % (OTD %) Metric Logic */}
        {activeCalcTab === 'SUP_OTD' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-indigo-300 flex items-center justify-between">
                <span>Supplier Delivery Punctuality Inputs</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-SUP-01 Rule</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Total Goods Receipts (GRNs)</label>
                  <input
                    type="number"
                    value={calcOtdTotal}
                    onChange={(e) => setCalcOtdTotal(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">On-Time Deliveries (GRN Date ≤ PO Due Date)</label>
                  <input
                    type="number"
                    value={calcOtdOnTime}
                    onChange={(e) => setCalcOtdOnTime(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 font-mono">
                Formula: Supplier OTD % = (On-time Receipts [{calcOtdOnTime}] / Total Receipts [{calcOtdTotal}]) × 100 = {calcOtdPct}%
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Supplier Delivery Reliability</span>
                <div className={`text-3xl font-black font-mono mt-1 ${parseFloat(calcOtdPct) >= 90 ? 'text-emerald-400' : parseFloat(calcOtdPct) >= 80 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {calcOtdPct}%
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  {parseFloat(calcOtdPct) >= 90
                    ? '✅ Tier 1 Vendor: Meets 90% SLA Benchmark'
                    : '⚠️ Sub-benchmark: Performance penalty warning'}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">SLA Status:</span>
                <span className={`font-bold ${parseFloat(calcOtdPct) >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {parseFloat(calcOtdPct) >= 90 ? 'COMPLIANT' : 'ATTENTION REQUIRED'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Supplier Rejection Rate & Average Lead Time Models */}
        {activeCalcTab === 'SUP_LT' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-purple-300 flex items-center justify-between">
                <span>Quality Rejection & Delivery Lead Time Inputs</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-SUP-02 & 03 Rules</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Received (Units)</label>
                  <input
                    type="number"
                    value={calcRejRec}
                    onChange={(e) => setCalcRejRec(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Rejected (Units)</label>
                  <input
                    type="number"
                    value={calcRejDef}
                    onChange={(e) => setCalcRejDef(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Contract SLA (Days)</label>
                  <input
                    type="number"
                    value={calcContractedLt}
                    onChange={(e) => setCalcContractedLt(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Actual Avg (Days)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcActualLt}
                    onChange={(e) => setCalcActualLt(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 font-mono">
                Rejection Rate = ({calcRejDef} / {calcRejRec}) × 100 = {calcSupplierQuality.rejPct}% • Lead Time Variance = {calcActualLt} - {calcContractedLt} = {calcSupplierQuality.variance}d
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Lead Time Lag & Rejection</span>
                <div className={`text-3xl font-black font-mono mt-1 ${calcSupplierQuality.isDelayed ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {calcSupplierQuality.isDelayed ? `+${calcSupplierQuality.variance}d Lag` : 'On Schedule'}
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Rejection Rate: <strong className={calcSupplierQuality.isRejExceeded ? 'text-rose-400' : 'text-emerald-400'}>{calcSupplierQuality.rejPct}%</strong> (Tolerance: 2.0%)
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Quality Verdict:</span>
                <span className={`font-bold ${calcSupplierQuality.isRejExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {calcSupplierQuality.isRejExceeded ? 'EXCESS DEFECTS' : 'ACCEPTABLE'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 9: Cost Performance Index (CPI) & Cost Variance (CV) Engine */}
        {activeCalcTab === 'EVM_CPI_CV' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-brand-300 flex items-center justify-between">
                <span>Earned Value & Actual Cost Inputs</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-CST-01 & KPI-CST-02 Rules</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Earned Value (EV) in ₹</label>
                  <input
                    type="number"
                    value={calcEvmEv}
                    onChange={(e) => setCalcEvmEv(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Actual Cost Spent (AC) in ₹</label>
                  <input
                    type="number"
                    value={calcEvmAc}
                    onChange={(e) => setCalcEvmAc(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Budget at Completion (BAC) in ₹</label>
                  <input
                    type="number"
                    value={calcEvmBac}
                    onChange={(e) => setCalcEvmBac(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 font-mono">
                CPI = {calcEvmEv.toLocaleString('en-IN')} / {calcEvmAc.toLocaleString('en-IN')} = {calcEvmCpiResult.cpi} • Cost Variance (CV) = {calcEvmEv.toLocaleString('en-IN')} - {calcEvmAc.toLocaleString('en-IN')} = ₹{calcEvmCpiResult.cv.toLocaleString('en-IN')} ({calcEvmCpiResult.cvPct}%)
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Cost Performance (CPI)</span>
                <div className={`text-3xl font-black font-mono mt-1 ${parseFloat(calcEvmCpiResult.cpi) >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {calcEvmCpiResult.cpi}
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Cost Variance: <strong className={calcEvmCpiResult.cv >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {calcEvmCpiResult.cv >= 0 ? `+₹${calcEvmCpiResult.cv.toLocaleString('en-IN')}` : `-₹${Math.abs(calcEvmCpiResult.cv).toLocaleString('en-IN')}`}
                  </strong> ({calcEvmCpiResult.cvPct}%)
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Budget Health:</span>
                <span className={`font-bold ${parseFloat(calcEvmCpiResult.cpi) >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {parseFloat(calcEvmCpiResult.cpi) >= 1.0 ? 'UNDER BUDGET (SAVING)' : 'OVER BUDGET DEFICIT'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 10: Forecast at Completion (FAC) & Variance at Completion (VAC) Engine */}
        {activeCalcTab === 'EVM_FAC' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-emerald-300 flex items-center justify-between">
                <span>EVM Forecasting Inputs (FAC = BAC / CPI)</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-CST-03 Predictive Closeout Rule</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Baseline Budget (BAC)</label>
                  <input
                    type="number"
                    value={calcFacBac}
                    onChange={(e) => setCalcFacBac(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Current CPI Trend</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calcFacCpi}
                    onChange={(e) => setCalcFacCpi(parseFloat(e.target.value) || 0.01)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Actual Cost Spent (AC)</label>
                  <input
                    type="number"
                    value={calcFacAc}
                    onChange={(e) => setCalcFacAc(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Earned Value (EV)</label>
                  <input
                    type="number"
                    value={calcFacEv}
                    onChange={(e) => setCalcFacEv(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 font-mono">
                FAC = {calcFacBac.toLocaleString('en-IN')} / {calcFacCpi} = ₹{calcFacMetrics.fac.toLocaleString('en-IN')} • ETC = ₹{calcFacMetrics.etc.toLocaleString('en-IN')} • TCPI = {calcFacMetrics.tcpi}
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Projected Final Cost (FAC)</span>
                <div className="text-2xl font-black font-mono text-purple-300 mt-1">
                  ₹{calcFacMetrics.fac.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  VAC at Closeout: <strong className={calcFacMetrics.vac >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {calcFacMetrics.vac >= 0 ? `+₹${calcFacMetrics.vac.toLocaleString('en-IN')} Surplus` : `-₹${Math.abs(calcFacMetrics.vac).toLocaleString('en-IN')} Overrun`}
                  </strong>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Target TCPI:</span>
                <span className="font-bold text-amber-400">{calcFacMetrics.tcpi}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 11: NCR Ageing Metric & Unresolved Quality Defect Logic (KPI-QLT-01) */}
        {activeCalcTab === 'NCR_AGEING' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-rose-300 flex items-center justify-between">
                <span>NCR Ageing &amp; Quality Resolution Index (Padur Site QA)</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-QLT-01 Standard</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Defect Age (Days)</label>
                  <input
                    type="number"
                    value={calcNcrAgeDays}
                    onChange={(e) => setCalcNcrAgeDays(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">SLA Target (Days)</label>
                  <input
                    type="number"
                    value={calcNcrSla}
                    onChange={(e) => setCalcNcrSla(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Total Logged NCRs</label>
                  <input
                    type="number"
                    value={calcNcrTotalLogged}
                    onChange={(e) => setCalcNcrTotalLogged(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Closed &amp; Verified</label>
                  <input
                    type="number"
                    value={calcNcrClosed}
                    onChange={(e) => setCalcNcrClosed(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Formula: NCR Ageing Days = Current Date - Creation Date. If Age &gt; SLA, ticket triggers critical audit escalation.
              </p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-slate-400 uppercase text-[10px] tracking-wider block font-semibold">SLA Ageing Output</span>
                <div className={`text-xl font-bold font-mono mt-1 ${calcNcrAgeingMetrics.isBreach ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {calcNcrAgeingMetrics.isBreach ? `+${calcNcrAgeingMetrics.overdueDays}d Overdue!` : 'Within SLA Window'}
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Quality Closure Index: <strong className="text-emerald-400">{calcNcrAgeingMetrics.closureIndex}%</strong>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px]">
                Status: <strong className={calcNcrAgeingMetrics.isBreach ? 'text-rose-400' : 'text-emerald-400'}>{calcNcrAgeingMetrics.breachSeverity}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Tab 12: Recurring Defect Category & Severity Analysis (KPI-QLT-02) */}
        {activeCalcTab === 'DEFECT_PARETO' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-rose-300 flex items-center justify-between">
                <span>Weighted Defect Severity Analysis (80/20 Pareto Root-Cause Model)</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-QLT-02 Standard</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Critical (Wt: 10)</label>
                  <input
                    type="number"
                    value={calcDefCrit}
                    onChange={(e) => setCalcDefCrit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">High (Wt: 5)</label>
                  <input
                    type="number"
                    value={calcDefHigh}
                    onChange={(e) => setCalcDefHigh(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Medium (Wt: 2)</label>
                  <input
                    type="number"
                    value={calcDefMed}
                    onChange={(e) => setCalcDefMed(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Low (Wt: 1)</label>
                  <input
                    type="number"
                    value={calcDefLow}
                    onChange={(e) => setCalcDefLow(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Formula: Weighted Defect Score = Sum(Defects_i &times; SeverityWeight_i). Highlights recurring trade flaws.
              </p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-slate-400 uppercase text-[10px] tracking-wider block font-semibold">Severity Output</span>
                <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                  {calcDefectSeverityScore.totalPoints} pts
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Total Active Defects: <strong>{calcDefectSeverityScore.totalDefects} items</strong>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px]">
                Tier: <strong className="text-amber-400">{calcDefectSeverityScore.alertLevel}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Tab 13: Issue & Blocker Schedule Drag (KPI-RSK-02) */}
        {activeCalcTab === 'BLOCKER_DRAG' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-amber-300 flex items-center justify-between">
                <span>Critical Path Blocker Impact &amp; Float Erosion</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-RSK-02 Standard</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Blocker Duration (d)</label>
                  <input
                    type="number"
                    value={calcBlkDuration}
                    onChange={(e) => setCalcBlkDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Activity Total Float (d)</label>
                  <input
                    type="number"
                    value={calcBlkFloat}
                    onChange={(e) => setCalcBlkFloat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Critical Path Link?</label>
                  <select
                    value={calcBlkCritical ? 'YES' : 'NO'}
                    onChange={(e) => setCalcBlkCritical(e.target.value === 'YES')}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white"
                  >
                    <option value="YES">Yes (100% Impact)</option>
                    <option value="NO">No (Advisory 40%)</option>
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Formula: Schedule Drag = Max(0, Blocker Duration &times; Multiplier - Total Float). Direct milestone delay.
              </p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-slate-400 uppercase text-[10px] tracking-wider block font-semibold">Net Milestone Delay</span>
                <div className={`text-2xl font-bold font-mono mt-1 ${calcBlockerDragScore.isMilestoneHit ? 'text-rose-400' : 'text-emerald-400'}`}>
                  +{calcBlockerDragScore.drag} Days
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Eroded Float: <strong>{calcBlockerDragScore.erodedFloat} days</strong>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px]">
                Impact: <strong className={calcBlockerDragScore.isMilestoneHit ? 'text-rose-400' : 'text-emerald-400'}>
                  {calcBlockerDragScore.isMilestoneHit ? 'CRITICAL PATH DELAY' : 'ABSORBED IN FLOAT'}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Tab 14: Activity Delay Risk Score Composite Engine (KPI-RSK-01) */}
        {activeCalcTab === 'COMPOSITE_DRS' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-orange-300 flex items-center justify-between">
                <span>Multi-Factor Delay Risk Score (DRS 0-100 Composite Engine)</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-RSK-01 Standard</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Pred Lag (35%)</label>
                  <input
                    type="number"
                    value={calcDrsPred}
                    onChange={(e) => setCalcDrsPred(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Mat Stock (25%)</label>
                  <input
                    type="number"
                    value={calcDrsMat}
                    onChange={(e) => setCalcDrsMat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Labour Def (20%)</label>
                  <input
                    type="number"
                    value={calcDrsLbr}
                    onChange={(e) => setCalcDrsLbr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Prod (10%)</label>
                  <input
                    type="number"
                    value={calcDrsProd}
                    onChange={(e) => setCalcDrsProd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Open NCR (10%)</label>
                  <input
                    type="number"
                    value={calcDrsQlt}
                    onChange={(e) => setCalcDrsQlt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Formula: DRS = 0.35&times;Pred + 0.25&times;Mat + 0.20&times;Lbr + 0.10&times;Prod + 0.10&times;Qlt.
              </p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-slate-400 uppercase text-[10px] tracking-wider block font-semibold">Calculated DRS Score</span>
                <div className="text-3xl font-black font-mono text-rose-400 mt-1">
                  {calcCompositeDrs.drs} <span className="text-sm font-normal text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px]">
                Risk Band: <strong className="text-amber-400">{calcCompositeDrs.tier}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Tab 15: Forecast Completion Date Model (KPI-FCT-01) */}
        {activeCalcTab === 'FCD_FORECAST' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-blue-300 flex items-center justify-between">
                <span>Forecast Completion Date Statistical Model (Baseline &amp; Velocity Drivers)</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-FCT-01 Standard</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Baseline Days</label>
                  <input
                    type="number"
                    value={calcFcdRemaining}
                    onChange={(e) => setCalcFcdRemaining(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Rolling 14d SPI</label>
                  <input
                    type="number"
                    step="0.05"
                    value={calcFcdSpi}
                    onChange={(e) => setCalcFcdSpi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Blocker Drag (d)</label>
                  <input
                    type="number"
                    value={calcFcdBlocker}
                    onChange={(e) => setCalcFcdBlocker(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Weather Buffer (d)</label>
                  <input
                    type="number"
                    value={calcFcdWeather}
                    onChange={(e) => setCalcFcdWeather(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Formula: Remaining Days_adj = Baseline Days / Rolling SPI + Blocker Delays + Weather Contingency.
              </p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-slate-400 uppercase text-[10px] tracking-wider block font-semibold">Adjusted Remaining</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {calcFcdModelResult.adjustedRemaining} Days
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Baseline Variance: <strong className="text-rose-400">+{calcFcdModelResult.slippage}d Slippage</strong>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px]">
                Schedule Trend: <strong className={calcFcdModelResult.isDelayed ? 'text-rose-400' : 'text-emerald-400'}>
                  {calcFcdModelResult.isDelayed ? 'BEHIND BASELINE' : 'ON TRACK'}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Tab 16: Project Health Index Composite Score Engine (KPI-HLT-01) */}
        {activeCalcTab === 'PROJECT_HEALTH' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            <div className="lg:col-span-2 space-y-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <div className="font-semibold text-emerald-300 flex items-center justify-between">
                <span>Project Health Index (PHI 0-100 Executive Composite Metric)</span>
                <span className="font-mono text-[11px] text-slate-400">KPI-HLT-01 Standard</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">SPI (30%)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={calcPhiSpiVal}
                    onChange={(e) => setCalcPhiSpiVal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">CPI (25%)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={calcPhiCpiVal}
                    onChange={(e) => setCalcPhiCpiVal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">DRS (20%)</label>
                  <input
                    type="number"
                    value={calcPhiDrsVal}
                    onChange={(e) => setCalcPhiDrsVal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Quality % (15%)</label>
                  <input
                    type="number"
                    value={calcPhiQltVal}
                    onChange={(e) => setCalcPhiQltVal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Material % (10%)</label>
                  <input
                    type="number"
                    value={calcPhiMatVal}
                    onChange={(e) => setCalcPhiMatVal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Formula: PHI = 0.30&times;SPI + 0.25&times;CPI + 0.20&times;(100-DRS) + 0.15&times;Quality + 0.10&times;Material.
              </p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-slate-400 uppercase text-[10px] tracking-wider block font-semibold">Executive Health Score</span>
                <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
                  {calcPhiModelScore.phi} <span className="text-sm font-normal text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px]">
                Health Band: <strong className="text-amber-400">{calcPhiModelScore.band}</strong>
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
