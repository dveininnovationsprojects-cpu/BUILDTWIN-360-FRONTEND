import { FileText, Compass, CheckCircle2, Calculator, ClipboardList, Camera } from 'lucide-react';

export function DocumentMetricsBar({
  documents = [],
  selectedCategory,
  onSelectCategory,
}) {
  const totalDocs = documents.length;
  const drawingsCount = documents.filter((d) => d.category === 'DRAWING').length;
  const approvalsCount = documents.filter((d) => d.category === 'APPROVAL').length;
  const boqCount = documents.filter((d) => d.category === 'BOQ' || d.category === 'QUOTATION' || d.category === 'INVOICE_EVIDENCE').length;
  const reportsCount = documents.filter((d) => d.category === 'REPORT' || d.category === 'SITE_PHOTO').length;

  const cards = [
    {
      id: 'ALL',
      label: 'Total Documents',
      value: totalDocs,
      subtext: 'Centralized Project Repository',
      icon: FileText,
      color: 'blue',
      active: selectedCategory === 'ALL',
    },
    {
      id: 'DRAWING',
      label: 'Drawings & Blueprints',
      value: drawingsCount,
      subtext: 'Architectural, Structural, MEP',
      icon: Compass,
      color: 'indigo',
      active: selectedCategory === 'DRAWING',
    },
    {
      id: 'APPROVAL',
      label: 'Permits & Approvals',
      value: approvalsCount,
      subtext: 'Municipal & Statutory clearances',
      icon: CheckCircle2,
      color: 'emerald',
      active: selectedCategory === 'APPROVAL',
    },
    {
      id: 'BOQ',
      label: 'BOQs & Financials',
      value: boqCount,
      subtext: 'Estimates, Bids & Invoices',
      icon: Calculator,
      color: 'amber',
      active: selectedCategory === 'BOQ',
    },
    {
      id: 'REPORT',
      label: 'Reports & Site Photos',
      value: reportsCount,
      subtext: 'Inspection logs & evidence',
      icon: ClipboardList,
      color: 'purple',
      active: selectedCategory === 'REPORT',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        const colorClasses = {
          blue: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800',
          indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800',
          emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800',
          amber: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800',
          purple: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800',
        }[c.color];

        return (
          <div
            key={c.id}
            onClick={() => onSelectCategory && onSelectCategory(c.id)}
            className={`surface-panel p-3.5 flex flex-col justify-between rounded-xl border transition-all cursor-pointer hover:shadow-md ${
              c.active
                ? 'ring-2 ring-brand-500 border-brand-500 shadow-sm'
                : 'border-surface-border hover:border-brand-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 line-clamp-1">
                {c.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${colorClasses}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-xl font-bold text-ink-900 tracking-tight">{c.value}</span>
              <p className="text-[10px] text-ink-500 mt-0.5 line-clamp-1">{c.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
