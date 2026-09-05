import { useState, useMemo } from 'react';
import { StatusPill, Button } from '@/design-system';
import { Network, Layers, CheckCircle2, ChevronRight, AlertCircle, BarChart, Scale } from 'lucide-react';

export function ProgressKpiAggregationModule() {
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  const hierarchyData = [
    {
      id: 'LEVEL-0',
      level: 'PROJECT',
      code: 'PRJ-001',
      name: 'Padur Residence Project (Master Aggregation)',
      weightage: '1.0000 (100.0%)',
      calculatedProgress: '68.50%',
      groundTruthSurvey: '68.20%',
      variance: '+0.30%',
      status: 'VALIDATED',
      subNodes: '2 Buildings (Tower A & Tower B)'
    },
    {
      id: 'LEVEL-1A',
      level: 'BUILDING',
      code: 'PRJ-001.T1',
      name: 'Tower A (Residential Block - 14 Floors)',
      weightage: '0.6000 (60.0%)',
      calculatedProgress: '72.00%',
      groundTruthSurvey: '72.00%',
      variance: '0.00%',
      status: 'VALIDATED',
      subNodes: '14 Floor Packages'
    },
    {
      id: 'LEVEL-1B',
      level: 'BUILDING',
      code: 'PRJ-001.T2',
      name: 'Tower B (Commercial & Amenities Block)',
      weightage: '0.4000 (40.0%)',
      calculatedProgress: '63.25%',
      groundTruthSurvey: '62.50%',
      variance: '+0.75%',
      status: 'VALIDATED',
      subNodes: '8 Floor Packages'
    },
    {
      id: 'LEVEL-2A',
      level: 'FLOOR',
      code: 'PRJ-001.T1.F1',
      name: 'Tower A — Ground Floor Structural Slab',
      weightage: '0.0800 (8.0%)',
      calculatedProgress: '100.00%',
      groundTruthSurvey: '100.00%',
      variance: '0.00%',
      status: 'VALIDATED',
      subNodes: '4 Work Packages (Civil, Rebar, Concrete, MEP)'
    },
    {
      id: 'LEVEL-2B',
      level: 'FLOOR',
      code: 'PRJ-001.T1.F2',
      name: 'Tower A — 1st Floor Columns & Beams',
      weightage: '0.0750 (7.5%)',
      calculatedProgress: '85.00%',
      groundTruthSurvey: '84.00%',
      variance: '+1.00%',
      status: 'VALIDATED',
      subNodes: '4 Work Packages'
    },
    {
      id: 'LEVEL-3A',
      level: 'WORK_PACKAGE',
      code: 'PRJ-001.T1.F2.CIV',
      name: 'Civil Concrete Works — Floor 1',
      weightage: '0.0400 (4.0%)',
      calculatedProgress: '90.00%',
      groundTruthSurvey: '90.00%',
      variance: '0.00%',
      status: 'VALIDATED',
      subNodes: '3 Activity Packages'
    }
  ];

  const filteredHierarchy = useMemo(() => {
    return hierarchyData.filter((item) => selectedLevel === 'ALL' || item.level === selectedLevel);
  }, [hierarchyData, selectedLevel]);

  return (
    <div className="flex flex-col gap-5 bg-white p-5 rounded-xl border border-surface-border shadow-sm">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand-100 text-brand-900 px-2 py-0.5 text-xs font-bold font-mono">MODULE 06</span>
            <h2 className="text-xl font-bold text-brand-950">Progress KPI Dataset & Aggregation Validation</h2>
          </div>
          <p className="text-xs text-ink-600 mt-1">
            Hierarchical weighted progress aggregation engine (Project → Tower → Floor → Package) with ground-truth survey cross-validation.
          </p>
        </div>
      </div>

      {/* Aggregation Integrity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-lg bg-surface-subtle p-3 border border-surface-border">
          <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Weight Sum Check</div>
          <div className="text-xl font-bold text-emerald-700 font-mono mt-0.5">Sum = 1.0000 (100%)</div>
          <div className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Zero Weightage Drift
          </div>
        </div>

        <div className="rounded-lg bg-surface-subtle p-3 border border-surface-border">
          <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Master Calculated Progress</div>
          <div className="text-xl font-bold text-brand-950 font-mono mt-0.5">68.50% Physical</div>
          <div className="text-[10px] text-ink-500 mt-1">Weighted WBS Rollup</div>
        </div>

        <div className="rounded-lg bg-surface-subtle p-3 border border-surface-border">
          <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Site Survey Ground Truth</div>
          <div className="text-xl font-bold text-slate-800 font-mono mt-0.5">68.20% Measured</div>
          <div className="text-[10px] text-ink-500 mt-1">Padur Total Station Survey</div>
        </div>

        <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Aggregation Variance</div>
          <div className="text-xl font-bold text-emerald-950 font-mono mt-0.5">+0.30% Delta</div>
          <div className="text-[10px] text-emerald-700 mt-1">Well Within ±1.0% Tolerance</div>
        </div>
      </div>

      {/* Hierarchy Level Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-ink-600 whitespace-nowrap">Aggregation Level:</span>
        {['ALL', 'PROJECT', 'BUILDING', 'FLOOR', 'WORK_PACKAGE'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setSelectedLevel(lvl)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              selectedLevel === lvl
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-surface-subtle text-ink-700 hover:bg-slate-200 border border-surface-border'
            }`}
          >
            {lvl.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Aggregation Hierarchy Table */}
      <div className="overflow-x-auto rounded-lg border border-surface-border">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-surface-border bg-surface-subtle text-ink-700 font-semibold">
            <tr>
              <th className="px-3.5 py-2.5">WBS Code & Node Title</th>
              <th className="px-3.5 py-2.5">Level</th>
              <th className="px-3.5 py-2.5">WBS Weightage</th>
              <th className="px-3.5 py-2.5">Calculated Progress %</th>
              <th className="px-3.5 py-2.5">Ground Truth Survey</th>
              <th className="px-3.5 py-2.5">Variance</th>
              <th className="px-3.5 py-2.5 text-right">Validation Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border bg-white">
            {filteredHierarchy.map((row) => (
              <tr key={row.id} className="hover:bg-surface-subtle/50 transition-colors">
                <td className="px-3.5 py-3 font-medium text-brand-950">
                  <div className="font-mono text-xs font-bold text-brand-600 flex items-center gap-1">
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" /> {row.code}
                  </div>
                  <div className="font-semibold text-ink-900 pl-4">{row.name}</div>
                  <div className="text-[10px] text-ink-500 pl-4 mt-0.5">{row.subNodes}</div>
                </td>
                <td className="px-3.5 py-3">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-800 border border-slate-200">
                    {row.level}
                  </span>
                </td>
                <td className="px-3.5 py-3 font-mono font-bold text-slate-800">{row.weightage}</td>
                <td className="px-3.5 py-3 font-mono font-bold text-brand-900">{row.calculatedProgress}</td>
                <td className="px-3.5 py-3 font-mono text-slate-700">{row.groundTruthSurvey}</td>
                <td className="px-3.5 py-3 font-mono font-bold text-emerald-700">{row.variance}</td>
                <td className="px-3.5 py-3 text-right">
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold border border-emerald-300">
                    <CheckCircle2 className="h-3 w-3" /> {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
