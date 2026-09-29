import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ClipboardList,
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Scale,
  Calendar,
  Building,
  Layers,
  FileText,
  Eye,
  LayoutGrid,
  List,
  MapPin,
  Package,
} from 'lucide-react';
import { Table, Button } from '@/design-system';
import {
  stockLedgerApi,
  STOCK_TRANSACTION_TYPES,
  UNIT_LABEL_MAP,
} from '../api/materialsInventoryApi';
import { projectsApi } from '@/modules/projects/api/projectsApi';
import { wbsScheduleApi } from '@/modules/wbs-schedule/api/wbsScheduleApi';
import { StockLedgerDetailModal } from './StockLedgerDetailModal';

const TYPE_CONFIG = {
  RECEIPT: {
    label: 'Receipt (Inward)',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    icon: ArrowUpRight,
    isPositive: true,
  },
  ISSUE: {
    label: 'Issue (To Site)',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    icon: ArrowDownRight,
    isPositive: false,
  },
  CONSUMPTION: {
    label: 'Consumption',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    icon: ArrowDownRight,
    isPositive: false,
  },
  WASTAGE: {
    label: 'Wastage / Scrap',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    icon: ArrowDownRight,
    isPositive: false,
  },
  RETURN: {
    label: 'Return To Store',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
    icon: ArrowUpRight,
    isPositive: true,
  },
  ADJUSTMENT: {
    label: 'Audit Adjustment',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    icon: RefreshCw,
    isPositive: null,
  },
};

