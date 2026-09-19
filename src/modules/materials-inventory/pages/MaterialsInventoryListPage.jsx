import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  TrendingDown,
  AlertTriangle,
  Plus,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Eye,
  Trash2,
  ChevronDown,
  ClipboardList,
  ShoppingCart,
  Tag,
  BarChart2,
  Info,
} from 'lucide-react';
import { Table, StatusPill, Button, Input, Select, Modal, Textarea } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import {
  materialsInventoryApi,
  stockLedgerApi,
  suppliersApi,
  MATERIAL_UNITS,
  STOCK_TRANSACTION_TYPES,
  UNIT_LABEL_MAP,
} from '../api/materialsInventoryApi';

const MATERIAL_CATEGORIES = [
  'CEMENT', 'STEEL', 'AGGREGATE', 'BRICKS', 'CONCRETE', 'SAND',
  'TILES', 'PLUMBING', 'ELECTRICAL', 'PAINT', 'HARDWARE', 'TIMBER', 'GLASS', 'OTHER',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatusVariant(status) {
  if (status === 'LOW_STOCK' || status === 'REORDER') return 'WARNING';
  if (status === 'OUT_OF_STOCK') return 'DANGER';
  return 'APPROVED';
}

function StockBadge({ status, currentStock, unit }) {
  const label = status === 'OUT_OF_STOCK' ? 'Out of Stock'
    : status === 'LOW_STOCK' ? 'Low Stock'
    : 'Healthy';
  const colorClass = status === 'OUT_OF_STOCK' ? 'bg-status-dangerBg text-status-danger border-status-danger/30'
    : status === 'LOW_STOCK' ? 'bg-status-warningBg text-status-warning border-status-warning/30'
    : 'bg-status-successBg text-status-success border-status-success/30';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${colorClass}`}>
      {status === 'LOW_STOCK' && <AlertTriangle className="h-3 w-3" />}
      {label}
    </span>
  );
}

// ─── Stock Transaction Modal ──────────────────────────────────────────────────
function StockTransactionModal({ open, onClose, material, onSuccess }) {
  const form = useForm({
    defaultValues: {
      transactionType: 'RECEIPT',
      quantity: '',
      unitPrice: '',
      projectId: '1',
      zone: '',
      referenceId: '',
      remarks: '',
    },
  });
  const pushToast = useToastStore((s) => s.push);
  const queryClient = useQueryClient();

  const txnMutation = useMutation({
    mutationFn: (payload) => stockLedgerApi.recordTransaction(payload),
    onSuccess: (result, payload) => {
      queryClient.invalidateQueries({ queryKey: ['materials-inventory'] });
      const txnLabel = STOCK_TRANSACTION_TYPES.find((t) => t.value === payload.transactionType)?.label || payload.transactionType;
      pushToast(`Stock transaction recorded: ${txnLabel} — ${payload.quantity} ${UNIT_LABEL_MAP[material?.unit] || ''}`, 'success');
      form.reset();
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to record stock transaction. Please try again.', 'error');
    },
  });

  const watchedType = form.watch('transactionType');
  const isOutgoing = ['ISSUE', 'CONSUMPTION', 'WASTAGE'].includes(watchedType);

  function handleSubmit(values) {
    if (!material) return;
    if (!values.quantity || Number(values.quantity) <= 0) {
      form.setError('quantity', { type: 'min', message: 'Quantity must be greater than zero.' });
      return;
    }
    txnMutation.mutate({
      materialId: material.id,
      projectId: Number(values.projectId) || 1,
      transactionType: values.transactionType,
      quantity: Number(values.quantity),
      unitPrice: values.unitPrice ? Number(values.unitPrice) : undefined,
      zone: values.zone || undefined,
      referenceId: values.referenceId || undefined,
      remarks: values.remarks || undefined,
    });
  }

  if (!material) return null;

  return (
    <Modal
      open={open}
      onClose={() => { if (!txnMutation.isPending) onClose(); }}
      title={
        <div className="flex items-center gap-2">
          {isOutgoing ? <ArrowDownCircle className="h-5 w-5 text-status-warning" /> : <ArrowUpCircle className="h-5 w-5 text-status-success" />}
          <span>Record Stock Transaction</span>
        </div>
      }
      size="md"
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <Button variant="outline" onClick={onClose} disabled={txnMutation.isPending}>Cancel</Button>
          <Button onClick={form.handleSubmit(handleSubmit)} isLoading={txnMutation.isPending}>
            Record Transaction
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-surface-border bg-surface-subtle p-3">
        <Package className="h-5 w-5 text-brand-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-ink-900">{material.name}</p>
          <p className="text-xs text-ink-500">{material.materialCode} · {UNIT_LABEL_MAP[material.unit] || material.unit}</p>
          <p className="mt-1 text-xs font-semibold text-brand-700">
            Current Stock: {material.currentStock} {UNIT_LABEL_MAP[material.unit] || material.unit}
          </p>
        </div>
      </div>

      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Transaction Type *</label>
            <select
              {...form.register('transactionType', { required: true })}
              className="w-full rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              {STOCK_TRANSACTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Quantity *"
            type="number"
            min="0.01"
            step="0.01"
            placeholder={`e.g. 50 (${UNIT_LABEL_MAP[material.unit] || material.unit})`}
            error={form.formState.errors.quantity?.message}
            {...form.register('quantity', { required: 'Quantity is required.', min: { value: 0.01, message: 'Must be > 0.' } })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Unit Price (₹)"
            type="number"
            min="0"
            step="0.01"
            placeholder={`e.g. ${material.standardRate}`}
            hint="Leave blank to use standard rate"
            {...form.register('unitPrice')}
          />
          <Input
            label="Project ID"
            type="number"
            min="1"
            placeholder="e.g. 1"
            {...form.register('projectId')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Zone / Site Section"
            placeholder="e.g. Zone A - Tower 1"
            {...form.register('zone')}
          />
          <Input
            label="Reference ID"
            placeholder="e.g. GRN-2026-0812 / PO-1029"
            {...form.register('referenceId')}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-700">Remarks</label>
          <textarea
            rows={2}
            placeholder="Add notes or site observations..."
            className="w-full rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none resize-none"
            {...form.register('remarks')}
          />
        </div>
      </form>
    </Modal>
  );
}

// ─── Material Details Modal ───────────────────────────────────────────────────
function MaterialDetailsModal({ open, onClose, material }) {
  const { data: ledger, isLoading } = useQuery({
    queryKey: ['stock-ledger-material', material?.id],
    queryFn: () => stockLedgerApi.getLedgerByMaterial(material.id),
    enabled: open && Boolean(material?.id),
  });

  if (!material) return null;
  const entries = ledger || [];

  const typeColor = {
    RECEIPT: 'text-status-success',
    RETURN: 'text-status-success',
    ISSUE: 'text-status-warning',
    CONSUMPTION: 'text-status-warning',
    WASTAGE: 'text-status-danger',
    ADJUSTMENT: 'text-ink-500',
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-brand-600" />
          <span>{material.name}</span>
        </div>
      }
      size="lg"
      footer={<Button variant="outline" onClick={onClose}>Close</Button>}
    >
      <div className="flex flex-col gap-5">
        {/* Material Info Card */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-surface-border bg-surface-subtle p-4 sm:grid-cols-3">
          {[
            { label: 'SKU Code', value: material.materialCode },
            { label: 'Category', value: material.category },
            { label: 'Unit', value: UNIT_LABEL_MAP[material.unit] || material.unit },
            { label: 'Standard Rate', value: `₹${Number(material.standardRate).toLocaleString()}` },
            { label: 'Reorder Level', value: `${material.reorderLevel} ${UNIT_LABEL_MAP[material.unit] || ''}` },
            { label: 'Current Stock', value: `${material.currentStock} ${UNIT_LABEL_MAP[material.unit] || ''}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{label}</p>
              <p className="text-sm font-semibold text-ink-900">{value || '-'}</p>
            </div>
          ))}
        </div>

        {material.description && (
          <p className="text-xs text-ink-500 italic">{material.description}</p>
        )}

        {/* Stock Ledger Audit Trail */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4 text-brand-600" />
            Stock Ledger Audit Trail ({entries.length} entries)
          </h4>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-xs text-ink-400">Loading ledger...</div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-surface-border py-6 text-xs text-ink-400">
              <ClipboardList className="h-6 w-6 mb-1 opacity-40" />
              No stock transactions recorded yet.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto rounded-lg border border-surface-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-subtle text-ink-500 font-semibold sticky top-0">
                  <tr>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2">Ref / Zone</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {entries.map((e) => (
                    <tr key={e.id} className="hover:bg-surface-subtle/50">
                      <td className={`px-3 py-2 font-semibold ${typeColor[e.transactionType] || 'text-ink-700'}`}>
                        {e.transactionType}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-ink-900">{e.quantity}</td>
                      <td className="px-3 py-2 text-ink-600">{e.referenceId || e.zone || '-'}</td>
                      <td className="px-3 py-2 text-ink-500">{new Date(e.timestamp).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-ink-400 max-w-[150px] truncate">{e.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ─── Add Material Modal ───────────────────────────────────────────────────────
function AddMaterialModal({ open, onClose }) {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);
  const form = useForm({
    defaultValues: {
      materialCode: '',
      name: '',
      category: '',
      unit: 'BAGS',
      standardRate: '',
      reorderLevel: '',
      description: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => materialsInventoryApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials-inventory'] });
      pushToast('Material added to catalog successfully.', 'success');
      form.reset();
      onClose();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to create material. Please try again.', 'error');
    },
  });

  function handleSubmit(values) {
    createMutation.mutate({
      materialCode: values.materialCode.trim().toUpperCase(),
      name: values.name.trim(),
      category: values.category.trim().toUpperCase(),
      unit: values.unit,
      standardRate: Number(values.standardRate),
      reorderLevel: values.reorderLevel ? Number(values.reorderLevel) : null,
      description: values.description?.trim() || null,
    });
  }

  return (
    <Modal
      open={open}
      onClose={() => { if (!createMutation.isPending) onClose(); }}
      title="Add New Material to Catalog"
      size="md"
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <Button variant="outline" onClick={onClose} disabled={createMutation.isPending}>Cancel</Button>
          <Button onClick={form.handleSubmit(handleSubmit)} isLoading={createMutation.isPending}>
            Save Material
          </Button>
        </div>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="SKU / Material Code *"
            placeholder="e.g. MAT-CEM-43"
            error={form.formState.errors.materialCode?.message}
            {...form.register('materialCode', { required: 'Material code is required.' })}
          />
          <Input
            label="Material Name *"
            placeholder="e.g. OPC 43 Grade Cement"
            error={form.formState.errors.name?.message}
            {...form.register('name', { required: 'Material name is required.' })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Category *</label>
            <select
              {...form.register('category', { required: 'Category is required.' })}
              className="w-full rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="">Select category...</option>
              {MATERIAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {form.formState.errors.category && (
              <p className="mt-1 text-xs text-status-danger">{form.formState.errors.category.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Unit of Measure *</label>
            <select
              {...form.register('unit', { required: 'Unit is required.' })}
              className="w-full rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              {MATERIAL_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Standard Rate (₹) *"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 380.00"
            error={form.formState.errors.standardRate?.message}
            {...form.register('standardRate', { required: 'Standard rate is required.', min: { value: 0.01, message: 'Rate must be positive.' } })}
          />
          <Input
            label="Reorder Level"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 100"
            hint="Low-stock alert threshold"
            {...form.register('reorderLevel')}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-700">Description / Specification</label>
          <textarea
            rows={2}
            placeholder="e.g. IS 8112 OPC 43 Grade – 50 kg bags (UltraTech)"
            className="w-full rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none resize-none"
            {...form.register('description')}
          />
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function MaterialsInventoryListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [transactionMaterial, setTransactionMaterial] = useState(null);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'low-stock'

  const pushToast = useToastStore((s) => s.push);
  const queryClient = useQueryClient();

  const { data: allMaterials, isLoading } = useQuery({
    queryKey: ['materials-inventory'],
    queryFn: () => materialsInventoryApi.list(),
    staleTime: 30_000,
    retry: 1,
  });

  const { data: lowStockMaterials, isLoading: isLoadingLowStock } = useQuery({
    queryKey: ['materials-low-stock'],
    queryFn: () => materialsInventoryApi.getLowStock(),
    staleTime: 30_000,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => materialsInventoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['materials-low-stock'] });
      pushToast('Material removed from catalog.', 'success');
    },
    onError: (err) => pushToast(err?.message || 'Failed to delete material.', 'error'),
  });

  const materials = allMaterials ?? [];
  const lowStock = lowStockMaterials ?? [];

  // Filtered catalog
  const filteredMaterials = materials.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || m.name?.toLowerCase().includes(q) || m.materialCode?.toLowerCase().includes(q) || m.category?.toLowerCase().includes(q);
    const matchesCategory = !categoryFilter || m.category === categoryFilter;
    const matchesStatus = !statusFilter || m.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Summary stats
  const stats = {
    total: materials.length,
    lowStock: materials.filter((m) => m.status === 'LOW_STOCK').length,
    outOfStock: materials.filter((m) => m.status === 'OUT_OF_STOCK').length,
    healthy: materials.filter((m) => m.status === 'HEALTHY').length,
  };

  const categories = Array.from(new Set(materials.map((m) => m.category).filter(Boolean)));

  const columns = [
    {
      key: 'materialCode', header: 'SKU Code',
      render: (row) => <span className="font-mono text-xs font-semibold text-brand-700">{row.materialCode}</span>,
    },
    {
      key: 'name', header: 'Material',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-ink-900 text-sm">{row.name}</span>
          {row.description && <span className="text-[11px] text-ink-400 truncate max-w-[220px]">{row.description}</span>}
        </div>
      ),
    },
    {
      key: 'category', header: 'Category',
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 border border-brand-200">
          {row.category}
        </span>
      ),
    },
    {
      key: 'currentStock', header: 'Current Stock',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-ink-900 text-sm">
            {Number(row.currentStock).toLocaleString()} <span className="text-xs font-normal text-ink-500">{UNIT_LABEL_MAP[row.unit] || row.unit}</span>
          </span>
          <span className="text-[11px] text-ink-400">Reorder at: {Number(row.reorderLevel).toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'standardRate', header: 'Std. Rate',
      render: (row) => (
        <span className="text-sm font-semibold text-ink-900">₹{Number(row.standardRate).toLocaleString()}</span>
      ),
    },
    {
      key: 'status', header: 'Stock Status',
      render: (row) => <StockBadge status={row.status} currentStock={row.currentStock} unit={row.unit} />,
    },
    {
      key: 'actions', header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm" variant="ghost"
            className="h-7 px-2 text-xs text-ink-600 hover:text-brand-600"
            onClick={() => setSelectedMaterial(row)}
            title="View details & ledger"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm" variant="ghost"
            className="h-7 px-2 text-xs text-status-success hover:bg-status-successBg"
            onClick={() => setTransactionMaterial(row)}
            title="Record stock movement"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm" variant="ghost"
            className="h-7 px-2 text-xs text-status-danger hover:bg-status-dangerBg"
            onClick={() => deleteMutation.mutate(row.id)}
            disabled={deleteMutation.isPending}
            title="Remove from catalog"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const lowStockColumns = [
    { key: 'materialCode', header: 'SKU Code', render: (row) => <span className="font-mono text-xs font-semibold text-brand-700">{row.materialCode}</span> },
    { key: 'name', header: 'Material' },
    { key: 'category', header: 'Category' },
    {
      key: 'currentStock', header: 'Current Stock',
      render: (row) => <span className="font-bold text-status-warning">{row.currentStock} {UNIT_LABEL_MAP[row.unit] || row.unit}</span>,
    },
    {
      key: 'reorderLevel', header: 'Reorder Level',
      render: (row) => <span className="text-ink-600">{row.reorderLevel} {UNIT_LABEL_MAP[row.unit] || row.unit}</span>,
    },
    {
      key: 'status', header: 'Alert',
      render: (row) => <StockBadge status={row.status} />,
    },
    {
      key: 'actions', header: 'Action',
      render: (row) => (
        <Button size="sm" variant="outline"
          className="h-7 px-2 text-xs border-status-success text-status-success hover:bg-status-successBg"
          onClick={(e) => { e.stopPropagation(); setTransactionMaterial(row); }}
        >
          <ArrowUpCircle className="h-3.5 w-3.5 mr-1" /> Restock
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-heading flex items-center gap-2">
            Materials & Inventory
            <span className="inline-flex items-center rounded-md bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200">
              Stock Control
            </span>
          </h1>
          <p className="page-subheading">
            Material catalog, stock ledger, GRN receipts, site issues, consumption, and low-stock alerts.
          </p>
        </div>
        <Button size="sm" onClick={() => setAddModalOpen(true)} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          Add Material
        </Button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Materials', value: stats.total, icon: Package, color: 'text-brand-600 bg-brand-50 border-brand-200' },
          { label: 'Healthy Stock', value: stats.healthy, icon: BarChart2, color: 'text-status-success bg-status-successBg border-status-success/30' },
          { label: 'Low Stock', value: stats.lowStock, icon: TrendingDown, color: 'text-status-warning bg-status-warningBg border-status-warning/30' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: AlertTriangle, color: 'text-status-danger bg-status-dangerBg border-status-danger/30' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl border p-3.5 ${color}`}>
            <Icon className="h-5 w-5 shrink-0 opacity-80" />
            <div>
              <p className="text-lg font-bold leading-none">{value}</p>
              <p className="text-xs font-medium opacity-80">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-surface-border">
        {[
          { id: 'catalog', label: 'Material Catalog', icon: Package },
          { id: 'low-stock', label: `Low Stock Alerts (${lowStock.length})`, icon: AlertTriangle },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-700'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Catalog Tab */}
      {activeTab === 'catalog' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-surface-border bg-surface-card p-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder="Search material, SKU, category..."
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
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
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
              Showing <strong>{filteredMaterials.length}</strong> of <strong>{materials.length}</strong>
            </span>
          </div>

          <Table
            columns={columns}
            data={filteredMaterials}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            onRowClick={(row) => setSelectedMaterial(row)}
            emptyMessage={searchQuery || categoryFilter || statusFilter ? 'No materials match your filters.' : 'No materials in catalog. Click "Add Material" to get started.'}
          />
        </>
      )}

      {/* Low Stock Tab */}
      {activeTab === 'low-stock' && (
        <Table
          columns={lowStockColumns}
          data={lowStock}
          rowKey={(row) => row.id}
          isLoading={isLoadingLowStock}
          onRowClick={(row) => setSelectedMaterial(row)}
          emptyMessage="All materials are at healthy stock levels."
        />
      )}

      {/* Modals */}
      <AddMaterialModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <MaterialDetailsModal
        open={Boolean(selectedMaterial)}
        onClose={() => setSelectedMaterial(null)}
        material={selectedMaterial}
      />
      <StockTransactionModal
        open={Boolean(transactionMaterial)}
        onClose={() => setTransactionMaterial(null)}
        material={transactionMaterial}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['materials-inventory'] });
          queryClient.invalidateQueries({ queryKey: ['materials-low-stock'] });
          if (transactionMaterial?.id) {
            queryClient.invalidateQueries({ queryKey: ['stock-ledger-material', transactionMaterial.id] });
          }
        }}
      />
    </div>
  );
}
