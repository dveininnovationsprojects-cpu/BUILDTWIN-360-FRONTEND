import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  FileCheck2,
  Package,
} from 'lucide-react';
import { Modal, Button, Input } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { stockLedgerApi, UNIT_LABEL_MAP } from '../api/materialsInventoryApi';
import { projectsApi } from '@/modules/projects/api/projectsApi';
import { useAuthStore } from '@/context/authStore';

export function StockReconciliationModal({
  open,
  onClose,
  material = null,
  allMaterials = [],
  defaultProjectId = 1,
  onSuccess,
}) {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);
  const currentUser = useAuthStore((s) => s.user);
  const [auditResult, setAuditResult] = useState(null);

  const form = useForm({
    defaultValues: {
      materialId: material?.id ? String(material.id) : '',
      projectId: String(defaultProjectId || 1),
      physicalQty: '',
      auditedBy: currentUser?.fullName || currentUser?.username || 'Stock_Auditor',
      remarks: '',
    },
  });

  const selectedMatId = form.watch('materialId');
  const watchedPhysical = form.watch('physicalQty');

  const activeMaterial =
    material || allMaterials.find((m) => String(m.id) === String(selectedMatId)) || null;

  useEffect(() => {
    if (open) {
      setAuditResult(null);
      form.reset({
        materialId: material?.id ? String(material.id) : allMaterials[0]?.id ? String(allMaterials[0].id) : '',
        projectId: String(defaultProjectId || 1),
        physicalQty: '',
        auditedBy: currentUser?.fullName || currentUser?.username || 'Stock_Auditor',
        remarks: '',
      });
    }
  }, [open, material, defaultProjectId, currentUser]);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-dropdown-list'],
    queryFn: () => projectsApi.list(),
    enabled: open,
    staleTime: 60_000,
  });

  const currentSystemStock = Number(activeMaterial?.currentStock ?? 0);
  const enteredPhysical = watchedPhysical !== '' && !isNaN(Number(watchedPhysical)) ? Number(watchedPhysical) : null;
  const variance = enteredPhysical !== null ? enteredPhysical - currentSystemStock : null;

  const reconcileMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        materialId: Number(values.materialId || activeMaterial?.id),
        projectId: Number(values.projectId || 1),
        physicalQty: Number(values.physicalQty),
        auditedBy: values.auditedBy?.trim() || 'Auditor',
        remarks: values.remarks?.trim() || null,
      };
      return stockLedgerApi.reconcile(payload);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['materials-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['materials-low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['materials-reorder-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['stock-ledger-all'] });
      if (activeMaterial?.id) {
        queryClient.invalidateQueries({ queryKey: ['stock-ledger-material', activeMaterial.id] });
      }
      setAuditResult(result);
      pushToast('Stock reconciliation audit recorded successfully.', 'success');
      onSuccess?.(result);
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to complete stock reconciliation audit.', 'error');
    },
  });

  const onSubmit = (values) => {
    if (!values.materialId && !activeMaterial?.id) {
      pushToast('Please select a material to audit.', 'error');
      return;
    }
    if (values.physicalQty === '' || Number(values.physicalQty) < 0) {
      form.setError('physicalQty', { type: 'min', message: 'Physical count cannot be negative.' });
      return;
    }
    reconcileMutation.mutate(values);
  };

  const unitLabel = activeMaterial ? UNIT_LABEL_MAP[activeMaterial.unit] || activeMaterial.unit : '';

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!reconcileMutation.isPending) onClose();
      }}
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink-900">Physical Stock Reconciliation</h3>
            <p className="text-xs text-ink-500">
              Compares physical inventory count against system ledger and generates audit adjustments
            </p>
          </div>
        </div>
      }
      size="md"
      footer={
        auditResult ? (
          <div className="flex w-full items-center justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between gap-2">
            <Button variant="outline" onClick={onClose} disabled={reconcileMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              isLoading={reconcileMutation.isPending}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <FileCheck2 className="h-4 w-4" />
              Commit Reconciliation
            </Button>
          </div>
        )
      }
    >
      {/* If reconciliation was committed, show outcome summary */}
      {auditResult ? (
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-4 dark:bg-emerald-950/20">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-ink-900">Reconciliation Audit Logged</h4>
              <p className="text-xs text-ink-500">
                System stock updated and adjustment transaction created.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-surface-border bg-surface-subtle p-3.5 text-xs sm:grid-cols-3">
            <div>
              <p className="text-ink-500 uppercase tracking-wider text-[10px] font-semibold">Material</p>
              <p className="font-bold text-ink-900">{auditResult.materialName || activeMaterial?.name}</p>
              <p className="text-ink-400 font-mono">{auditResult.materialCode || activeMaterial?.materialCode}</p>
            </div>
            <div>
              <p className="text-ink-500 uppercase tracking-wider text-[10px] font-semibold">Previous System Stock</p>
              <p className="font-bold text-ink-900">{auditResult.systemStock} {unitLabel}</p>
            </div>
            <div>
              <p className="text-ink-500 uppercase tracking-wider text-[10px] font-semibold">Physical Count</p>
              <p className="font-bold text-ink-900">{auditResult.physicalStock} {unitLabel}</p>
            </div>
            <div>
              <p className="text-ink-500 uppercase tracking-wider text-[10px] font-semibold">Calculated Variance</p>
              <p
                className={`font-bold ${
                  Number(auditResult.variance) === 0
                    ? 'text-status-success'
                    : Number(auditResult.variance) > 0
                    ? 'text-brand-600'
                    : 'text-status-danger'
                }`}
              >
                {Number(auditResult.variance) > 0 ? `+${auditResult.variance}` : auditResult.variance} {unitLabel}
              </p>
            </div>
            <div>
              <p className="text-ink-500 uppercase tracking-wider text-[10px] font-semibold">Audit Adjustment ID</p>
              <p className="font-mono font-bold text-indigo-600">#{auditResult.adjustmentTransactionId || '-'}</p>
            </div>
            <div>
              <p className="text-ink-500 uppercase tracking-wider text-[10px] font-semibold">Audited By</p>
              <p className="font-medium text-ink-900">{auditResult.auditedBy || 'Auditor'}</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 py-1">
          {/* Material Info Card */}
          {activeMaterial && (
            <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-subtle p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-900">{activeMaterial.name}</p>
                  <p className="text-xs text-ink-500 font-mono">{activeMaterial.materialCode}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Current Ledger Stock</p>
                <p className="text-base font-bold text-ink-900">
                  {currentSystemStock.toLocaleString()} <span className="text-xs font-normal text-ink-500">{unitLabel}</span>
                </p>
              </div>
            </div>
          )}

          {!material && allMaterials.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-700">Select Material to Audit *</label>
              <select
                {...form.register('materialId', { required: 'Material selection is required.' })}
                className="w-full rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select Material...</option>
                {allMaterials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.materialCode} - {m.name} (Ledger Stock: {m.currentStock} {UNIT_LABEL_MAP[m.unit] || m.unit})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-700">Project *</label>
              <select
                {...form.register('projectId', { required: true })}
                className="w-full rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
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

            <Input
              label={`Physical Stock Count * (${unitLabel})`}
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 180"
              hint="Actual physical count on site / yard"
              error={form.formState.errors.physicalQty?.message}
              {...form.register('physicalQty', {
                required: 'Physical stock count is required.',
                min: { value: 0, message: 'Cannot be negative.' },
              })}
            />
          </div>

          {/* Variance Preview Banner */}
          {variance !== null && (
            <div
              className={`flex items-center justify-between rounded-xl border p-3.5 text-xs ${
                variance === 0
                  ? 'border-status-success/30 bg-status-successBg text-status-success'
                  : variance > 0
                  ? 'border-brand-500/30 bg-brand-50/50 text-brand-800 dark:bg-brand-950/20 dark:text-brand-300'
                  : 'border-status-danger/30 bg-status-dangerBg text-status-danger'
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {variance === 0 ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : variance > 0 ? (
                  <TrendingUp className="h-4 w-4 shrink-0" />
                ) : (
                  <TrendingDown className="h-4 w-4 shrink-0" />
                )}
                <span>
                  {variance === 0
                    ? 'Perfect Balance: Physical count matches system ledger exactly.'
                    : variance > 0
                    ? `Surplus Detected: Physical count is higher by +${variance} ${unitLabel}.`
                    : `Shortage / Deficit: Physical count is lower by ${variance} ${unitLabel}.`}
                </span>
              </div>
              <div className="text-right font-bold text-sm">
                Variance: {variance > 0 ? `+${variance}` : variance}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Auditor Name *"
              placeholder="e.g. Auditor_Ramesh"
              error={form.formState.errors.auditedBy?.message}
              {...form.register('auditedBy', { required: 'Auditor name is required.' })}
            />

            <Input
              label="Remarks / Audit Findings"
              placeholder="e.g. Found damaged bags due to water seepage"
              {...form.register('remarks')}
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
