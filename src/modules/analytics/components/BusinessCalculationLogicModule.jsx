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

  return (
    <div className="flex flex-col gap-4">
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
