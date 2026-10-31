import { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  BarChart3,
  Layers,
  Wrench,
  ShieldCheck,
  Award,
  RefreshCw,
  FileCheck2,
  Calendar,
  Building2,
  Flame,
  HelpCircle,
  Activity,
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
  Legend,
} from 'recharts';
import { Button, StatusPill, Modal } from '@/design-system';

// Benchmark weights for defect severity
const SEVERITY_WEIGHTS = {
  CRITICAL: 10,
  HIGH: 5,
  MEDIUM: 2,
  LOW: 1,
};

// Standard construction defect categories
const DEFECT_CATEGORIES = [
  { id: 'HONEYCOMB', name: 'Concrete Honeycombing & Voids', trade: 'Civil / Concrete', benchmarkMax: 3 },
  { id: 'REBAR_COVER', name: 'Rebar Cover & Spacing Non-Compliance', trade: 'Reinforcement', benchmarkMax: 2 },
  { id: 'FORMWORK_PLUMB', name: 'Formwork Plumb & Dimensional Misalignment', trade: 'Formwork / Carpentry', benchmarkMax: 4 },
  { id: 'CRACKS', name: 'Structural / Plastic Shrinkage Cracking', trade: 'Curing & Concrete', benchmarkMax: 2 },
  { id: 'MEP_CLASH', name: 'MEP Sleeve Misalignment & Penetration Clash', trade: 'Electrical & Plumbing', benchmarkMax: 3 },
  { id: 'WATERPROOF', name: 'Waterproofing Membrane & Seal Failure', trade: 'Waterproofing', benchmarkMax: 1 },
  { id: 'WORKMANSHIP', name: 'Masonry Joint Defect & Plaster Unevenness', trade: 'Finishes / Masonry', benchmarkMax: 5 },
];

