import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  Flame,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Building2,
  RefreshCw,
  Eye,
  FileSpreadsheet,
  X,
  Target,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Button, Modal, Table } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { projectsApi } from '@/modules/projects/api/projectsApi';
import { wbsScheduleApi } from '@/modules/wbs-schedule/api/wbsScheduleApi';

// Baseline S-Curve Milestone Data
const S_CURVE_DATA = [
  { month: 'Aug 2026', planned: 5, actual: 5, forecast: 5 },
  { month: 'Sep 2026', planned: 18, actual: 16, forecast: 16 },
  { month: 'Oct 2026', planned: 35, actual: 28, forecast: 28 },
  { month: 'Nov 2026', planned: 55, actual: 44, forecast: 44 },
  { month: 'Dec 2026', planned: 72, actual: null, forecast: 58 },
  { month: 'Jan 2027', planned: 88, actual: null, forecast: 74 },
  { month: 'Feb 2027', planned: 98, actual: null, forecast: 89 },
  { month: 'Mar 2027', planned: 100, actual: null, forecast: 97 },
  { month: 'Apr 2027', planned: 100, actual: null, forecast: 100 },
];

// Multi-Factor Delay Attribution Drivers
const DELAY_ATTRIBUTION = [
  { factor: 'Subcontractor Labour Shortage', share: 36, days: 7.2, color: '#ef4444' },
  { factor: 'Quality NCR Rework & Curing Hold', share: 24, days: 4.8, color: '#f59e0b' },
  { factor: 'Material Delivery & RMC Latency', share: 18, days: 3.6, color: '#0284c7' },
  { factor: 'Monsoon Rain & Pit Dewatering', share: 12, days: 2.4, color: '#6366f1' },
  { factor: 'Equipment Breakdown (Tower Crane)', share: 10, days: 2.0, color: '#8b5cf6' },
];

