import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Eye,
  Trash2,
  Edit2,
  ClipboardList,
  Scale,
} from 'lucide-react';
import { Table, Button } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import {
  materialsInventoryApi,
  UNIT_LABEL_MAP,
} from '../api/materialsInventoryApi';
import { MaterialMetricsBar } from '../components/MaterialMetricsBar';
import { MaterialFormModal } from '../components/MaterialFormModal';
import { StockTransactionModal } from '../components/StockTransactionModal';
import { StockReconciliationModal } from '../components/StockReconciliationModal';
import { StockLedgerAuditView } from '../components/StockLedgerAuditView';
import { MaterialDetailsModal } from '../components/MaterialDetailsModal';

function StockBadge({ status }) {
  const isOut = status === 'OUT_OF_STOCK';
  const isLow = status === 'LOW_STOCK';
  const label = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Healthy';
  const colorClass = isOut
    ? 'bg-status-dangerBg text-status-danger border-status-danger/30'
    : isLow
    ? 'bg-status-warningBg text-status-warning border-status-warning/30'
    : 'bg-status-successBg text-status-success border-status-success/30';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${colorClass}`}>
      {isLow && <AlertTriangle className="h-3 w-3" />}
      {isOut && <AlertTriangle className="h-3 w-3" />}
      {label}
    </span>
  );
}

export function MaterialsInventoryListPage() {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'ledger' | 'low-stock' | 'reconciliation'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const [detailsMaterial, setDetailsMaterial] = useState(null);

  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [txnTargetMaterial, setTxnTargetMaterial] = useState(null);
  const [txnInitialType, setTxnInitialType] = useState('RECEIPT');

  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
  const [reconcileTargetMaterial, setReconcileTargetMaterial] = useState(null);

  const canManage = useHasRole(
    ROLES.PROCUREMENT_STORE,
    ROLES.PROJECT_MANAGER,
    ROLES.DIRECTOR,
    ROLES.ADMIN,
    ROLES.SITE_ENGINEER
  );
  const canDelete = useHasRole(ROLES.DIRECTOR, ROLES.ADMIN, ROLES.PROCUREMENT_STORE);

  const pushToast = useToastStore((s) => s.push);
  const queryClient = useQueryClient();

  // Queries
  const {
    data: allMaterials = [],
    isLoading: isLoadingMaterials,
    refetch: refetchMaterials,
    isRefetching,
  } = useQuery({
    queryKey: ['materials-inventory'],
    queryFn: () => materialsInventoryApi.list(),
    staleTime: 30_000,
  });

  const { data: lowStock = [], isLoading: isLoadingLowStock } = useQuery({
    queryKey: ['materials-low-stock'],
    queryFn: () => materialsInventoryApi.getLowStock(),
    staleTime: 30_000,
  });

  const { data: reorderAlerts = [] } = useQuery({
    queryKey: ['materials-reorder-alerts'],
    queryFn: () => materialsInventoryApi.getReorderAlerts(),
    staleTime: 30_000,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => materialsInventoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['materials-low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['materials-reorder-alerts'] });
      pushToast('Material removed from catalog.', 'success');
    },
    onError: (err) => pushToast(err?.message || 'Failed to delete material.', 'error'),
  });

  const handleDelete = (e, material) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${material.name}" (${material.materialCode}) from the catalog?`)) {
      deleteMutation.mutate(material.id);
    }
  };

  // Open transaction modal shortcut
  const handleOpenTransaction = (mat = null, type = 'RECEIPT') => {
    setTxnTargetMaterial(mat);
    setTxnInitialType(type);
    setTxnModalOpen(true);
  };

  // Open reconcile modal shortcut
  const handleOpenReconcile = (mat = null) => {
    setReconcileTargetMaterial(mat);
    setReconcileModalOpen(true);
  };

  // Filter materials for catalog table
  const filteredMaterials = allMaterials.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      m.name?.toLowerCase().includes(q) ||
      m.materialCode?.toLowerCase().includes(q) ||
      m.category?.toLowerCase().includes(q);
    const matchesCategory = !categoryFilter || m.category === categoryFilter;
    const matchesStatus = !statusFilter || m.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(allMaterials.map((m) => m.category).filter(Boolean)));

  // Table Columns
  const catalogColumns = [
    {
      key: 'materialCode',
      header: 'SKU Code',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-brand-700 dark:text-brand-400">
          {row.materialCode}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Material Specification',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-ink-900 text-sm">{row.name}</span>
          {row.description && (
            <span className="text-[11px] text-ink-400 truncate max-w-[240px]">
              {row.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 border border-brand-200 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800">
          {row.category}
        </span>
      ),
    },
    {
      key: 'currentStock',
      header: 'Stock Balance',
      render: (row) => {
        const unit = UNIT_LABEL_MAP[row.unit] || row.unit;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-ink-900 text-sm">
              {Number(row.currentStock).toLocaleString()}{' '}
              <span className="text-xs font-normal text-ink-500">{unit}</span>
            </span>
            <span className="text-[11px] text-ink-400">
              Min Threshold: {Number(row.reorderLevel).toLocaleString()} {unit}
            </span>
          </div>
        );
      },
    },
    {
      key: 'standardRate',
      header: 'Std. Rate',
      render: (row) => (
        <span className="text-sm font-semibold text-ink-900">
          ₹{Number(row.standardRate).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'valuation',
      header: 'Valuation',
      render: (row) => {
        const total = Number(row.currentStock ?? 0) * Number(row.standardRate ?? 0);
        return (
          <span className="text-xs font-semibold text-emerald-600">
            ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StockBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-ink-600 hover:text-brand-600"
            onClick={() => setDetailsMaterial(row)}
            title="View Details & Ledger"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>

          {canManage && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                onClick={() => handleOpenTransaction(row, 'RECEIPT')}
                title="Receive Stock (Inward)"
              >
                <ArrowUpCircle className="h-3.5 w-3.5" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                onClick={() => handleOpenTransaction(row, 'ISSUE')}
                title="Issue Material to Site"
              >
                <ArrowDownCircle className="h-3.5 w-3.5" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                onClick={() => handleOpenReconcile(row)}
                title="Physical Stock Audit Reconcile"
              >
                <Scale className="h-3.5 w-3.5" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-ink-500 hover:text-ink-900"
                onClick={() => {
                  setEditingMaterial(row);
                  setFormModalOpen(true);
                }}
                title="Edit Item"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}

          {canDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-status-danger hover:bg-status-dangerBg"
              onClick={(e) => handleDelete(e, row)}
              disabled={deleteMutation.isPending}
              title="Delete Material"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const lowStockColumns = [
    {
      key: 'materialCode',
      header: 'SKU Code',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-brand-700">
          {row.materialCode}
        </span>
      ),
    },
    { key: 'name', header: 'Material Name' },
    { key: 'category', header: 'Category' },
    {
      key: 'currentStock',
      header: 'Current Stock',
      render: (row) => (
        <span className="font-bold text-status-danger">
          {row.currentStock} {UNIT_LABEL_MAP[row.unit] || row.unit}
        </span>
      ),
    },
    {
      key: 'reorderLevel',
      header: 'Reorder Level',
      render: (row) => (
        <span className="text-ink-600">
          {row.reorderLevel} {UNIT_LABEL_MAP[row.unit] || row.unit}
        </span>
      ),
    },
    {
      key: 'deficit',
      header: 'Replenishment Deficit',
      render: (row) => {
        const cur = Number(row.currentStock ?? 0);
        const reo = Number(row.reorderLevel ?? 0);
        const deficit = reo - cur;
        const unit = UNIT_LABEL_MAP[row.unit] || row.unit;
        if (deficit > 0) {
          return (
            <span className="font-semibold text-status-danger">
              -{deficit} {unit}
            </span>
          );
        }
        return (
          <span className="font-medium text-amber-700 dark:text-amber-300">
            At Reorder Level
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Alert Level',
      render: (row) => <StockBadge status={row.status} />,
    },
    ...(canManage
      ? [
          {
            key: 'actions',
            header: 'Quick Action',
            render: (row) => (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenTransaction(row, 'RECEIPT');
                }}
              >
                <ArrowUpCircle className="h-3.5 w-3.5 mr-1" /> Quick Restock
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-heading">Materials & Inventory Control</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetchMaterials()}
            disabled={isRefetching}
            className="h-8 px-2.5 text-xs text-ink-600"
            title="Refresh Catalog"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {canManage && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenReconcile(null)}
                className="h-8 px-3 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Scale className="h-3.5 w-3.5 mr-1" />
                Physical Audit
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenTransaction(null, 'RECEIPT')}
                className="h-8 px-3 text-xs border-brand-200 text-brand-700 hover:bg-brand-50"
              >
                <ArrowUpCircle className="h-3.5 w-3.5 mr-1" />
                Record Movement
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  setEditingMaterial(null);
                  setFormModalOpen(true);
                }}
                className="h-8 px-3 text-xs flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Material
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Metrics KPI Bar */}
      <MaterialMetricsBar
        materials={allMaterials}
        lowStock={lowStock}
        reorderAlerts={reorderAlerts}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-surface-border">
        {[
          { id: 'catalog', label: 'Master Catalog', icon: Package, badge: allMaterials.length, badgeVariant: 'neutral' },
          { id: 'ledger', label: 'Stock Ledger (Audit Trail)', icon: ClipboardList },
          {
            id: 'low-stock',
            label: 'Low Stock & Reorders',
            icon: AlertTriangle,
            badge: lowStock.length > 0 ? lowStock.length : null,
            badgeVariant: 'warning',
          },
          { id: 'reconciliation', label: 'Stock Audit (Reconcile)', icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                isActive
                  ? 'border-brand-500 text-brand-700 dark:text-brand-300 font-semibold'
                  : 'border-transparent text-ink-500 hover:text-ink-700 hover:border-surface-border'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge != null && (
                <span
                  className={`ml-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    tab.badgeVariant === 'warning'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40'
                      : 'bg-surface-subtle text-ink-600 dark:bg-neutral-800 dark:text-neutral-300 border border-surface-border'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Material Master Catalog */}
      {activeTab === 'catalog' && (
        <div className="flex flex-col gap-3">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-surface-border bg-surface-card p-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder="Search material SKU, name, specification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-surface-border bg-surface-subtle py-1.5 pl-9 pr-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-surface-base focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Stock Status</option>
              <option value="HEALTHY">Healthy</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>

            <span className="text-xs text-ink-400">
              Showing <strong>{filteredMaterials.length}</strong> of <strong>{allMaterials.length}</strong>
            </span>
          </div>

          <Table
            columns={catalogColumns}
            data={filteredMaterials}
            rowKey={(row) => row.id}
            isLoading={isLoadingMaterials}
            onRowClick={(row) => setDetailsMaterial(row)}
            emptyMessage={
              searchQuery || categoryFilter || statusFilter
                ? 'No materials match your filter criteria.'
                : 'No materials registered in catalog yet. Click "Add Material" to create one.'
            }
          />
        </div>
      )}

      {/* Tab 2: Stock Ledger Audit Trail */}
      {activeTab === 'ledger' && (
        <StockLedgerAuditView
          materials={allMaterials}
          onOpenTransactionModal={() => handleOpenTransaction(null, 'RECEIPT')}
          onOpenReconcileModal={() => handleOpenReconcile(null)}
        />
      )}

      {/* Tab 3: Low Stock & Reorder Alerts */}
      {activeTab === 'low-stock' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-50/50 p-4 text-xs text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm">
                  {lowStock.length === 1
                    ? '1 Material Requires Restocking'
                    : `${lowStock.length} Materials Require Restocking`}
                </p>
                <p className="text-ink-500">
                  Current stock balances are at or below configured minimum thresholds. Replenish immediately to prevent site work stoppages.
                </p>
              </div>
            </div>
            {lowStock.length > 0 && canManage && (
              <Button
                size="sm"
                onClick={() => handleOpenTransaction(lowStock[0], 'RECEIPT')}
                className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white shrink-0"
              >
                Inward Bulk Restock
              </Button>
            )}
          </div>

          <Table
            columns={lowStockColumns}
            data={lowStock}
            rowKey={(row) => row.id}
            isLoading={isLoadingLowStock}
            onRowClick={(row) => setDetailsMaterial(row)}
            emptyMessage="All materials currently have healthy stock above minimum reorder thresholds."
          />
        </div>
      )}

      {/* Tab 4: Physical Stock Reconciliation */}
      {activeTab === 'reconciliation' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-500/20 bg-indigo-50/50 p-4 text-xs text-indigo-900 dark:bg-indigo-950/20 dark:text-indigo-200">
            <div className="flex items-center gap-3">
              <Scale className="h-6 w-6 text-indigo-600 shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-ink-900">Physical Stock Count & Variance Audit</h3>
                <p className="text-ink-500 max-w-2xl mt-0.5">
                  Auditors can conduct physical inventory checks at yards and stores. The system compares physical counts against the stock ledger, calculates variances, and logs audit adjustment entries.
                </p>
              </div>
            </div>
            {canManage && (
              <Button
                size="sm"
                onClick={() => handleOpenReconcile(null)}
                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
              >
                <Scale className="h-3.5 w-3.5 mr-1" />
                Start Stock Audit
              </Button>
            )}
          </div>

          {/* Catalog items with quick audit action */}
          <div className="rounded-xl border border-surface-border bg-surface-card p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-700 mb-3 flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-brand-600" />
              Materials Subject to Audit Verification
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allMaterials.map((mat) => {
                const unit = UNIT_LABEL_MAP[mat.unit] || mat.unit;
                return (
                  <div
                    key={mat.id}
                    className="flex flex-col justify-between rounded-xl border border-surface-border bg-surface-subtle p-3.5 transition-all hover:border-indigo-400"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-brand-700">
                          {mat.materialCode}
                        </span>
                        <StockBadge status={mat.status} />
                      </div>
                      <h4 className="mt-1 font-semibold text-sm text-ink-900">{mat.name}</h4>
                      <p className="text-xs text-ink-500 mt-1">
                        Ledger Balance:{' '}
                        <strong className="text-ink-900">
                          {Number(mat.currentStock).toLocaleString()} {unit}
                        </strong>
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-surface-border pt-2.5">
                      <span className="text-[11px] text-ink-400">Rate: ₹{mat.standardRate}</span>
                      {canManage && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenReconcile(mat)}
                          className="h-7 px-2.5 text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                        >
                          <Scale className="h-3.5 w-3.5 mr-1" /> Reconcile
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <MaterialFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingMaterial(null);
        }}
        material={editingMaterial}
      />

      <MaterialDetailsModal
        open={Boolean(detailsMaterial)}
        onClose={() => setDetailsMaterial(null)}
        material={detailsMaterial}
        canManage={canManage}
        onEdit={(mat) => {
          setEditingMaterial(mat);
          setFormModalOpen(true);
        }}
        onTransaction={(mat, type) => handleOpenTransaction(mat, type)}
        onReconcile={(mat) => handleOpenReconcile(mat)}
      />

      <StockTransactionModal
        open={txnModalOpen}
        onClose={() => {
          setTxnModalOpen(false);
          setTxnTargetMaterial(null);
        }}
        material={txnTargetMaterial}
        allMaterials={allMaterials}
        initialType={txnInitialType}
      />

      <StockReconciliationModal
        open={reconcileModalOpen}
        onClose={() => {
          setReconcileModalOpen(false);
          setReconcileTargetMaterial(null);
        }}
        material={reconcileTargetMaterial}
        allMaterials={allMaterials}
      />
    </div>
  );
}