export function StockLedgerAuditView({
  selectedProjectId = 1,
  onOpenTransactionModal,
  onOpenReconcileModal,
  materials = [],
}) {
  const [projectId, setProjectId] = useState(selectedProjectId || 1);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-dropdown-list'],
    queryFn: () => projectsApi.list(),
    staleTime: 60_000,
  });

  // Sync projectId when projects or prop changes
  React.useEffect(() => {
    if (selectedProjectId) {
      setProjectId(selectedProjectId);
    } else if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [selectedProjectId, projects]);

  // Fetch WBS Activities for current project
  const { data: wbsActivities = [] } = useQuery({
    queryKey: ['wbs-activities-project', Number(projectId)],
    queryFn: () => wbsScheduleApi.list(Number(projectId)),
    enabled: Boolean(projectId),
    staleTime: 30_000,
  });

  // Fetch stock ledger based on filters:
  // If activity selected -> stockLedgerApi.getLedgerByActivity
  // Else if material selected -> stockLedgerApi.getLedgerByMaterial
  // Else -> stockLedgerApi.getLedgerByProject
  const queryKey = selectedActivityId
    ? ['stock-ledger-activity', Number(selectedActivityId)]
    : selectedMaterialId
    ? ['stock-ledger-material', Number(selectedMaterialId)]
    : ['stock-ledger-project', Number(projectId)];

  const queryFn = () => {
    if (selectedActivityId) return stockLedgerApi.getLedgerByActivity(Number(selectedActivityId));
    if (selectedMaterialId) return stockLedgerApi.getLedgerByMaterial(Number(selectedMaterialId));
    return stockLedgerApi.getLedgerByProject(Number(projectId));
  };

  const {
    data: rawEntries = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey,
    queryFn,
    staleTime: 10_000,
    enabled: Boolean(selectedActivityId || selectedMaterialId || projectId),
  });

  // Client filtering with null-safe array
  const safeEntries = Array.isArray(rawEntries) ? rawEntries : [];
  const entries = safeEntries.filter((item) => {
    if (!item) return false;
    if (typeFilter && item.transactionType !== typeFilter) return false;
    if (selectedMaterialId && String(item.materialId) !== String(selectedMaterialId)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const ref = (item.referenceId || '').toLowerCase();
      const rem = (item.remarks || '').toLowerCase();
      const mat = (item.materialName || item.material?.name || '').toLowerCase();
      const code = (item.materialCode || item.material?.materialCode || '').toLowerCase();
      const zone = (item.zone || '').toLowerCase();
      if (!ref.includes(q) && !rem.includes(q) && !mat.includes(q) && !code.includes(q) && !zone.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const columns = [
    {
      key: 'timestamp',
      header: 'Date & Time',
      render: (row) => {
        const d = row.timestamp ? new Date(row.timestamp) : null;
        const isValidDate = d && !isNaN(d.getTime());
        return (
          <div className="flex flex-col">
            <span className="font-medium text-xs text-ink-900">
              {isValidDate ? d.toLocaleDateString('en-GB') : '-'}
            </span>
            <span className="text-[11px] text-ink-400">
              {isValidDate ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
        );
      },
    },
    {
      key: 'transactionType',
      header: 'Movement Type',
      render: (row) => {
        const config = TYPE_CONFIG[row.transactionType] || {
          label: row.transactionType,
          badgeClass: 'bg-surface-subtle text-ink-700 border-surface-border',
          icon: ClipboardList,
          isPositive: null,
        };
        const Icon = config.icon;
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.badgeClass}`}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'material',
      header: 'Material / SKU',
      render: (row) => {
        const mat = row.material || materials.find((m) => String(m.id) === String(row.materialId));
        const name = row.materialName || mat?.name || 'Material #' + row.materialId;
        const code = row.materialCode || mat?.materialCode || '';
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-ink-900">{name}</span>
            <span className="font-mono text-[11px] text-ink-400">{code}</span>
          </div>
        );
      },
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (row) => {
        const mat = row.material || materials.find((m) => String(m.id) === String(row.materialId));
        const unit = mat ? UNIT_LABEL_MAP[mat.unit] || mat.unit : '';
        const config = TYPE_CONFIG[row.transactionType];
        const isPos = config?.isPositive;
        const prefix = isPos === true ? '+' : isPos === false ? '-' : '';
        const color =
          isPos === true
            ? 'text-emerald-600'
            : isPos === false
            ? 'text-ink-900'
            : 'text-purple-600';

        return (
          <div className="flex flex-col text-right">
            <span className={`font-mono text-sm font-bold ${color}`}>
              {prefix}
              {Number(row.quantity).toLocaleString()}
            </span>
            <span className="text-[11px] text-ink-400">{unit}</span>
          </div>
        );
      },
    },
    {
      key: 'unitPrice',
      header: 'Rate / Value',
      render: (row) => {
        const rate = Number(row.unitPrice ?? 0);
        const total = rate * Number(row.quantity ?? 0);
        return (
          <div className="flex flex-col text-right">
            <span className="font-medium text-xs text-ink-900">
              {rate > 0 ? `₹${rate.toLocaleString()}` : '-'}
            </span>
            {total > 0 && (
              <span className="text-[11px] font-semibold text-emerald-600">
                ₹{total.toLocaleString()}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'location',
      header: 'Site / WBS / Zone',
      render: (row) => {
        const act = wbsActivities.find((w) => String(w.id) === String(row.activityId));
        return (
          <div className="flex flex-col max-w-[200px]">
            {act ? (
              <span className="font-medium text-xs text-brand-700 truncate">
                [{act.code || act.wbsCode}] {act.name}
              </span>
            ) : row.activityId ? (
              <span className="font-medium text-xs text-ink-700">WBS #{row.activityId}</span>
            ) : null}
            {row.zone && <span className="text-[11px] text-ink-500 truncate">{row.zone}</span>}
            {row.contractorId && (
              <span className="text-[10px] text-ink-400">Contractor #{row.contractorId}</span>
            )}
            {!act && !row.zone && !row.contractorId && (
              <span className="text-[11px] text-ink-400">Central Warehouse</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'referenceId',
      header: 'Ref / Remarks',
      render: (row) => (
        <div className="flex flex-col max-w-[180px]">
          {row.referenceId && (
            <span className="font-mono text-xs font-semibold text-ink-800 truncate">
              {row.referenceId}
            </span>
          )}
          {row.remarks && (
            <span className="text-[11px] text-ink-400 truncate" title={row.remarks}>
              {row.remarks}
            </span>
          )}
          {!row.referenceId && !row.remarks && <span className="text-xs text-ink-400">-</span>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-center w-14',
      render: (row) => (
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEntry(row);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-surface-border/70 bg-surface-subtle text-ink-500 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-colors shadow-xs"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-card p-3.5">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Project Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs">
            <Building className="h-3.5 w-3.5 text-ink-500" />
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(Number(e.target.value));
                setSelectedActivityId('');
              }}
              className="bg-transparent font-semibold text-ink-900 focus:outline-none"
            >
              {projects.length > 0 ? (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              ) : (
                <option value="1">Default Project (ID: 1)</option>
              )}
            </select>
          </div>

          {/* Material Filter */}
          <select
            value={selectedMaterialId}
            onChange={(e) => setSelectedMaterialId(e.target.value)}
            className="rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-none max-w-[200px]"
          >
            <option value="">All Materials</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.materialCode} - {m.name}
              </option>
            ))}
          </select>

          {/* WBS Activity Filter */}
          {wbsActivities.length > 0 && (
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-none max-w-[220px]"
            >
              <option value="">All WBS Activities</option>
              {wbsActivities.map((w) => (
                <option key={w.id} value={w.id}>
                  [{w.code || w.wbsCode}] {w.name}
                </option>
              ))}
            </select>
          )}

          {/* Transaction Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
          >
            <option value="">All Movements</option>
            {STOCK_TRANSACTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative min-w-[160px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search ref ID, notes, zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-surface-subtle py-1.5 pl-8 pr-2.5 text-xs text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-surface-base focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center rounded-lg border border-surface-border bg-surface-subtle p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-surface-base text-ink-900 shadow-xs'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
              title="Table View"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-surface-base text-ink-900 shadow-xs'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8 px-2.5 text-xs text-ink-600"
            title="Refresh Ledger"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {onOpenReconcileModal && (
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenReconcileModal}
              className="h-8 px-2.5 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Scale className="h-3.5 w-3.5 mr-1" />
              Reconcile
            </Button>
          )}

          {onOpenTransactionModal && (
            <Button
              size="sm"
              onClick={onOpenTransactionModal}
              className="h-8 px-2.5 text-xs flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Record Movement
            </Button>
          )}
        </div>
      </div>

      {/* Info Strip */}
      <div className="flex items-center justify-between text-xs text-ink-500 px-1">
        <span>
          Showing <strong>{entries.length}</strong> ledger transactions
        </span>
        <span className="text-[11px] text-ink-400">
          Append-only immutable audit trail with ACID inventory locks
        </span>
      </div>

      {/* Main View: Table or Cards */}
      {viewMode === 'table' ? (
        <Table
          columns={columns}
          data={entries}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          onRowClick={(row) => setSelectedEntry(row)}
          emptyMessage={
            searchQuery || typeFilter || selectedMaterialId || selectedActivityId
              ? 'No transactions found matching your criteria.'
              : 'No stock ledger entries recorded yet. Record a Receipt or Issue to start tracking.'
          }
        />
      ) : (
        <div>
          {isLoading ? (
            <div className="rounded-xl border border-surface-border bg-surface-card p-12 text-center text-ink-500">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-500" />
              <p className="text-xs">Loading ledger entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-xl border border-surface-border bg-surface-card p-12 text-center text-ink-500">
              <ClipboardList className="h-8 w-8 mx-auto mb-2 text-ink-400" />
              <p className="text-sm font-semibold text-ink-800">No transactions found</p>
              <p className="text-xs text-ink-500 mt-1">
                {searchQuery || typeFilter || selectedMaterialId || selectedActivityId
                  ? 'Try modifying your filters or search keywords.'
                  : 'Record a material movement to begin viewing audit cards.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {entries.map((item) => {
                const mat = item.material || materials.find((m) => String(m.id) === String(item.materialId));
                const name = item.materialName || mat?.name || `Material #${item.materialId}`;
                const code = item.materialCode || mat?.materialCode || '';
                const unit = mat ? UNIT_LABEL_MAP[mat.unit] || mat.unit : 'Units';
                const config = TYPE_CONFIG[item.transactionType] || {
                  label: item.transactionType,
                  badgeClass: 'bg-surface-subtle text-ink-700 border-surface-border',
                  icon: ClipboardList,
                  isPositive: null,
                };
                const Icon = config.icon;
                const d = item.timestamp ? new Date(item.timestamp) : null;
                const isValidDate = d && !isNaN(d.getTime());
                const isPos = config.isPositive;
                const prefix = isPos === true ? '+' : isPos === false ? '-' : '';
                const qtyColor =
                  isPos === true
                    ? 'text-emerald-600'
                    : isPos === false
                    ? 'text-ink-900'
                    : 'text-purple-600';
                const rate = Number(item.unitPrice ?? 0);
                const total = rate * Number(item.quantity ?? 0);
                const act = wbsActivities.find((w) => String(w.id) === String(item.activityId));

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEntry(item)}
                    className="group relative flex flex-col justify-between rounded-xl border border-surface-border bg-surface-card p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md cursor-pointer"
                  >
                    <div>
                      {/* Top Bar: Badge, Date, Eye button */}
                      <div className="flex items-center justify-between gap-2 border-b border-surface-border/70 pb-2.5 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.badgeClass}`}
                        >
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-ink-400">
                            {isValidDate ? d.toLocaleDateString('en-GB') : '-'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEntry(item);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-surface-border/70 bg-surface-subtle text-ink-500 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-colors shadow-xs"
                            title="View Stock Ledger Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Material info */}
                      <div className="mb-3">
                        <h4 className="text-sm font-bold text-ink-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                          {name}
                        </h4>
                        <span className="font-mono text-xs text-ink-400">{code || 'SKU N/A'}</span>
                      </div>

                      {/* Quantity & Valuation pill */}
                      <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-subtle p-2.5 mb-3 border border-surface-border/60">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-ink-400 block tracking-wider">
                            Quantity
                          </span>
                          <span className={`font-mono text-base font-black ${qtyColor}`}>
                            {prefix}{Number(item.quantity).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-ink-400 ml-1">{unit}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-ink-400 block tracking-wider">
                            Value
                          </span>
                          <span className="font-mono text-xs font-semibold text-ink-800 block">
                            {rate > 0 ? `₹${rate.toLocaleString()}` : '—'}
                          </span>
                          {total > 0 && (
                            <span className="font-mono text-xs font-bold text-emerald-600">
                              ₹{total.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Site / WBS location */}
                      <div className="space-y-1 text-xs text-ink-600 mb-3">
                        <div className="flex items-center gap-1.5 truncate">
                          <Building className="h-3.5 w-3.5 text-ink-400 shrink-0" />
                          {act ? (
                            <span className="truncate font-medium text-brand-700">
                              [{act.code || act.wbsCode}] {act.name}
                            </span>
                          ) : (
                            <span className="text-ink-500 truncate">Central Warehouse</span>
                          )}
                        </div>
                        {item.zone && (
                          <div className="flex items-center gap-1.5 truncate text-[11px] text-ink-500">
                            <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                            <span className="truncate">Zone: {item.zone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-surface-border/70 pt-2.5 text-[11px]">
                      <span className="font-mono font-medium text-ink-500 truncate max-w-[140px]">
                        {item.referenceId || `Entry #${item.id}`}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-brand-600 group-hover:underline">
                        <Eye className="h-3 w-3" />
                        View Details
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Transaction Details Modal Organized as Structured Cards */}
      <StockLedgerDetailModal
        open={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        entry={selectedEntry}
        materials={materials}
        projects={projects}
        wbsActivities={wbsActivities}
      />
    </div>
  );
}