// Detailed Project Milestones with Critical Path tracking
const INITIAL_MILESTONES = [
  {
    id: 'MS-01',
    code: 'WBS-101',
    name: 'Basement Piling & Foundation Raft',
    discipline: 'CIVIL',
    plannedDate: '2026-09-15',
    forecastDate: '2026-09-18',
    varianceDays: 3,
    status: 'COMPLETED',
    progress: 100,
    isCritical: true,
    totalFloat: 0,
    contractor: 'L&T Geotechnical Subcontractor',
    delayReason: 'Initial rocky stratum encounter during rotary rig bore.',
    mitigation: 'Additional rotary rig deployed to finish remaining 12 piles.',
    activities: [
      { code: 'ACT-101.1', name: 'Cast-in-situ bored piles (120 nos)', plannedDuration: 25, slip: 3, status: 'DONE' },
      { code: 'ACT-101.2', name: 'Pile cap breaking & PCC levelling', plannedDuration: 12, slip: 0, status: 'DONE' },
      { code: 'ACT-101.3', name: 'Raft foundation rebar & M35 pour', plannedDuration: 18, slip: 0, status: 'DONE' },
    ],
  },
  {
    id: 'MS-02',
    code: 'WBS-102',
    name: 'Basement Retaining Wall & Dewatering',
    discipline: 'CIVIL',
    plannedDate: '2026-10-10',
    forecastDate: '2026-10-16',
    varianceDays: 6,
    status: 'COMPLETED',
    progress: 100,
    isCritical: true,
    totalFloat: 0,
    contractor: 'Apex Civil Contractors',
    delayReason: 'Water table seepage during northeast depression rains.',
    mitigation: 'Installed 3 high-capacity submersible dewatering pumps.',
    activities: [
      { code: 'ACT-102.1', name: 'Retaining wall double-curtain rebar', plannedDuration: 14, slip: 2, status: 'DONE' },
      { code: 'ACT-102.2', name: 'Waterstop seal & cantilever formwork', plannedDuration: 10, slip: 4, status: 'DONE' },
      { code: 'ACT-102.3', name: 'C35 self-compacting concrete pour', plannedDuration: 7, slip: 0, status: 'DONE' },
    ],
  },
  {
    id: 'MS-03',
    code: 'WBS-103',
    name: 'Podium Post-Tensioned Slab (Floors 1-2)',
    discipline: 'STRUCTURAL',
    plannedDate: '2026-11-15',
    forecastDate: '2026-11-26',
    varianceDays: 11,
    status: 'IN_PROGRESS',
    progress: 74,
    isCritical: true,
    totalFloat: 0,
    contractor: 'Apex Civil Contractors',
    delayReason: 'Formwork shuttering leakage and low 7-day cube compressive strength hold.',
    mitigation: 'Authorized micro-concrete pressure grouting and accelerated 14-day curing compound.',
    activities: [
      { code: 'ACT-103.1', name: 'Level 1 PT Strand profiling & anchoring', plannedDuration: 14, slip: 3, status: 'DONE' },
      { code: 'ACT-103.2', name: 'Level 1 Concrete casting & post-tensioning', plannedDuration: 8, slip: 4, status: 'DONE' },
      { code: 'ACT-103.3', name: 'Level 2 Formwork staging & deshurring', plannedDuration: 15, slip: 4, status: 'IN_PROGRESS' },
    ],
  },
  {
    id: 'MS-04',
    code: 'WBS-104',
    name: 'Tower Superstructure Framing (Floors 3-10)',
    discipline: 'CIVIL',
    plannedDate: '2026-12-28',
    forecastDate: '2027-01-17',
    varianceDays: 20,
    status: 'IN_PROGRESS',
    progress: 42,
    isCritical: true,
    totalFloat: 0,
    contractor: 'Simplex Concrete Works',
    delayReason: 'Tower crane electrical transformer trip + shortage of skilled carpenters.',
    mitigation: 'Deploying secondary passenger-material hoist and adding 12 masons from Guindy site.',
    activities: [
      { code: 'ACT-104.1', name: 'Level 3 & 4 Columns & Core Shear Wall', plannedDuration: 20, slip: 7, status: 'IN_PROGRESS' },
      { code: 'ACT-104.2', name: 'Level 5-7 Typical floor slab casting', plannedDuration: 30, slip: 8, status: 'PLANNED' },
      { code: 'ACT-104.3', name: 'Level 8-10 Superstructure topping slab', plannedDuration: 25, slip: 5, status: 'PLANNED' },
    ],
  },
  {
    id: 'MS-05',
    code: 'WBS-105',
    name: 'MEP Primary Risers, Conduit & Fire Piping',
    discipline: 'MEP',
    plannedDate: '2027-02-15',
    forecastDate: '2027-03-05',
    varianceDays: 18,
    status: 'DELAYED',
    progress: 22,
    isCritical: true,
    totalFloat: 0,
    contractor: 'Sterling MEP Engineering',
    delayReason: 'Sleeve penetration clashes with structural beam rebar layout.',
    mitigation: 'Fast-track BIM clash resolution with structural consultant; pre-fabricate pipe manifolds.',
    activities: [
      { code: 'ACT-105.1', name: 'Plumbing & drainage vertical stack risers', plannedDuration: 22, slip: 8, status: 'IN_PROGRESS' },
      { code: 'ACT-105.2', name: 'Firefighting sprinkler main header installation', plannedDuration: 18, slip: 6, status: 'PLANNED' },
      { code: 'ACT-105.3', name: 'Electrical riser conduit & busbar trunking', plannedDuration: 20, slip: 4, status: 'PLANNED' },
    ],
  },
  {
    id: 'MS-06',
    code: 'WBS-106',
    name: 'External Façade Glazing & Structural Cladding',
    discipline: 'FAÇADE',
    plannedDate: '2027-03-30',
    forecastDate: '2027-04-18',
    varianceDays: 19,
    status: 'PLANNED',
    progress: 0,
    isCritical: false,
    totalFloat: 6,
    contractor: 'GlassTek Architectural Façades',
    delayReason: 'Extrusion anodizing delivery delay at supplier factory.',
    mitigation: 'Authorized alternative tier-1 aluminum extruder in Sriperumbudur.',
    activities: [
      { code: 'ACT-106.1', name: 'Sub-frame bracket anchors & pull-out testing', plannedDuration: 18, slip: 4, status: 'PLANNED' },
      { code: 'ACT-106.2', name: 'DGU unitized panel erection via cradle', plannedDuration: 35, slip: 10, status: 'PLANNED' },
      { code: 'ACT-106.3', name: 'Weather silicone sealant & smoke seals', plannedDuration: 15, slip: 5, status: 'PLANNED' },
    ],
  },
  {
    id: 'MS-07',
    code: 'WBS-107',
    name: 'Internal Finishing, Flooring & Painting',
    discipline: 'FINISHING',
    plannedDate: '2027-05-15',
    forecastDate: '2027-06-04',
    varianceDays: 20,
    status: 'PLANNED',
    progress: 0,
    isCritical: true,
    totalFloat: 0,
    contractor: 'DecoBuild Interiors',
    delayReason: 'Dependent on MEP riser sign-off and watertight façade completion.',
    mitigation: 'Segment floor-by-floor handover to begin drywall framing on completed lower floors.',
    activities: [
      { code: 'ACT-107.1', name: 'Gypsum drywall framing & rockwool acoustic infill', plannedDuration: 25, slip: 8, status: 'PLANNED' },
      { code: 'ACT-107.2', name: 'Vitrified tile flooring & skirting laying', plannedDuration: 30, slip: 7, status: 'PLANNED' },
      { code: 'ACT-107.3', name: 'Internal 2-coat putty & premium emulsion paint', plannedDuration: 20, slip: 5, status: 'PLANNED' },
    ],
  },
  {
    id: 'MS-08',
    code: 'WBS-108',
    name: 'Testing, Commissioning & Client Handover',
    discipline: 'MANAGEMENT',
    plannedDate: '2027-06-30',
    forecastDate: '2027-07-20',
    varianceDays: 20,
    status: 'PLANNED',
    progress: 0,
    isCritical: true,
    totalFloat: 0,
    contractor: 'BuildTwin PMC Lead Team',
    delayReason: 'Cumulative critical path slippage across structural and MEP packages.',
    mitigation: 'Conduct integrated testing in parallel with local municipal occupancy inspections.',
    activities: [
      { code: 'ACT-108.1', name: 'Transformer, DG & elevator fire authority NOC', plannedDuration: 20, slip: 6, status: 'PLANNED' },
      { code: 'ACT-108.2', name: 'Hydrostatic pressure test & water audit', plannedDuration: 12, slip: 4, status: 'PLANNED' },
      { code: 'ACT-108.3', name: 'Snagging rectification & Final Handover Dossier', plannedDuration: 15, slip: 10, status: 'PLANNED' },
    ],
  },
];

