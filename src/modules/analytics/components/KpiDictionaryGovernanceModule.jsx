import { useState, useMemo } from 'react';
import { StatusPill, Button, Modal, Input } from '@/design-system';
import { BUILDTWIN_KPI_DICTIONARY } from '../constants/kpiDictionaryData';
import { Search, ShieldCheck, FileText, CheckCircle, Clock, UserCheck, AlertTriangle, Filter } from 'lucide-react';

export function KpiDictionaryGovernanceModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMetric, setSelectedMetric] = useState(null);

  // Extend data with Governance Framework metadata
  const governanceData = useMemo(() => {
    return BUILDTWIN_KPI_DICTIONARY.map((kpi, idx) => ({
      ...kpi,
      governanceStatus: idx % 6 === 0 ? 'DRAFT' : idx % 5 === 0 ? 'IN_REVIEW' : 'APPROVED',
      version: 'v1.2',
      steward: kpi.ownerRole,
      dataCustodian: 'Analytics Data Platform Team',
      lastApprovedDate: '2026-08-15',
      slaHours: kpi.refreshTrigger.includes('Real-time') ? 1 : 24,
      changeControlStatus: 'LOCKED',
    }));
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(governanceData.map((kpi) => kpi.category)));
    return ['ALL', ...cats];
  }, [governanceData]);

  const filteredMetrics = useMemo(() => {
    return governanceData.filter((kpi) => {
      const matchesCategory = selectedCategory === 'ALL' || kpi.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || kpi.governanceStatus === selectedStatus;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        kpi.code.toLowerCase().includes(term) ||
        kpi.name.toLowerCase().includes(term) ||
        kpi.businessPurpose.toLowerCase().includes(term) ||
        kpi.steward.toLowerCase().includes(term);
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [governanceData, selectedCategory, selectedStatus, searchTerm]);

  const stats = useMemo(() => {
    const total = governanceData.length;
    const approved = governanceData.filter((d) => d.governanceStatus === 'APPROVED').length;
    const draft = governanceData.filter((d) => d.governanceStatus === 'DRAFT').length;
    const review = governanceData.filter((d) => d.governanceStatus === 'IN_REVIEW').length;
    return { total, approved, draft, review };
  }, [governanceData]);

  const getStatusTone = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'IN_REVIEW':
        return 'warning';
      case 'DRAFT':
        return 'info';
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
            <span className="rounded bg-brand-100 text-brand-900 px-2 py-0.5 text-xs font-bold font-mono">MODULE 01</span>
            <h2 className="text-xl font-bold text-brand-950">KPI Dictionary & Metric Governance Framework Draft</h2>
          </div>
          <p className="text-xs text-ink-600 mt-1">
            Standardized definitions, data lineage, stewardship roles, SLAs, and approval workflows for all 360 construction metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-xs gap-1.5">
            <FileText className="h-3.5 w-3.5 text-brand-600" /> Export Governance Spec (PDF)
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg bg-surface-subtle p-3 border border-surface-border">
          <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Total Defined KPIs</div>
          <div className="text-xl font-bold text-brand-950 mt-0.5">{stats.total} Metrics</div>
          <div className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle className="h-3 w-3" /> 100% Coverage Target
          </div>
        </div>

        <div className="rounded-lg bg-emerald-50/60 p-3 border border-emerald-200">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Governance Approved</div>
          <div className="text-xl font-bold text-emerald-950 mt-0.5">{stats.approved} Metrics</div>
          <div className="text-[10px] text-emerald-700 mt-1">Sign-off by Executive Board</div>
        </div>

        <div className="rounded-lg bg-amber-50/60 p-3 border border-amber-200">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">In Peer Review</div>
          <div className="text-xl font-bold text-amber-950 mt-0.5">{stats.review} Metrics</div>
          <div className="text-[10px] text-amber-700 mt-1">Under QS & Domain Review</div>
        </div>

        <div className="rounded-lg bg-sky-50/60 p-3 border border-sky-200">
          <div className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider">Framework Draft</div>
          <div className="text-xl font-bold text-sky-950 mt-0.5">{stats.draft} Metrics</div>
          <div className="text-[10px] text-sky-700 mt-1">Pending Steward Sign-off</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-surface-subtle p-3 rounded-lg border border-surface-border">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
          <Input
            placeholder="Search metric code, name, steward or purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-ink-500" />
            <span className="text-xs font-semibold text-ink-700">Status:</span>
            {['ALL', 'APPROVED', 'IN_REVIEW', 'DRAFT'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all ${
                  selectedStatus === st
                    ? 'bg-brand-900 text-white shadow-sm'
                    : 'bg-white text-ink-700 hover:bg-slate-100 border border-surface-border'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-ink-500 whitespace-nowrap mr-1">Category Domain:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3 py-0.5 text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-slate-800 text-white'
                : 'bg-surface-subtle text-ink-700 hover:bg-slate-200 border border-surface-border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Governance Framework Metric Table */}
      <div className="overflow-x-auto rounded-lg border border-surface-border">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-surface-border bg-surface-subtle text-ink-700 font-semibold">
            <tr>
              <th className="px-3.5 py-2.5">Code & Metric Name</th>
              <th className="px-3.5 py-2.5">Category</th>
              <th className="px-3.5 py-2.5">Governance Status</th>
              <th className="px-3.5 py-2.5">Data Steward</th>
              <th className="px-3.5 py-2.5">Refresh SLA</th>
              <th className="px-3.5 py-2.5">Version & Lock</th>
              <th className="px-3.5 py-2.5 text-right">Framework Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border bg-white">
            {filteredMetrics.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-500">
                  No matching KPI governance definitions found.
                </td>
              </tr>
            ) : (
              filteredMetrics.map((kpi) => (
                <tr key={kpi.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="px-3.5 py-3 font-medium text-brand-950">
                    <div className="font-mono text-xs font-bold text-brand-600">{kpi.code}</div>
                    <div className="font-semibold text-ink-900">{kpi.name}</div>
                  </td>
                  <td className="px-3.5 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-[11px] text-slate-800 border border-slate-200">
                      {kpi.category}
                    </span>
                  </td>
                  <td className="px-3.5 py-3">
                    <StatusPill status={kpi.governanceStatus.replace('_', ' ')} tone={getStatusTone(kpi.governanceStatus)} />
                  </td>
                  <td className="px-3.5 py-3 text-[11px]">
                    <div className="font-medium text-ink-900 flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-brand-500" /> {kpi.steward}
                    </div>
                    <div className="text-ink-500 text-[10px]">{kpi.dataCustodian}</div>
                  </td>
                  <td className="px-3.5 py-3 text-[11px]">
                    <div className="font-medium text-ink-800 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-sky-600" /> {kpi.refreshTrigger}
                    </div>
                  </td>
                  <td className="px-3.5 py-3 text-[11px]">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {kpi.version}
                    </span>
                    <span className="text-[10px] text-emerald-600 block font-semibold mt-0.5">{kpi.changeControlStatus}</span>
                  </td>
                  <td className="px-3.5 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMetric(kpi)}
                      className="text-xs gap-1"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> Governance Spec
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed Metric Governance Specification Modal */}
      {selectedMetric && (
        <Modal
          open={!!selectedMetric}
          onClose={() => setSelectedMetric(null)}
          title={`Governance Specification — ${selectedMetric.code}`}
          size="lg"
        >
          <div className="flex flex-col gap-4 text-xs text-ink-800">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <div className="font-mono text-sm font-bold text-brand-600">{selectedMetric.code}</div>
                <h3 className="text-base font-bold text-brand-950">{selectedMetric.name}</h3>
              </div>
              <StatusPill status={selectedMetric.governanceStatus.replace('_', ' ')} tone={getStatusTone(selectedMetric.governanceStatus)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded bg-surface-subtle p-2.5 border border-surface-border">
                <div className="font-semibold text-ink-900">Data Steward (Owner)</div>
                <div className="text-brand-900 font-medium">{selectedMetric.steward}</div>
              </div>
              <div className="rounded bg-surface-subtle p-2.5 border border-surface-border">
                <div className="font-semibold text-ink-900">Data Custodian Team</div>
                <div className="text-ink-700">{selectedMetric.dataCustodian}</div>
              </div>
              <div className="rounded bg-surface-subtle p-2.5 border border-surface-border">
                <div className="font-semibold text-ink-900">Version & Freeze Date</div>
                <div className="text-ink-700">{selectedMetric.version} (Approved: {selectedMetric.lastApprovedDate})</div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-ink-900 mb-1">Business Definition & Governance Purpose</h4>
              <p className="rounded bg-slate-50 p-2.5 text-ink-700 leading-relaxed border border-slate-200">
                {selectedMetric.businessPurpose}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-ink-900 mb-1">Source Data Lineage & Schema Tables</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedMetric.sourceTables.map((tbl) => (
                  <span key={tbl} className="rounded bg-slate-900 text-emerald-300 font-mono text-[11px] px-2 py-1">
                    {tbl}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-3 space-y-2">
              <h4 className="font-bold text-brand-950 text-xs flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-600" /> Metric Governance Rules & SLA
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <div className="rounded bg-white p-2 border border-brand-100">
                  <div className="font-semibold text-brand-900">Refresh Frequency SLA</div>
                  <div className="text-ink-700">{selectedMetric.refreshTrigger}</div>
                </div>
                <div className="rounded bg-white p-2 border border-brand-100">
                  <div className="font-semibold text-brand-900">Exclusion & Edge Guardrails</div>
                  <div className="text-ink-700">{selectedMetric.exclusions}</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
