import { useState, useMemo } from 'react';
import { StatusPill, Button, Modal } from '@/design-system';
import { CheckCircle, AlertTriangle, XCircle, Play, ShieldAlert, FileSearch, RefreshCw, BarChart2, Filter } from 'lucide-react';

export function AnalyticsDataQualityModule() {
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [selectedRuleType, setSelectedRuleType] = useState('ALL');
  const [selectedRule, setSelectedRule] = useState(null);

  const rulesData = [
    {
      id: 'DQ-RULE-01',
      name: 'Non-Negative Quantity Check',
      type: 'RANGE_SANITY',
      targetTable: 'dpr_activity_progress',
      targetColumn: 'qty_today',
      description: 'Ensures physical daily quantity logged on DPR is >= 0. Flags negative progress input errors.',
      threshold: '0 Violations',
      status: 'PASSED',
      scannedRows: 14250,
      violations: 0,
      severity: 'HIGH',
      resolution: 'Reject DPR submission automatically if qty_today < 0.'
    },
    {
      id: 'DQ-RULE-02',
      name: 'Schedule Performance Index Range (0.0 - 2.5)',
      type: 'RANGE_SANITY',
      targetTable: 'analytics_project_metrics',
      targetColumn: 'spi',
      description: 'SPI must fall within reasonable boundary [0.0, 2.5]. Values outside indicate mathematical anomalies.',
      threshold: '0.00% anomaly rate',
      status: 'PASSED',
      scannedRows: 850,
      violations: 0,
      severity: 'HIGH',
      resolution: 'Cap extreme SPI at 2.50 and trigger anomaly log.'
    },
    {
      id: 'DQ-RULE-03',
      name: 'Orphan DPR Activity Linkage Check',
      type: 'FOREIGN_KEY_INTEGRITY',
      targetTable: 'dpr_activity_progress',
      targetColumn: 'activity_id',
      description: 'Validates that every DPR progress record links to a valid parent WBS activity ID.',
      threshold: '100% Referential Integrity',
      status: 'PASSED',
      scannedRows: 14250,
      violations: 0,
      severity: 'CRITICAL',
      resolution: 'Enforce DB Foreign Key constraint with CASCADE RESTRICT.'
    },
    {
      id: 'DQ-RULE-04',
      name: 'Approved Header Status Rule',
      type: 'COMPLETENESS',
      targetTable: 'dpr_headers',
      targetColumn: 'status',
      description: 'DPR details must not be included in executive progress KPIs unless header status = APPROVED.',
      threshold: '0 Unapproved Records',
      status: 'WARNING',
      scannedRows: 1240,
      violations: 14,
      severity: 'MEDIUM',
      resolution: 'Exclude 14 draft DPR records from executive rollup dataset.'
    },
    {
      id: 'DQ-RULE-05',
      name: 'Temporal Sequence Consistency Check',
      type: 'TEMPORAL_CONSISTENCY',
      targetTable: 'activities',
      targetColumn: 'planned_start_date',
      description: 'Planned End Date must be strictly >= Planned Start Date.',
      threshold: '0 Date Order Inversions',
      status: 'PASSED',
      scannedRows: 620,
      violations: 0,
      severity: 'CRITICAL',
      resolution: 'UI validation prevents setting end date prior to start date.'
    },
    {
      id: 'DQ-RULE-06',
      name: 'Cost Transaction & Invoice Matching',
      type: 'FINANCIAL_RECONCILIATION',
      targetTable: 'cost_transactions',
      targetColumn: 'amount',
      description: 'Actual costs must align with verified SAP / ERP invoice voucher postings.',
      threshold: 'Variance < 0.01%',
      status: 'PASSED',
      scannedRows: 3410,
      violations: 0,
      severity: 'HIGH',
      resolution: 'Perform nightly double-entry ledger reconciliation.'
    }
  ];

  const filteredRules = useMemo(() => {
    return rulesData.filter((r) => selectedRuleType === 'ALL' || r.type === selectedRuleType);
  }, [rulesData, selectedRuleType]);

  const stats = useMemo(() => {
    const totalScanned = rulesData.reduce((acc, r) => acc + r.scannedRows, 0);
    const passedRules = rulesData.filter((r) => r.status === 'PASSED').length;
    const totalRules = rulesData.length;
    const healthScore = ((passedRules / totalRules) * 100).toFixed(1);
    return { totalScanned, passedRules, totalRules, healthScore };
  }, [rulesData]);

  const handleRunAudit = () => {
    setIsRunningAudit(true);
    setTimeout(() => {
      setIsRunningAudit(false);
    }, 1200);
  };

  const getStatusTone = (status) => {
    switch (status) {
      case 'PASSED':
        return 'success';
      case 'WARNING':
        return 'warning';
      case 'FAILED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="flex flex-col gap-5 bg-white p-5 rounded-xl border border-surface-border shadow-sm">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand-100 text-brand-900 px-2 py-0.5 text-xs font-bold font-mono">MODULE 04</span>
            <h2 className="text-xl font-bold text-brand-950">Analytics Data Quality Checks & Validation Rules</h2>
          </div>
          <p className="text-xs text-ink-600 mt-1">
            Automated quality enforcement rules, range sanity checks, referential integrity monitoring, and data health scoring.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRunAudit}
            disabled={isRunningAudit}
            className="text-xs gap-1.5 bg-brand-900 text-white hover:bg-brand-950"
          >
            <Play className={`h-3.5 w-3.5 ${isRunningAudit ? 'animate-spin' : ''}`} />
            {isRunningAudit ? 'Running Quality Audit...' : 'Run Data Quality Audit'}
          </Button>
        </div>
      </div>

      {/* Health Score Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-lg bg-emerald-900 text-white p-3.5 border border-emerald-950">
          <div className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider">Data Quality Health Score</div>
          <div className="text-2xl font-bold mt-1 text-emerald-300">{stats.healthScore}% Clean</div>
          <div className="text-[10px] text-emerald-200 mt-1">Operational Analytics Grade: A+</div>
        </div>

        <div className="rounded-lg bg-surface-subtle p-3.5 border border-surface-border">
          <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Active Validation Rules</div>
          <div className="text-2xl font-bold text-brand-950 mt-1">{stats.totalRules} Rules</div>
          <div className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle className="h-3 w-3" /> {stats.passedRules} Passing
          </div>
        </div>

        <div className="rounded-lg bg-surface-subtle p-3.5 border border-surface-border">
          <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Total Scanned Records</div>
          <div className="text-2xl font-bold text-brand-950 mt-1">{stats.totalScanned.toLocaleString()} Rows</div>
          <div className="text-[10px] text-ink-500 mt-1">Across 6 Data Warehouses</div>
        </div>

        <div className="rounded-lg bg-amber-50 p-3.5 border border-amber-200">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Open Warnings</div>
          <div className="text-2xl font-bold text-amber-950 mt-1">1 Rule Alert</div>
          <div className="text-[10px] text-amber-700 mt-1">14 Unapproved DPR rows isolated</div>
        </div>
      </div>

      {/* Filter by Rule Category */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-ink-600 whitespace-nowrap">Filter Rule Type:</span>
        {['ALL', 'RANGE_SANITY', 'FOREIGN_KEY_INTEGRITY', 'COMPLETENESS', 'TEMPORAL_CONSISTENCY', 'FINANCIAL_RECONCILIATION'].map(
          (t) => (
            <button
              key={t}
              onClick={() => setSelectedRuleType(t)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                selectedRuleType === t
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-surface-subtle text-ink-700 hover:bg-slate-200 border border-surface-border'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          )
        )}
      </div>

      {/* Quality Rules Table */}
      <div className="overflow-x-auto rounded-lg border border-surface-border">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-surface-border bg-surface-subtle text-ink-700 font-semibold">
            <tr>
              <th className="px-3.5 py-2.5">Rule ID & Name</th>
              <th className="px-3.5 py-2.5">Rule Type</th>
              <th className="px-3.5 py-2.5">Target Table / Column</th>
              <th className="px-3.5 py-2.5">Status</th>
              <th className="px-3.5 py-2.5">Scanned / Violations</th>
              <th className="px-3.5 py-2.5">Severity</th>
              <th className="px-3.5 py-2.5 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border bg-white">
            {filteredRules.map((rule) => (
              <tr key={rule.id} className="hover:bg-surface-subtle/50 transition-colors">
                <td className="px-3.5 py-3 font-medium text-brand-950">
                  <div className="font-mono text-xs font-bold text-brand-600">{rule.id}</div>
                  <div className="font-semibold text-ink-900">{rule.name}</div>
                </td>
                <td className="px-3.5 py-3">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-[10px] font-mono text-slate-800 border border-slate-200">
                    {rule.type}
                  </span>
                </td>
                <td className="px-3.5 py-3 text-[11px]">
                  <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                    {rule.targetTable}.{rule.targetColumn}
                  </code>
                </td>
                <td className="px-3.5 py-3">
                  <StatusPill status={rule.status} tone={getStatusTone(rule.status)} />
                </td>
                <td className="px-3.5 py-3 text-[11px]">
                  <div className="font-medium text-ink-900">{rule.scannedRows.toLocaleString()} scanned</div>
                  <div className={rule.violations > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-medium'}>
                    {rule.violations} violations
                  </div>
                </td>
                <td className="px-3.5 py-3">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      rule.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : rule.severity === 'HIGH'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {rule.severity}
                  </span>
                </td>
                <td className="px-3.5 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => setSelectedRule(rule)} className="text-xs gap-1">
                    <FileSearch className="h-3.5 w-3.5 text-brand-600" /> Rule Spec
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rule Detail Modal */}
      {selectedRule && (
        <Modal open={!!selectedRule} onClose={() => setSelectedRule(null)} title={`Validation Rule Spec — ${selectedRule.id}`} size="md">
          <div className="flex flex-col gap-4 text-xs text-ink-800">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <div className="font-mono text-sm font-bold text-brand-600">{selectedRule.id}</div>
                <h3 className="text-base font-bold text-brand-950">{selectedRule.name}</h3>
              </div>
              <StatusPill status={selectedRule.status} tone={getStatusTone(selectedRule.status)} />
            </div>

            <div>
              <h4 className="font-bold text-ink-900 mb-1">Rule Description</h4>
              <p className="rounded bg-surface-subtle p-2.5 text-ink-700">{selectedRule.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="rounded bg-slate-50 p-2 border border-slate-200">
                <span className="font-semibold text-slate-700 block">Target Entity & Column</span>
                <code className="text-brand-900 font-mono font-bold">
                  {selectedRule.targetTable}.{selectedRule.targetColumn}
                </code>
              </div>
              <div className="rounded bg-slate-50 p-2 border border-slate-200">
                <span className="font-semibold text-slate-700 block">Configured Threshold</span>
                <span className="text-ink-900 font-medium">{selectedRule.threshold}</span>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
              <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5 mb-1">
                <ShieldAlert className="h-4 w-4 text-amber-600" /> Automated Remediation Action
              </h4>
              <p className="text-amber-900 text-[11px] leading-relaxed">{selectedRule.resolution}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