export function QualityNcrDefectAnalyticsModule({ projectId = 1 }) {
  // Interactive Simulation State for NCR Ageing & Closure Index
  const [openNcrCount, setOpenNcrCount] = useState(14);
  const [closedNcrCount, setClosedNcrCount] = useState(46);
  const [selectedAgeBucket, setSelectedAgeBucket] = useState('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // Real-time Ageing Simulator Inputs
  const [simDefectDays, setSimDefectDays] = useState(12);
  const [simSlaDays, setSimSlaDays] = useState(7);
  const [simSeverity, setSimSeverity] = useState('HIGH');
  const [simContractor, setSimContractor] = useState('Coromandel Structural Works');

  // Sample Synthetic Quality Inspection Records for Ashok Grandeur / Padur
  const sampleQualityRecords = useMemo(() => [
    {
      id: 'NCR-PADUR-042',
      title: 'Honeycombing & voids detected on Column C4 Ground Floor after shuttering stripping',
      category: 'Concrete Honeycombing & Voids',
      trade: 'Civil / Concrete',
      severity: 'HIGH',
      location: 'Block A - Ground Floor - Col C4',
      reportedDate: '2026-10-18',
      ageDays: 11,
      slaDays: 7,
      status: 'OPEN',
      contractor: 'Coromandel Structural Works',
      rootCause: 'Poor vibrator compaction during high-slump pour',
      rectificationMethod: 'Micro-concrete pressure grouting with epoxy bonding agent',
    },
    {
      id: 'NCR-PADUR-043',
      title: 'Inadequate clear concrete cover (only 15mm vs 25mm specified) on external beam B12',
      category: 'Rebar Cover & Spacing Non-Compliance',
      trade: 'Reinforcement',
      severity: 'CRITICAL',
      location: 'Block A - Floor 1 - Beam B12',
      reportedDate: '2026-10-12',
      ageDays: 17,
      slaDays: 5,
      status: 'OPEN',
      contractor: 'Apex Steel Fabricators Ltd',
      rootCause: 'Cover blocks dislodged during rebar cage placement',
      rectificationMethod: 'Install heavy-duty fiber concrete cover spacers and re-bind',
    },
    {
      id: 'NCR-PADUR-044',
      title: 'Plumb deviation of 18mm exceeding 6mm IS-456 tolerance on shear wall formwork',
      category: 'Formwork Plumb & Dimensional Misalignment',
      trade: 'Formwork / Carpentry',
      severity: 'HIGH',
      location: 'Core Lift Shear Wall L1',
      reportedDate: '2026-10-04',
      ageDays: 25,
      slaDays: 10,
      status: 'OPEN',
      contractor: 'Coromandel Structural Works',
      rootCause: 'Weak diagonal bracing against lateral wet concrete pressure',
      rectificationMethod: 'Re-align tie rods and install heavy push-pull bracing props',
    },
    {
      id: 'NCR-PADUR-045',
      title: 'Structural shrinkage micro-cracks (0.35mm width) on 2nd Floor transfer slab',
      category: 'Structural / Plastic Shrinkage Cracking',
      trade: 'Curing & Concrete',
      severity: 'MEDIUM',
      location: 'Block B - Floor 2 - Slab Grid 3-4',
      reportedDate: '2026-09-26',
      ageDays: 33,
      slaDays: 14,
      status: 'OPEN',
      contractor: 'Chennai Ready-Mix Concrete Co.',
      rootCause: 'Delayed curing ponding during peak wind / high evaporation rate',
      rectificationMethod: 'Low-viscosity epoxy resin pressure injection sealing',
    },
    {
      id: 'NCR-PADUR-046',
      title: 'Sanitary plumbing drainage sleeve cast 120mm offset from shaft centerline',
      category: 'MEP Sleeve Misalignment & Penetration Clash',
      trade: 'Electrical & Plumbing',
      severity: 'MEDIUM',
      location: 'Block A - Floor 2 - Toilet Duct D3',
      reportedDate: '2026-10-23',
      ageDays: 6,
      slaDays: 7,
      status: 'OPEN',
      contractor: 'Balaji MEP MEP Infrastructure',
      rootCause: 'Discrepancy between architectural and MEP coordination drawing Rev 2',
      rectificationMethod: 'Diamond core drill approved sleeve and apply waterproofing collar',
    },
    {
      id: 'NCR-PADUR-047',
      title: 'Basement retaining wall cold-joint honeycombing with active groundwater dampness',
      category: 'Concrete Honeycombing & Voids',
      trade: 'Civil / Concrete',
      severity: 'CRITICAL',
      location: 'Basement 1 - South Retaining Wall',
      reportedDate: '2026-10-01',
      ageDays: 28,
      slaDays: 7,
      status: 'OPEN',
      contractor: 'Coromandel Structural Works',
      rootCause: 'Concrete pour delay between truck transits without retarding admixture',
      rectificationMethod: 'Hydrophilic polyurethane injection and crystalline waterproof coating',
    },
    {
      id: 'NCR-PADUR-048',
      title: 'Mortar joint hollow sound & bond failure on AAC block masonry panels',
      category: 'Masonry Joint Defect & Plaster Unevenness',
      trade: 'Finishes / Masonry',
      severity: 'LOW',
      location: 'Block B - Floor 1 - Flat 102 Internal Partition',
      reportedDate: '2026-10-25',
      ageDays: 4,
      slaDays: 7,
      status: 'OPEN',
      contractor: 'Sri Ganesh Masonry Contractors',
      rootCause: 'Dry AAC blocks laid without adequate surface wetting',
      rectificationMethod: 'Rake out defective joints to 15mm and re-point with polymer mortar',
    },
    {
      id: 'NCR-PADUR-038',
      title: 'Substandard tensile yield test certificate for 20mm Fe550D Rebar batch #B441',
      category: 'Rebar Cover & Spacing Non-Compliance',
      trade: 'Reinforcement',
      severity: 'CRITICAL',
      location: 'Central Steel Yard Store',
      reportedDate: '2026-09-15',
      ageDays: 14,
      slaDays: 7,
      status: 'CLOSED',
      contractor: 'Tata Tiscon Steels Ltd',
      rootCause: 'Vendor mill test variance on localized billet cooling',
      rectificationMethod: 'Consignment rejected and replaced free of cost with certified heat',
    },
    {
      id: 'NCR-PADUR-039',
      title: 'Waterproofing membrane primer blister and peeling on podium landscape slab',
      category: 'Waterproofing Membrane & Seal Failure',
      trade: 'Waterproofing',
      severity: 'HIGH',
      location: 'Podium Garden Level',
      reportedDate: '2026-09-20',
      ageDays: 8,
      slaDays: 7,
      status: 'CLOSED',
      contractor: 'AquaShield Membrane Applicators',
      rootCause: 'Substrate moisture > 5% at time of cold primer application',
      rectificationMethod: 'Stripped defective area, dried with blowers to < 3% moisture, and reapplied',
    },
  ], []);

  // Compute Ageing Buckets
  const ageingBuckets = useMemo(() => {
    const buckets = {
      under7: { label: '< 7 Days (Fresh)', count: 0, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      d7to14: { label: '7 - 14 Days (Standard)', count: 0, tone: 'text-blue-700 bg-blue-50 border-blue-200' },
      d15to30: { label: '15 - 30 Days (Escalated)', count: 0, tone: 'text-amber-700 bg-amber-50 border-amber-200' },
      over30: { label: '> 30 Days (Critical SLA Breach)', count: 0, tone: 'text-rose-700 bg-rose-50 border-rose-200' },
    };

    sampleQualityRecords.forEach((item) => {
      if (item.status !== 'CLOSED') {
        if (item.ageDays <= 7) buckets.under7.count += 1;
        else if (item.ageDays <= 14) buckets.d7to14.count += 1;
        else if (item.ageDays <= 30) buckets.d15to30.count += 1;
        else buckets.over30.count += 1;
      }
    });
    return buckets;
  }, [sampleQualityRecords]);

  // Overall Quality Defect Metrics
  const qualityMetrics = useMemo(() => {
    const openItems = sampleQualityRecords.filter((r) => r.status !== 'CLOSED');
    const closedItems = sampleQualityRecords.filter((r) => r.status === 'CLOSED');
    const total = sampleQualityRecords.length;
    const closureIndex = total > 0 ? ((closedItems.length / total) * 100).toFixed(1) : '0.0';

    const overdueCount = openItems.filter((r) => r.ageDays > r.slaDays).length;
    const avgAgeDays = openItems.length > 0
      ? (openItems.reduce((acc, cur) => acc + cur.ageDays, 0) / openItems.length).toFixed(1)
      : '0.0';

    // Total Weighted Defect Score = Sum(Count * SeverityWeight)
    const weightedScore = openItems.reduce((acc, cur) => {
      const weight = SEVERITY_WEIGHTS[cur.severity] || 1;
      return acc + weight;
    }, 0);

    return {
      total,
      openCount: openItems.length,
      closedCount: closedItems.length,
      closureIndex,
      overdueCount,
      avgAgeDays,
      weightedScore,
    };
  }, [sampleQualityRecords]);

  // Pareto 80/20 Defect Category Breakdown
  const categoryParetoData = useMemo(() => {
    const map = {};
    DEFECT_CATEGORIES.forEach((c) => {
      map[c.name] = { name: c.name, count: 0, weightedPoints: 0, trade: c.trade };
    });

    sampleQualityRecords.forEach((r) => {
      if (!map[r.category]) {
        map[r.category] = { name: r.category, count: 0, weightedPoints: 0, trade: r.trade };
      }
      map[r.category].count += 1;
      map[r.category].weightedPoints += SEVERITY_WEIGHTS[r.severity] || 1;
    });

    return Object.values(map).sort((a, b) => b.weightedPoints - a.weightedPoints);
  }, [sampleQualityRecords]);

  // Severity Distribution Data
  const severityChartData = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    sampleQualityRecords.forEach((r) => {
      if (counts[r.severity] !== undefined) counts[r.severity] += 1;
    });

    return [
      { name: 'Critical (Wt 10)', value: counts.CRITICAL, color: '#e11d48' },
      { name: 'High (Wt 5)', value: counts.HIGH, color: '#ea580c' },
      { name: 'Medium (Wt 2)', value: counts.MEDIUM, color: '#eab308' },
      { name: 'Low (Wt 1)', value: counts.LOW, color: '#10b981' },
    ];
  }, [sampleQualityRecords]);

  // Contractor Accountability Distribution
  const contractorAccountability = useMemo(() => {
    const map = {};
    sampleQualityRecords.forEach((r) => {
      if (!map[r.contractor]) {
        map[r.contractor] = { contractor: r.contractor, total: 0, open: 0, overdue: 0, score: 0 };
      }
      map[r.contractor].total += 1;
      if (r.status !== 'CLOSED') {
        map[r.contractor].open += 1;
        if (r.ageDays > r.slaDays) map[r.contractor].overdue += 1;
        map[r.contractor].score += SEVERITY_WEIGHTS[r.severity] || 1;
      }
    });
    return Object.values(map).sort((a, b) => b.score - a.score);
  }, [sampleQualityRecords]);

  // Simulator calculation
  const simResult = useMemo(() => {
    const days = parseFloat(simDefectDays) || 0;
    const sla = parseFloat(simSlaDays) || 1;
    const isBreach = days > sla;
    const slippage = Math.max(0, days - sla);
    const weight = SEVERITY_WEIGHTS[simSeverity] || 1;
    const penaltyScore = (weight * (1 + (slippage / sla))).toFixed(1);
    const riskLevel = penaltyScore > 15 ? 'CRITICAL ESCALATION' : penaltyScore > 8 ? 'HIGH RISK' : 'NORMAL MONITORING';

    return { isBreach, slippage, penaltyScore, riskLevel };
  }, [simDefectDays, simSlaDays, simSeverity]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: Module Identity & Formula Specifications */}
      <div className="rounded-xl border border-brand-200 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-500/20 text-rose-300 font-mono text-xs px-3 py-1 rounded-full font-bold border border-rose-500/40 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" /> KPI-QLT-01 &amp; KPI-QLT-02 SPEC
              </span>
              <h2 className="text-xl font-black tracking-tight text-white">
                Quality NCR Ageing &amp; Recurring Defect Intelligence Suite
              </h2>
            </div>
            <p className="mt-2 text-xs text-slate-300 max-w-3xl leading-relaxed">
              Automated Non-Conformance Report (NCR) ageing engine, SLA countdown tracker, 80/20 Pareto recurring defect classification, contractor penalty scoring, and verified resolution sign-off.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2 text-right">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Quality Closure Index</span>
              <span className="font-mono text-2xl font-black text-emerald-400">{qualityMetrics.closureIndex}%</span>
            </div>
          </div>
        </div>

        {/* Real-time KPI Metric Cards */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Total Logged NCRs</span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">{qualityMetrics.total}</span>
            <span className="text-[10px] text-slate-500">Padur Residence Site</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Active Open Defects</span>
            <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">{qualityMetrics.openCount}</span>
            <span className="text-[10px] text-amber-500/80">Pending site audit</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">SLA Overdue Breaches</span>
            <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">{qualityMetrics.overdueCount}</span>
            <span className="text-[10px] text-rose-400">Passed committed due date</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Average NCR Age</span>
            <span className="text-xl font-bold font-mono text-blue-300 mt-1 block">{qualityMetrics.avgAgeDays} Days</span>
            <span className="text-[10px] text-slate-500">Benchmark &le; 7.0 Days</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Weighted Defect Score</span>
            <span className="text-xl font-bold font-mono text-purple-300 mt-1 block">{qualityMetrics.weightedScore} pts</span>
            <span className="text-[10px] text-slate-500">Sum(Count &times; Severity)</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Rectified &amp; Signed Off</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{qualityMetrics.closedCount}</span>
            <span className="text-[10px] text-emerald-500/80">QA Pass Verified</span>
          </div>
        </div>
      </div>

      {/* Section 1: NCR Ageing Buckets & SLA Breach Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {Object.entries(ageingBuckets).map(([key, b]) => (
          <div key={key} className={`rounded-xl border p-4 shadow-sm ${b.tone}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">{b.label}</span>
              <Clock className="h-4 w-4 opacity-70" />
            </div>
            <p className="mt-2 text-3xl font-black font-mono">{b.count}</p>
            <p className="mt-1 text-[11px] opacity-80">
              {key === 'over30'
                ? 'Mandatory stop-pour penalty & direct management escalation'
                : key === 'd15to30'
                ? 'Executive alert: contractor retention held on bill'
                : key === 'd7to14'
                ? 'Warning issued: nearing maximum allowable SLA window'
                : 'Under active repair within agreed contractor SLA'}
            </p>
          </div>
        ))}
      </div>

      {/* Section 2: Interactive NCR Ageing & Escalation Simulator */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-brand-600" /> Interactive NCR Ageing &amp; SLA Breach Impact Simulator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate individual defect ticket ageing, SLA targets, and resulting contractor penalty points in real-time.
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 font-semibold text-slate-700">
            Rule: KPI-QLT-01
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="space-y-3 lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Defect Ageing (Days)</label>
              <input
                type="number"
                min="1"
                max="90"
                value={simDefectDays}
                onChange={(e) => setSimDefectDays(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-brand-600"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Contractor SLA (Days)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={simSlaDays}
                onChange={(e) => setSimSlaDays(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-brand-600"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Defect Severity</label>
              <select
                value={simSeverity}
                onChange={(e) => setSimSeverity(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-brand-600"
              >
                <option value="CRITICAL">Critical (Weight 10)</option>
                <option value="HIGH">High (Weight 5)</option>
                <option value="MEDIUM">Medium (Weight 2)</option>
                <option value="LOW">Low (Weight 1)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Assigned Subcontractor</label>
              <select
                value={simContractor}
                onChange={(e) => setSimContractor(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-brand-600"
              >
                <option value="Coromandel Structural Works">Coromandel Structural</option>
                <option value="Apex Steel Fabricators Ltd">Apex Steel Fabricators</option>
                <option value="Chennai Ready-Mix Concrete Co.">Chennai Ready-Mix</option>
                <option value="Balaji MEP Infrastructure">Balaji MEP</option>
              </select>
            </div>
          </div>

          <div className={`rounded-xl p-4 border flex flex-col justify-between ${
            simResult.isBreach ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">SLA Evaluation</span>
              <p className="mt-1 text-base font-extrabold flex items-center gap-1.5">
                {simResult.isBreach ? (
                  <>
                    <XCircle className="h-4 w-4 text-rose-600" />
                    +{simResult.slippage} Days SLA Breach!
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Within SLA Tolerance
                  </>
                )}
              </p>
              <p className="mt-1 text-xs font-mono font-bold">
                Penalty Score: {simResult.penaltyScore} pts
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-black/10 text-[11px] font-bold">
              Status: <span className="underline">{simResult.riskLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Visual Analytics: 80/20 Pareto Defect Categories & Severity Distribution (NO GRIDLINES) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pareto Bar Chart: Defect Categories */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Recurring Defect Pareto Analysis (80/20 Root-Cause Frequency)
              </h3>
              <p className="text-xs text-slate-500">
                Weighted defect severity points by construction trade &amp; flaw type
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
              KPI-QLT-02 Rule
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryParetoData} layout="vertical" margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
                {/* STRICT USER MANDATE: ZERO CARTESIAN GRIDLINES */}
                <XAxis type="number" fontSize={11} stroke="#64748b" tickLine={false} />
                <YAxis dataKey="name" type="category" fontSize={10} stroke="#64748b" tickLine={false} width={130} />
                <Tooltip
                  formatter={(val, name) => [val, name === 'weightedPoints' ? 'Severity Score' : 'Defect Count']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="weightedPoints" fill="#e11d48" radius={[0, 4, 4, 0]}>
                  {categoryParetoData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={idx === 0 ? '#e11d48' : idx === 1 ? '#f43f5e' : idx === 2 ? '#fb7185' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Severity Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Defect Severity Ratio</h3>
          <p className="text-xs text-slate-500 mb-3">Critical &amp; High require 48hr stoppage audits</p>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {/* ZERO GRIDLINES */}
                <Pie
                  data={severityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 4: Subcontractor Quality Accountability & Defect Scorecard */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Contractor Quality Compliance Scorecard</h3>
            <p className="text-xs text-slate-500">
              Aggregated defect volume, overdue tickets, and cumulative severity risk penalty points
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500">Live Trade Audit</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">Subcontractor Name</th>
                <th className="py-2.5 px-3 font-semibold text-center">Total Logged</th>
                <th className="py-2.5 px-3 font-semibold text-center">Active Open</th>
                <th className="py-2.5 px-3 font-semibold text-center">SLA Overdue</th>
                <th className="py-2.5 px-3 font-semibold text-center">Severity Penalty</th>
                <th className="py-2.5 px-3 font-semibold text-right">Contractor Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contractorAccountability.map((c, i) => (
                <tr key={c.contractor} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-medium text-slate-900 flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400">#{i + 1}</span>
                    {c.contractor}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">{c.total}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700">{c.open}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-600">
                    {c.overdue > 0 ? `⚠️ ${c.overdue}` : '0'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-extrabold text-purple-700">{c.score} pts</td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.overdue > 0 || c.score > 15
                          ? 'bg-rose-100 text-rose-800'
                          : c.score > 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {c.overdue > 0 || c.score > 15 ? 'Escalated / Hold' : c.score > 5 ? 'Under Review' : 'Preferred QA'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5: Unresolved Quality Issues & NCR Ageing Ledger */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Unresolved Quality Non-Conformance (NCR) Register
            </h3>
            <p className="text-xs text-slate-500">
              Active defects tracked with verified rectification methods and SLA age counters
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Severity:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="border border-slate-200 rounded px-2 py-1 text-xs bg-white text-slate-700 outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">NCR Ref &amp; Date</th>
                <th className="py-2.5 px-3 font-semibold">Defect Description &amp; Location</th>
                <th className="py-2.5 px-3 font-semibold">Trade &amp; Contractor</th>
                <th className="py-2.5 px-3 font-semibold text-center">Severity</th>
                <th className="py-2.5 px-3 font-semibold text-center">Age vs SLA</th>
                <th className="py-2.5 px-3 font-semibold">Root Cause &amp; Approved Rectification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sampleQualityRecords
                .filter((r) => selectedCategoryFilter === 'ALL' || r.severity === selectedCategoryFilter)
                .map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 align-top font-mono">
                      <span className="font-bold text-brand-700 block">{row.id}</span>
                      <span className="text-[10px] text-slate-400">{row.reportedDate}</span>
                    </td>
                    <td className="py-3 px-3 align-top max-w-xs">
                      <span className="font-bold text-slate-900 block leading-tight">{row.title}</span>
                      <span className="text-[11px] text-slate-500 mt-1 block flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-slate-400" /> {row.location}
                      </span>
                    </td>
                    <td className="py-3 px-3 align-top">
                      <span className="font-semibold text-slate-800 block">{row.contractor}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{row.trade}</span>
                    </td>
                    <td className="py-3 px-3 align-top text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          row.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : row.severity === 'HIGH'
                            ? 'bg-orange-100 text-orange-800 border border-orange-300'
                            : row.severity === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {row.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 align-top text-center font-mono">
                      <div className="flex flex-col items-center">
                        <span className={`font-bold ${row.ageDays > row.slaDays ? 'text-rose-600' : 'text-slate-800'}`}>
                          {row.ageDays}d / {row.slaDays}d SLA
                        </span>
                        {row.ageDays > row.slaDays && (
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 rounded mt-0.5">
                            +{row.ageDays - row.slaDays}d Overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 align-top max-w-xs text-[11px]">
                      <div className="space-y-1">
                        <p className="text-slate-700">
                          <span className="font-semibold text-slate-900">Cause:</span> {row.rootCause}
                        </p>
                        <p className="text-emerald-800 bg-emerald-50/70 p-1.5 rounded border border-emerald-200/50">
                          <span className="font-semibold text-emerald-950">CAPA:</span> {row.rectificationMethod}
                        </p>
                      </div>
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
