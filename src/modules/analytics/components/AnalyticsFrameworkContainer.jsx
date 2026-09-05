import { useState } from 'react';
import { KpiDictionaryGovernanceModule } from './KpiDictionaryGovernanceModule';
import { BusinessCalculationLogicModule } from './BusinessCalculationLogicModule';
import { SyntheticTestDatasetModule } from './SyntheticTestDatasetModule';
import { AnalyticsDataQualityModule } from './AnalyticsDataQualityModule';
import { ProgressAnalyticsDatasetModule } from './ProgressAnalyticsDatasetModule';
import { ProgressKpiAggregationModule } from './ProgressKpiAggregationModule';
import { BaselineProgressDatasetModule } from './BaselineProgressDatasetModule';
import { Layers, CheckCircle2, ListFilter, Grid, Eye } from 'lucide-react';

export function AnalyticsFrameworkContainer() {
  const [activeTab, setActiveTab] = useState('ALL');

  const modules = [
    { id: 'MOD-01', num: '01', title: 'KPI Dictionary & Metric Governance Framework Draft', key: 'KPI_GOVERNANCE' },
    { id: 'MOD-02', num: '02', title: 'Business Calculation Logic Alignment with Domain Rules', key: 'CALC_LOGIC' },
    { id: 'MOD-03', num: '03', title: 'Synthetic Test Dataset & Data Schema Design', key: 'SYNTHETIC_DATA' },
    { id: 'MOD-04', num: '04', title: 'Analytics Data Quality Checks & Validation Rules', key: 'DATA_QUALITY' },
    { id: 'MOD-05', num: '05', title: 'Progress Analytics Dataset Preparation & Validation', key: 'DATASET_PREP' },
    { id: 'MOD-06', num: '06', title: 'Progress KPI Dataset & Aggregation Validation', key: 'KPI_AGGREGATION' },
    { id: 'MOD-07', num: '07', title: 'Baseline Progress Dataset Structure & Validation', key: 'BASELINE_PROGRESS' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Master Top Control Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> 7 / 7 MODULES READY
              </span>
              <h2 className="text-xl font-bold text-white">BUILDTWIN 360 - Analytics & Metric Framework Specification</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Complete implementation of all 7 domain calculation, schema, governance, quality, and progress validation modules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Grid className="h-3.5 w-3.5" /> View All 7 Modules
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Pills matching exact titles from image */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1">
          {modules.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveTab(m.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === m.key
                  ? 'bg-white text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <span
                className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeTab === m.key ? 'bg-slate-900 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {m.num}
              </span>
              <span>{m.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Module Rendering Body */}
      <div className="flex flex-col gap-6">
        {(activeTab === 'ALL' || activeTab === 'KPI_GOVERNANCE') && <KpiDictionaryGovernanceModule />}
        {(activeTab === 'ALL' || activeTab === 'CALC_LOGIC') && <BusinessCalculationLogicModule />}
        {(activeTab === 'ALL' || activeTab === 'SYNTHETIC_DATA') && <SyntheticTestDatasetModule />}
        {(activeTab === 'ALL' || activeTab === 'DATA_QUALITY') && <AnalyticsDataQualityModule />}
        {(activeTab === 'ALL' || activeTab === 'DATASET_PREP') && <ProgressAnalyticsDatasetModule />}
        {(activeTab === 'ALL' || activeTab === 'KPI_AGGREGATION') && <ProgressKpiAggregationModule />}
        {(activeTab === 'ALL' || activeTab === 'BASELINE_PROGRESS') && <BaselineProgressDatasetModule />}
      </div>
    </div>
  );
}
