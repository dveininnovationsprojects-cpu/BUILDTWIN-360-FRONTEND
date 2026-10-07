import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Package,
  AlertCircle,
} from 'lucide-react';
import { Modal, Button, Input } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import {
  stockLedgerApi,
  STOCK_TRANSACTION_TYPES,
  UNIT_LABEL_MAP,
} from '../api/materialsInventoryApi';
import { projectsApi } from '@/modules/projects/api/projectsApi';
import { wbsScheduleApi } from '@/modules/wbs-schedule/api/wbsScheduleApi';

export function StockTransactionModal({
  open,
  onClose,
  material = null,
  allMaterials = [],
  initialType = 'RECEIPT',
  defaultProjectId = 1,
  onSuccess,
}) {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  const form = useForm({
    defaultValues: {
      materialId: material?.id ? String(material.id) : '',
      projectId: String(defaultProjectId || 1),
      activityId: '',
      transactionType: initialType || 'RECEIPT',
      quantity: '',
      unitPrice: '',
      zone: '',
      contractorId: '',
      referenceId: '',
      remarks: '',
    },
  });

  const selectedMatId = form.watch('materialId');
  const watchedProjectId = form.watch('projectId');
  const watchedType = form.watch('transactionType');
  const watchedQty = form.watch('quantity');

  // Selected material info
  const activeMaterial =
    material || allMaterials.find((m) => String(m.id) === String(selectedMatId)) || null;

  // Sync initial values
  useEffect(() => {
    if (open) {
      form.reset({
        materialId: material?.id ? String(material.id) : allMaterials[0]?.id ? String(allMaterials[0].id) : '',
        projectId: String(defaultProjectId || 1),
        activityId: '',
        transactionType: initialType || 'RECEIPT',
        quantity: '',
        unitPrice: activeMaterial?.standardRate ? String(activeMaterial.standardRate) : '',
        zone: '',
        contractorId: '',
        referenceId: '',
        remarks: '',
      });
    }
  }, [open, material, initialType, defaultProjectId]);

  // Update unitPrice default when material changes
  useEffect(() => {
    if (activeMaterial && !form.getValues('unitPrice')) {
      form.setValue('unitPrice', activeMaterial.standardRate ? String(activeMaterial.standardRate) : '');
    }
  }, [activeMaterial]);

  // Fetch available projects for dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-dropdown-list'],
    queryFn: () => projectsApi.list(),
    enabled: open,
    staleTime: 60_000,
  });

  // Fetch WBS activities for selected project
  const numericProjectId = Number(watchedProjectId) || 1;
  const { data: wbsActivities = [] } = useQuery({
    queryKey: ['wbs-activities-project', numericProjectId],
    queryFn: () => wbsScheduleApi.list(numericProjectId),
    enabled: open && Boolean(numericProjectId),
    staleTime: 30_000,
  });

  // Dispatch to the matching backend controller endpoint
  const mutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        materialId: Number(values.materialId || activeMaterial?.id),
        projectId: Number(values.projectId || 1),
        activityId: values.activityId ? Number(values.activityId) : null,
        transactionType: values.transactionType,
        quantity: Number(values.quantity),
        unitPrice: values.unitPrice !== '' ? Number(values.unitPrice) : null,
        zone: values.zone?.trim() || null,
        contractorId: values.contractorId ? Number(values.contractorId) : null,
        referenceId: values.referenceId?.trim() || null,
        remarks: values.remarks?.trim() || null,
      };

      if (values.transactionType === 'ISSUE') {
        return stockLedgerApi.issue(payload);
      }
      if (values.transactionType === 'CONSUMPTION') {
        return stockLedgerApi.consume(payload);
      }
      if (values.transactionType === 'WASTAGE') {
        return stockLedgerApi.recordWastage(payload);
      }
      // RECEIPT, RETURN, ADJUSTMENT
      return stockLedgerApi.recordTransaction(payload);
    },
    onSuccess: (result, values) => {
      queryClient.invalidateQueries({ queryKey: ['materials-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['materials-low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['materials-reorder-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['stock-ledger-all'] });
      if (values.materialId) {
        queryClient.invalidateQueries({ queryKey: ['stock-ledger-material', Number(values.materialId)] });
      }
      if (values.projectId) {
        queryClient.invalidateQueries({ queryKey: ['stock-ledger-project', Number(values.projectId)] });
      }
      if (values.activityId) {
        queryClient.invalidateQueries({ queryKey: ['stock-ledger-activity', Number(values.activityId)] });
      }

      const typeLabel =
        STOCK_TRANSACTION_TYPES.find((t) => t.value === values.transactionType)?.label ||
        values.transactionType;
      const unitLabel = activeMaterial ? UNIT_LABEL_MAP[activeMaterial.unit] || activeMaterial.unit : '';

      pushToast(`Stock recorded: ${typeLabel} — ${values.quantity} ${unitLabel}`, 'success');
      form.reset();
      onSuccess?.(result);
      onClose();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to record stock movement. Please check fields.', 'error');
    },
  });

  const isDeduction = ['ISSUE', 'CONSUMPTION', 'WASTAGE'].includes(watchedType);
  const curStock = activeMaterial ? Number(activeMaterial.currentStock ?? 0) : 0;
  const numQty = Number(watchedQty) || 0;
  const isOverdraft = isDeduction && numQty > curStock;

  const onSubmit = (values) => {
    if (!values.materialId && !activeMaterial?.id) {
      pushToast('Please select a material.', 'error');
      return;
    }
    if (!values.quantity || Number(values.quantity) <= 0) {
      form.setError('quantity', { type: 'min', message: 'Quantity must be positive.' });
      return;
    }
    mutation.mutate(values);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!mutation.isPending) onClose();
      }}
      title={
        <div className="flex items-center gap-2">
          {isDeduction ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <ArrowDownCircle className="h-5 w-5" />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ArrowUpCircle className="h-5 w-5" />
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-ink-900">Record Stock Transaction</h3>
            <p className="text-xs text-ink-500">
              Real-time inventory receipt, site issue, and consumption tracking
            </p>
          </div>
        </div>
      }
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            isLoading={mutation.isPending}
            className={`flex items-center gap-1.5 ${
              isDeduction ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
            }`}
          >
            {isDeduction ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
            Confirm {watchedType}
          </Button>
        </div>
      }
    >
      {/* Material Status Strip */}
      {activeMaterial && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-subtle p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink-900">{activeMaterial.name}</p>
              <p className="text-xs text-ink-500">
                SKU: <span className="font-mono font-medium">{activeMaterial.materialCode}</span> · Category:{' '}
                {activeMaterial.category}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Current Stock</p>
              <p className="text-sm font-bold text-ink-900">
                {Number(activeMaterial.currentStock).toLocaleString()}{' '}
                <span className="text-xs font-normal text-ink-500">
                  {UNIT_LABEL_MAP[activeMaterial.unit] || activeMaterial.unit}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Std. Rate</p>
              <p className="text-sm font-bold text-emerald-600">
                ₹{Number(activeMaterial.standardRate).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {isOverdraft && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-50/50 p-2.5 text-xs text-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            <strong>Warning:</strong> Requested quantity ({numQty}) exceeds available stock ({curStock}).
            Backend will reject if insufficient inventory locks trigger.
          </span>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Material Selection (if not locked to one) */}
        {!material && allMaterials.length > 0 && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Target Material *</label>
            <select
              {...form.register('materialId', { required: 'Material selection is required.' })}
              className="w-full rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="">Select Material...</option>
              {allMaterials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.materialCode} - {m.name} (In stock: {m.currentStock} {UNIT_LABEL_MAP[m.unit] || m.unit})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Transaction Type & Quantity */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Transaction Type *</label>
            <select
              {...form.register('transactionType', { required: true })}
              className="w-full rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              {STOCK_TRANSACTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] text-ink-500">
              {watchedType === 'RECEIPT' && 'Inward stock delivery (GRN) from vendor'}
              {watchedType === 'ISSUE' && 'Store dispatch to specific WBS Activity / Contractor'}
              {watchedType === 'CONSUMPTION' && 'Actual material consumed on site against WBS'}
              {watchedType === 'WASTAGE' && 'Site wastage, scrap, or breakage tracking'}
              {watchedType === 'RETURN' && 'Unused material returned to central warehouse'}
              {watchedType === 'ADJUSTMENT' && 'Manual correction / stock count reconciliation'}
            </span>
          </div>

          <Input
            label={`Quantity * (${activeMaterial ? UNIT_LABEL_MAP[activeMaterial.unit] || activeMaterial.unit : 'Units'})`}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 50"
            error={form.formState.errors.quantity?.message}
            {...form.register('quantity', {
              required: 'Quantity is required.',
              min: { value: 0.01, message: 'Quantity must be positive.' },
            })}
          />
        </div>

        {/* Project & WBS Activity Linking */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Target Project *</label>
            <select
              {...form.register('projectId', { required: 'Project is required.' })}
              className="w-full rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              {projects.length > 0 ? (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code || `ID: ${p.id}`})
                  </option>
                ))
              ) : (
                <option value="1">Default Project (ID: 1)</option>
              )}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">
              WBS Work Package {watchedType === 'ISSUE' || watchedType === 'CONSUMPTION' ? '(Recommended)' : ''}
            </label>
            <select
              {...form.register('activityId')}
              className="w-full rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="">None / General Stock</option>
              {wbsActivities.map((w) => (
                <option key={w.id} value={w.id}>
                  [{w.code || w.wbsCode}] {w.name}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] text-ink-500">
              Links stock movement to schedule activity
            </span>
          </div>
        </div>

        {/* Site Section / Zone & Contractor */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Zone / Section"
            placeholder="e.g. Zone A - Tower 1, Floor 4"
            hint="Physical location where material is placed/used"
            {...form.register('zone')}
          />

          <Input
            label="Contractor ID"
            type="number"
            placeholder="e.g. 42"
            hint="For contractor allocations or subcontracts"
            {...form.register('contractorId')}
          />
        </div>

        {/* Unit Price & Reference ID */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Unit Rate (₹)"
            type="number"
            min="0"
            step="0.01"
            placeholder={`Default: ₹${activeMaterial?.standardRate || '0'}`}
            hint="Rate at time of transaction"
            {...form.register('unitPrice')}
          />

          <Input
            label="Reference ID / Doc No."
            placeholder="e.g. GRN-2026-0812 / PO-1029 / ISS-401"
            hint="PO, Goods Receipt, or Work Order reference"
            {...form.register('referenceId')}
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-700">Remarks / Site Notes</label>
          <textarea
            rows={2}
            placeholder="Add context, vehicle number, delivery challan details, or inspection observations..."
            className="w-full rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none resize-none"
            {...form.register('remarks')}
          />
        </div>
      </form>
    </Modal>
  );
}
