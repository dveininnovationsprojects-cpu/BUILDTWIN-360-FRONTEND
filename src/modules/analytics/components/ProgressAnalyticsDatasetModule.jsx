import { useState } from 'react';
import { StatusPill, Button } from '@/design-system';
import { ArrowRight, CheckCircle2, RefreshCw, Layers, Filter, Cpu, Database, Check, AlertCircle } from 'lucide-react';

export function ProgressAnalyticsDatasetModule() {
  const [activeStep, setActiveStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const pipelineSteps = [
    {
      step: 1,
      title: 'Raw Data Ingestion',
      subtitle: 'Extract from DPR headers & activity logs',
      status: 'COMPLETED',
      inputCount: '14,500 Raw Submissions',
      outputCount: '14,500 Extracted Rows',
      details: 'Ingests site daily logs, weather conditions, contractor attendance, and activity progress entries.'
    },
    {
      step: 2,
      title: 'Cleaning & Deduplication',
      subtitle: 'Filter draft DPRs & remove site duplicates',
      status: 'COMPLETED',
      inputCount: '14,500 Extracted Rows',
      outputCount: '14,250 Valid Rows',
      details: 'Isolates 250 duplicate / draft site entries. Enforces unique constraint on (activity_id, log_date).'
    },
    {
      step: 3,
      title: 'Weightage & Progress Normalization',
      subtitle: 'Compute physical % & EV calculations',
      status: 'COMPLETED',
      inputCount: '14,250 Valid Rows',
      outputCount: '14,250 Computed Rows',
      details: 'Applies formula: min(1.0, Cumulative Approved / Planned Qty) * WBS Weightage. Computes Earned Value in INR.'
    },
    {
      step: 4,
      title: 'Anomaly & Outlier Screening',
      subtitle: 'Flag spikes (>20%/day) & impossible progress',
      status: 'COMPLETED',
      inputCount: '14,250 Computed Rows',
      outputCount: '14,220 Clean Rows (30 Flagged)',
      details: 'Detects unusual single-day progress leaps. Flags 30 entries for Site Supervisor audit.'
    },
    {
      step: 5,
      title: 'Fact Dataset Publication',
      subtitle: 'Load into fact_progress_daily warehouse table',
      status: 'COMPLETED',
      inputCount: '14,220 Clean Rows',
      outputCount: '14,220 Warehouse Records',
      details: 'Publishes clean, immutable progress snapshots for Executive Dashboard & SPI/CPI calculation engines.'
    }
  ];

  const currentStepObj = pipelineSteps.find((s) => s.step === activeStep);

  const handleRunPipeline = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-5 bg-white p-5 rounded-xl border border-surface-border shadow-sm">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand-100 text-brand-900 px-2 py-0.5 text-xs font-bold font-mono">MODULE 05</span>
            <h2 className="text-xl font-bold text-brand-950">Progress Analytics Dataset Preparation & Validation</h2>
          </div>
          <p className="text-xs text-ink-600 mt-1">
            ETL pipeline workflow transforming raw DPR logs into verified, warehouse-grade progress analytics datasets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRunPipeline}
            disabled={isProcessing}
            className="text-xs gap-1.5 bg-brand-900 text-white hover:bg-brand-950"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            {isProcessing ? 'Executing Pipeline...' : 'Re-Run Preparation Pipeline'}
          </Button>
        </div>
      </div>

      {/* 5-Step Visual Pipeline Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {pipelineSteps.map((s) => (
          <button
            key={s.step}
            onClick={() => setActiveStep(s.step)}
            className={`flex flex-col p-3 rounded-lg border text-left transition-all relative ${
              activeStep === s.step
                ? 'bg-brand-900 text-white border-brand-950 shadow-md ring-2 ring-brand-500/30'
                : 'bg-surface-subtle hover:bg-slate-100 border-surface-border text-ink-900'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span
                className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeStep === s.step ? 'bg-brand-800 text-brand-100' : 'bg-slate-200 text-slate-800'
                }`}
              >
                STEP 0{s.step}
              </span>
              <CheckCircle2 className={`h-4 w-4 ${activeStep === s.step ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div className="font-bold text-xs leading-snug">{s.title}</div>
            <div className={`text-[10px] mt-1 line-clamp-1 ${activeStep === s.step ? 'text-brand-200' : 'text-ink-500'}`}>
              {s.subtitle}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Step Inspector */}
      <div className="rounded-lg border border-surface-border bg-slate-50 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-brand-700">STAGE {currentStepObj.step} OF 5</span>
              <h3 className="text-base font-bold text-brand-950">{currentStepObj.title}</h3>
            </div>
            <p className="text-xs text-ink-700 mt-0.5">{currentStepObj.details}</p>
          </div>
          <span className="rounded bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 border border-emerald-300">
            Pipeline Validation: PASSED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded bg-white p-3 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Input Records Received</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{currentStepObj.inputCount}</span>
          </div>

          <div className="rounded bg-white p-3 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Output Clean Records</span>
            <span className="text-lg font-bold text-emerald-700 font-mono">{currentStepObj.outputCount}</span>
          </div>

          <div className="rounded bg-white p-3 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Target Warehouse Entity</span>
            <span className="text-sm font-bold text-brand-900 font-mono">
              {activeStep === 5 ? 'fact_progress_daily' : `staging_step_0${activeStep}`}
            </span>
          </div>
        </div>

        {/* Data Sample Preview for current step */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-ink-900 flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-brand-600" /> Transformation Sample — Stage 0{activeStep} Output
            </h4>
            <span className="text-[10px] text-ink-500">Showing top 3 verified rows</span>
          </div>

          <div className="overflow-x-auto rounded border border-slate-200 bg-white">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-200 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2">record_id</th>
                  <th className="px-3 py-2">wbs_code</th>
                  <th className="px-3 py-2">qty_approved</th>
                  <th className="px-3 py-2">weightage</th>
                  <th className="px-3 py-2">physical_progress_pct</th>
                  <th className="px-3 py-2">etl_status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-900 font-bold">REC-00981</td>
                  <td className="px-3 py-2 text-brand-700 font-bold">PRJ-01.T1.F1.ACT-01</td>
                  <td className="px-3 py-2 text-slate-800">120.00 m³</td>
                  <td className="px-3 py-2 text-slate-800">0.0500</td>
                  <td className="px-3 py-2 text-emerald-700 font-bold">5.00%</td>
                  <td className="px-3 py-2 text-emerald-600 font-semibold">VALIDATED</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-900 font-bold">REC-00982</td>
                  <td className="px-3 py-2 text-brand-700 font-bold">PRJ-01.T1.F1.ACT-02</td>
                  <td className="px-3 py-2 text-slate-800">45.50 MT</td>
                  <td className="px-3 py-2 text-slate-800">0.0800</td>
                  <td className="px-3 py-2 text-emerald-700 font-bold">8.00%</td>
                  <td className="px-3 py-2 text-emerald-600 font-semibold">VALIDATED</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-900 font-bold">REC-00983</td>
                  <td className="px-3 py-2 text-brand-700 font-bold">PRJ-01.T1.F2.ACT-04</td>
                  <td className="px-3 py-2 text-slate-800">210.00 m³</td>
                  <td className="px-3 py-2 text-slate-800">0.1200</td>
                  <td className="px-3 py-2 text-emerald-700 font-bold">12.00%</td>
                  <td className="px-3 py-2 text-emerald-600 font-semibold">VALIDATED</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