export function DelayRiskForecastView({ onNavigateToQuality }) {
  const pushToast = useToastStore((state) => state.push);

  // Project state
  const [selectedProjectId, setSelectedProjectId] = useState(1);
  const [filterDiscipline, setFilterDiscipline] = useState('ALL');
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);

  // Drill-down Modal State
  const [drillDownMilestone, setDrillDownMilestone] = useState(null);
  const [drillDownFactor, setDrillDownFactor] = useState(null);

  // Projects list
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectsApi.list(),
  });

  const projectId = selectedProjectId || projects[0]?.id || 1;

  // WBS Work Packages
  const { refetch: refetchWbs } = useQuery({
    queryKey: ['wbs-packages', projectId],
    queryFn: () => wbsScheduleApi.list(projectId),
    enabled: !!projectId,
  });

  // Filtered Milestones
  const filteredMilestones = useMemo(() => {
    return INITIAL_MILESTONES.filter((m) => {
      if (filterCriticalOnly && !m.isCritical) return false;
      if (filterDiscipline !== 'ALL' && m.discipline !== filterDiscipline) return false;
      return true;
    });
  }, [filterDiscipline, filterCriticalOnly]);

  const milestoneColumns = [
    {
      key: 'code',
      header: 'WBS / Code',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 w-fit">
            {row.code}
          </span>
          <span className="text-[10px] text-ink-500 mt-1 uppercase font-semibold">{row.discipline}</span>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Milestone Scope & Path',
      render: (row) => (
        <div className="flex flex-col max-w-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-ink-900">{row.name}</span>
            {row.isCritical && (
              <span className="rounded bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.2 border border-rose-300">
                CRITICAL PATH
              </span>
            )}
          </div>
          <span className="text-[11px] text-ink-500 mt-0.5 line-clamp-1">{row.contractor}</span>
        </div>
      ),
    },
    {
      key: 'schedule',
      header: 'Planned vs Forecast Handover',
      render: (row) => (
        <div className="flex flex-col text-xs">
          <div className="flex items-center gap-1.5 text-ink-600">
            <span className="text-ink-400">Plan:</span>
            <span className="font-mono">{row.plannedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-ink-900 mt-0.5">
            <span className="text-ink-400">Fcst:</span>
            <span className={`font-mono ${row.varianceDays > 5 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {row.forecastDate}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'variance',
      header: 'Slippage Variance',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-black font-mono w-fit ${
              row.varianceDays === 0
                ? 'bg-emerald-100 text-emerald-800'
                : row.varianceDays <= 5
                ? 'bg-blue-100 text-blue-800'
                : row.varianceDays <= 14
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800 animate-pulse'
            }`}
          >
            {row.varianceDays > 0 ? `+${row.varianceDays} Days` : 'On Schedule'}
          </span>
          <span className="text-[10px] text-ink-500">
            Float: {row.totalFloat}d ({row.totalFloat === 0 ? 'Zero Float' : 'Buffered'})
          </span>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Completion %',
      render: (row) => (
        <div className="flex flex-col gap-1 min-w-[120px]">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className={row.status === 'COMPLETED' ? 'text-emerald-700' : 'text-ink-900'}>{row.progress}%</span>
            <span className="text-[10px] font-semibold text-ink-500 uppercase">{row.status}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.progress === 100
                  ? 'bg-emerald-500'
                  : row.varianceDays > 10
                  ? 'bg-rose-500'
                  : 'bg-brand-600'
              }`}
              style={{ width: `${row.progress}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Root Cause & Drill-Down',
      className: 'text-right',
      render: (row) => (
        <Button
          size="xs"
          variant="outline"
          onClick={() => setDrillDownMilestone(row)}
          className="text-xs font-semibold text-brand-700 border-brand-300 hover:bg-brand-50"
        >
          <Eye className="mr-1 h-3.5 w-3.5" /> Drill Down
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-ink-900">Predictive Delay-Risk &amp; Schedule Forecast Engine</h2>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                Critical Path Slippage: +20d
              </span>
            </div>
            <p className="text-xs text-ink-500">
              Machine-learning driven critical path slippage forecasting, multi-factor delay attribution, and interactive recovery simulation.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-600">Project:</span>
            <select
              value={projectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              className="rounded-lg border border-surface-border bg-white px-3 py-1.5 text-xs font-bold text-ink-900 shadow-xs outline-none focus:ring-2 focus:ring-brand-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              refetchWbs();
              pushToast('Schedule telemetry recalculated.', 'success');
            }}
            className="text-xs"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Recalculate
          </Button>

          {onNavigateToQuality && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onNavigateToQuality}
              className="text-xs font-semibold"
            >
              <ShieldAlert className="mr-1.5 h-3.5 w-3.5 text-brand-600" />
              View Quality NCRs
            </Button>
          )}
        </div>
      </div>

      {/* 6 Executive Delay-Risk & Handover Forecast KPI Scorecards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Delay Risk Score */}
        <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delay Risk Index</span>
            <Flame className="h-4 w-4 text-amber-600 animate-bounce" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-800">68.0</span>
            <span className="text-xs font-semibold text-amber-700">/ 100</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-800">
            <span className="rounded bg-amber-200 px-1 py-0.2">HIGH RISK</span>
            <span>· +6.4 pts this month</span>
          </div>
        </div>

        {/* Forecast Completion Date */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-ink-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Forecast Handover</span>
            <Calendar className="h-4 w-4 text-brand-600" />
          </div>
          <div className="mt-2 flex flex-col">
            <span className="text-base font-extrabold text-ink-900">Jul 20, 2027</span>
            <span className="font-mono text-xs font-bold text-rose-600">+20 Days Slip</span>
          </div>
          <div className="mt-1 text-[10px] text-ink-500">
            <span>Contract Target: Jun 30, 2027</span>
          </div>
        </div>

        {/* Critical Path Zero Float */}
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Critical Path Float</span>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-red-600">0</span>
            <span className="text-xs font-bold text-red-700">Days Buffer</span>
          </div>
          <div className="mt-1 text-[10px] text-red-700 font-bold">
            <span>Float Exhausted (Zero Slack)</span>
          </div>
        </div>

        {/* SPI Schedule Performance Index */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-ink-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Schedule Index (SPI)</span>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-blue-700">0.84</span>
            <span className="text-xs font-semibold text-ink-500">Target &gt; 1.0</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-700 font-medium">
            <TrendingDown className="h-3 w-3 text-rose-500" />
            <span>16% Progress Lag behind plan</span>
          </div>
        </div>

        {/* Delay Cost Overrun Burn Rate */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-ink-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delay Burn Rate</span>
            <DollarSign className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-ink-900">₹3.6</span>
            <span className="text-xs font-semibold text-ink-600">Lakh / Wk</span>
          </div>
          <div className="mt-1 text-[10px] text-rose-600 font-semibold">
            <span>Est. Total Exposure: ₹10.3L</span>
          </div>
        </div>

        {/* Weather & Monsoon Exposure */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-ink-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Weather Risk Hold</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-indigo-700">4.0</span>
            <span className="text-xs font-semibold text-ink-600">Days</span>
          </div>
          <div className="mt-1 text-[10px] text-indigo-600 font-medium">
            <span>Northeast Monsoon alert active</span>
          </div>
        </div>
      </div>

      {/* S-Curve Predictive Progress Chart & Multi-Factor Delay Attribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* S-Curve Predictive Handover Curve */}
        <div className="lg:col-span-7 rounded-xl border border-surface-border bg-surface-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-ink-900">S-Curve Predictive Progress &amp; Slippage Trajectory</h3>
                <p className="text-xs text-ink-500">Baseline Plan vs Ground Progress vs Machine Learning Completion Forecast</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-700">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span> Planned
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Actual Ground
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-700">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span> AI Forecast
                </span>
              </div>
            </div>

            <div className="h-64 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={S_CURVE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                  <Tooltip
                    formatter={(val, name) => [`${val}%`, name === 'planned' ? 'Planned Baseline' : name === 'actual' ? 'Actual Ground' : 'AI Forecast Curve']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                  <Line type="monotone" dataKey="forecast" stroke="#f43f5e" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3, fill: '#f43f5e' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-surface-subtle p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-ink-700">
              <strong className="text-ink-900">Forecast Divergence: </strong>
              Current ground pace projects completion on <strong className="text-rose-700 font-mono">Jul 20, 2027</strong> instead of contracted date <strong className="text-ink-900 font-mono">Jun 30, 2027</strong>.
            </span>
            <span className="rounded bg-rose-100 text-rose-800 font-bold px-2 py-0.5 text-[11px] whitespace-nowrap">
              +20 Days Variance
            </span>
          </div>
        </div>

        {/* Multi-Factor Delay Attribution Drivers */}
        <div className="lg:col-span-5 rounded-xl border border-surface-border bg-surface-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-ink-900">Delay Factor Attribution (Root Causes)</h3>
                <p className="text-xs text-ink-500">Decomposition of the 20-day schedule slippage</p>
              </div>
              <span className="rounded bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 border border-amber-200">
                20 Days Total
              </span>
            </div>

            <div className="flex flex-col gap-3 mt-3">
              {DELAY_ATTRIBUTION.map((item) => (
                <div
                  key={item.factor}
                  onClick={() => setDrillDownFactor(item)}
                  className="group flex flex-col gap-1 rounded-lg border border-surface-border/80 p-2.5 transition-all hover:border-brand-500 hover:bg-brand-50/30 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ink-900 group-hover:text-brand-700">{item.factor}</span>
                    <span className="font-mono font-extrabold text-ink-800">
                      +{item.days}d ({item.share}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.share}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-blue-50/70 p-2.5 text-xs text-blue-900 border border-blue-100 flex items-center justify-between">
            <span>Click any driver above to inspect root causes &amp; mitigations</span>
            <ArrowUpRight className="h-4 w-4 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Milestone Schedule Slippage & Critical Path Heatmap Table */}
      <div className="flex flex-col gap-4 rounded-xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-ink-900">Project Milestone Slippage &amp; Critical Path Heatmap</h3>
            <p className="text-xs text-ink-500">
              Interactive timeline view with drill-down into underlying WBS activities, float consumption, and contractors
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterCriticalOnly
                  ? 'bg-rose-600 text-white'
                  : 'bg-surface-subtle text-ink-700 hover:bg-slate-200'
              }`}
            >
              {filterCriticalOnly ? 'Showing Critical Path Only' : 'Show All Milestones'}
            </button>

            <select
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value)}
              className="rounded-lg border border-surface-border bg-white px-2.5 py-1.5 text-xs text-ink-700 outline-none"
            >
              <option value="ALL">All Disciplines</option>
              <option value="CIVIL">Civil Works</option>
              <option value="STRUCTURAL">Structural</option>
              <option value="MEP">MEP Engineering</option>
              <option value="FAÇADE">Façade &amp; Glazing</option>
              <option value="FINISHING">Finishing</option>
              <option value="MANAGEMENT">Management / Handover</option>
            </select>
          </div>
        </div>

        <Table
          columns={milestoneColumns}
          data={filteredMilestones}
          rowKey={(row) => row.id}
          isLoading={false}
          emptyMessage="No milestones match the selected filter."
        />
      </div>

      {/* DRILL-DOWN MODAL: MILESTONE DEEP INSPECTION */}
      {drillDownMilestone && (
        <Modal
          open={Boolean(drillDownMilestone)}
          onClose={() => setDrillDownMilestone(null)}
          title={`Milestone Slippage Drill-Down: ${drillDownMilestone.code} - ${drillDownMilestone.name}`}
          size="lg"
          footer={
            <div className="flex w-full items-center justify-between">
              <Button variant="outline" onClick={() => setDrillDownMilestone(null)}>
                Close Drill-Down
              </Button>
              <Button
                onClick={() => {
                  pushToast(`Mitigation alert logged for ${drillDownMilestone.code}`, 'success');
                  setDrillDownMilestone(null);
                }}
              >
                Acknowledge &amp; Dispatch Mitigation Plan
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4 text-xs">
            {/* Overview Card */}
            <div className="rounded-xl border border-surface-border bg-surface-subtle/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-2.5">
                <div>
                  <span className="font-mono text-xs font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded">
                    {drillDownMilestone.code}
                  </span>
                  <h3 className="text-sm font-bold text-ink-900 mt-1">{drillDownMilestone.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {drillDownMilestone.isCritical && (
                    <span className="rounded bg-rose-100 text-rose-800 px-2 py-0.5 text-xs font-bold border border-rose-300">
                      CRITICAL PATH (Zero Float)
                    </span>
                  )}
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ${
                      drillDownMilestone.varianceDays > 10 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    +{drillDownMilestone.varianceDays} Days Delayed
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-[11px]">
                <div>
                  <span className="text-ink-500">Contractor Lead:</span>
                  <p className="font-semibold text-ink-900 mt-0.5">{drillDownMilestone.contractor}</p>
                </div>
                <div>
                  <span className="text-ink-500">Planned Completion:</span>
                  <p className="font-mono font-semibold text-ink-900 mt-0.5">{drillDownMilestone.plannedDate}</p>
                </div>
                <div>
                  <span className="text-ink-500">Projected Completion:</span>
                  <p className="font-mono font-bold text-rose-700 mt-0.5">{drillDownMilestone.forecastDate}</p>
                </div>
                <div>
                  <span className="text-ink-500">Total Float Slop:</span>
                  <p className="font-semibold text-ink-900 mt-0.5">{drillDownMilestone.totalFloat} Days</p>
                </div>
              </div>
            </div>

            {/* Root Cause Analysis & Mitigation Plan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
                <span className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-600" /> Ground Root Cause of Delay:
                </span>
                <p className="mt-2 text-rose-800 text-xs leading-relaxed">{drillDownMilestone.delayReason}</p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-emerald-600" /> Engineering Recovery Mitigation:
                </span>
                <p className="mt-2 text-emerald-800 text-xs leading-relaxed">{drillDownMilestone.mitigation}</p>
              </div>
            </div>

            {/* Underlying WBS Activities Breakdown */}
            <div className="rounded-xl border border-surface-border p-3.5 bg-surface-card">
              <span className="font-bold text-ink-900 text-xs">
                Underlying WBS Sub-Activities on this Path ({drillDownMilestone.activities.length}):
              </span>
              <div className="mt-2 flex flex-col gap-2">
                {drillDownMilestone.activities.map((act) => (
                  <div
                    key={act.code}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-surface-border bg-surface-subtle"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {act.code}
                      </span>
                      <span className="font-semibold text-ink-900 text-xs">{act.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-ink-500 text-[11px] font-mono">
                        Duration: {act.plannedDuration}d
                      </span>
                      <span
                        className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                          act.slip > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {act.slip > 0 ? `+${act.slip}d slip` : 'On track'}
                      </span>
                      <span className="rounded bg-slate-200 text-ink-700 text-[10px] font-bold px-2 py-0.5">
                        {act.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* DRILL-DOWN MODAL: DELAY FACTOR DEEP ATTRIBUTION */}
      {drillDownFactor && (
        <Modal
          open={Boolean(drillDownFactor)}
          onClose={() => setDrillDownFactor(null)}
          title={`Delay Driver Attribution: ${drillDownFactor.factor}`}
          size="md"
          footer={
            <Button variant="outline" onClick={() => setDrillDownFactor(null)}>
              Close
            </Button>
          }
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="rounded-xl border border-surface-border bg-surface-subtle p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink-900 text-xs">{drillDownFactor.factor}</span>
                <span className="rounded bg-rose-100 text-rose-800 font-mono font-bold text-xs px-2 py-0.5">
                  +{drillDownFactor.days} Days Attributed ({drillDownFactor.share}%)
                </span>
              </div>
              <p className="mt-2 text-ink-600">
                This factor represents the {drillDownFactor.share}% primary contributor to current project milestone slippages on the critical path.
              </p>
            </div>

            <div className="rounded-xl border border-surface-border p-3.5 bg-surface-card">
              <span className="font-bold text-ink-900 text-xs">Recommended Operational Countermeasures:</span>
              <ul className="mt-2 flex flex-col gap-2 list-disc list-inside text-ink-700">
                <li>Audit subcontractor attendance registers against DPR baseline muster rolls daily.</li>
                <li>Issue contractual cure notice to under-performing trade contractors.</li>
                <li>Pre-authorize overtime allowances to clear backlogged activities over the upcoming weekend.</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
