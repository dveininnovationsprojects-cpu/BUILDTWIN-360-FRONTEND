import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input, Textarea, Select } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useAuthStore } from '@/context/authStore';
import { procurementApi } from '../api/procurementApi';
import { CheckCircle2, AlertTriangle, ShieldCheck, PackagePlus } from 'lucide-react';

export function RecordGrnModal({ open, onClose, defaultPo, purchaseOrders = [], materials = [], onSuccess }) {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const currentUser = useAuthStore((state) => state.user);

  const defaultGrnNumber = `GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const form = useForm({
    defaultValues: {
      grnNumber: defaultGrnNumber,
      poId: defaultPo ? String(defaultPo.id) : purchaseOrders[0]?.id ? String(purchaseOrders[0].id) : '',
      materialId: defaultPo?.materialId ? String(defaultPo.materialId) : materials[0]?.id ? String(materials[0].id) : '1',
      projectId: defaultPo?.projectId || 1,
      siteId: defaultPo?.siteId || 1,
      receivedQty: defaultPo?.orderedQty || 100,
      acceptedQty: defaultPo?.orderedQty || 100,
      rejectedQty: 0,
      rejectionReason: '',
      receivedBy: currentUser?.name || currentUser?.username || 'Site Storekeeper',
      deliveryEvidenceUrl: '',
      remarks: '',
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = form;

  const watchedPoId = watch('poId');
  const watchedReceivedQty = Number(watch('receivedQty') || 0);
  const watchedAcceptedQty = Number(watch('acceptedQty') || 0);
  const watchedRejectedQty = Number(watch('rejectedQty') || 0);
  const watchedMaterialId = watch('materialId');

  // Auto-populate when defaultPo changes
  useEffect(() => {
    if (defaultPo) {
      setValue('poId', String(defaultPo.id));
      if (defaultPo.materialId) {
        setValue('materialId', String(defaultPo.materialId));
      }
      if (defaultPo.orderedQty) {
        setValue('receivedQty', defaultPo.orderedQty);
        setValue('acceptedQty', defaultPo.orderedQty);
        setValue('rejectedQty', 0);
      }
    }
  }, [defaultPo, setValue]);

  // When PO changes, sync material if PO has materialId
  useEffect(() => {
    if (watchedPoId && purchaseOrders.length > 0) {
      const selectedPo = purchaseOrders.find((p) => String(p.id) === String(watchedPoId));
      if (selectedPo?.materialId) {
        setValue('materialId', String(selectedPo.materialId));
      }
      if (selectedPo?.orderedQty && (!watchedReceivedQty || watchedReceivedQty === 0)) {
        setValue('receivedQty', selectedPo.orderedQty);
        setValue('acceptedQty', selectedPo.orderedQty);
        setValue('rejectedQty', 0);
      }
    }
  }, [watchedPoId, purchaseOrders, setValue, watchedReceivedQty]);

  const selectedMaterial = materials.find((m) => String(m.id) === String(watchedMaterialId)) || materials[0];
  const unit = selectedMaterial?.unit || 'units';

  // Quick helper to auto-balance rejectedQty when accepted is modified
  const handleAcceptedChange = (e) => {
    const accepted = Number(e.target.value);
    if (!isNaN(accepted) && watchedReceivedQty >= accepted) {
      setValue('rejectedQty', Math.max(0, watchedReceivedQty - accepted));
    }
  };

  const handleReceivedChange = (e) => {
    const received = Number(e.target.value);
    if (!isNaN(received)) {
      setValue('acceptedQty', received);
      setValue('rejectedQty', 0);
    }
  };

  const isQuantitySumInvalid = watchedAcceptedQty + watchedRejectedQty > watchedReceivedQty;
  const isRejectionReasonMissing = watchedRejectedQty > 0 && !watch('rejectionReason')?.trim();

  const createGrnMutation = useMutation({
    mutationFn: (payload) => procurementApi.createGrn(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['grns'] });
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['stock-ledger'] });
      pushToast(
        `GRN ${data.grnNumber || 'Entry'} recorded successfully! ${data.acceptedQty || watchedAcceptedQty} ${unit} credited to stock ledger.`,
        'success'
      );
      reset();
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to record Goods Receipt Note.', 'error');
    },
  });

  const onSubmit = (values) => {
    if (isQuantitySumInvalid) {
      pushToast('Accepted and Rejected quantities cannot exceed Total Received quantity.', 'error');
      return;
    }
    if (isRejectionReasonMissing) {
      pushToast('Please provide a rejection reason for the damaged / rejected quantity.', 'error');
      return;
    }

    createGrnMutation.mutate({
      ...values,
      receivedQty: Number(values.receivedQty),
      acceptedQty: Number(values.acceptedQty),
      rejectedQty: Number(values.rejectedQty || 0),
      poId: Number(values.poId),
      materialId: Number(values.materialId),
    });
  };

  const poOptions = purchaseOrders.map((po) => ({
    value: String(po.id),
    label: `${po.poNumber || `PO-${po.id}`} — ${po.supplier || 'Vendor'} (${po.materialName || 'Material'})`,
  }));

  const materialOptions = materials.map((m) => ({
    value: String(m.id),
    label: `${m.name || m.materialCode} (${m.unit || 'units'})`,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Goods Receipt Note (GRN)"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={createGrnMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            isLoading={createGrnMutation.isPending}
            disabled={isQuantitySumInvalid || isRejectionReasonMissing}
          >
            <PackagePlus className="w-4 h-4 mr-1.5 inline" />
            Accept & Inward Stock
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-ink-900">
        {/* Informational Integration Callout */}
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-brand-50 border border-brand-200 text-xs text-brand-900 leading-relaxed">
          <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-brand-950">Automated Inventory Integration (FR-053): </span>
            Recording this GRN will automatically verify physical delivery against the PO, increase warehouse stock by the
            <strong className="text-status-success font-semibold"> accepted quantity</strong>, and generate an immutable
            <code className="px-1 py-0.5 bg-brand-100/70 rounded text-brand-800 font-mono text-[11px] ml-1">RECEIPT</code> entry in the Stock Ledger.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="GRN Reference Number *"
            placeholder="e.g. GRN-2026-0812"
            {...register('grnNumber', { required: 'GRN number is required' })}
            error={errors.grnNumber?.message}
          />

          <Select
            label="Linked Purchase Order (PO) *"
            options={poOptions.length > 0 ? poOptions : [{ value: '1', label: 'PO-2026-001 — UltraTech Cement' }]}
            {...register('poId', { required: 'Purchase Order is required' })}
            error={errors.poId?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Material Received *"
            options={materialOptions.length > 0 ? materialOptions : [{ value: '1', label: 'Coromandel OPC Cement 50kg (BAGS)' }]}
            {...register('materialId', { required: 'Material is required' })}
            error={errors.materialId?.message}
          />

          <Input
            label="Received By (Inspector / Storekeeper) *"
            placeholder="e.g. Ramesh Site Storekeeper"
            {...register('receivedBy', { required: 'Inspector name is required' })}
            error={errors.receivedBy?.message}
          />
        </div>

        {/* Quantities Section */}
        <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-ink-900">Delivery Quantity Verification</h4>
            <span className="text-xs text-ink-500 font-medium">Unit: <strong className="text-ink-800">{unit}</strong></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Received Qty *"
              type="number"
              step="any"
              min="0"
              {...register('receivedQty', {
                required: 'Received quantity is required',
                min: { value: 0.01, message: 'Must be greater than 0' },
                onChange: handleReceivedChange,
              })}
              error={errors.receivedQty?.message}
            />

            <Input
              label="Accepted Qty *"
              type="number"
              step="any"
              min="0"
              {...register('acceptedQty', {
                required: 'Accepted quantity is required',
                min: { value: 0, message: 'Cannot be negative' },
                onChange: handleAcceptedChange,
              })}
              error={errors.acceptedQty?.message}
            />

            <Input
              label="Rejected Qty"
              type="number"
              step="any"
              min="0"
              {...register('rejectedQty', {
                min: { value: 0, message: 'Cannot be negative' },
              })}
              error={errors.rejectedQty?.message}
            />
          </div>

          {/* Validation Feedback */}
          {isQuantitySumInvalid && (
            <div className="flex items-center gap-2 text-xs text-status-danger font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Sum of Accepted ({watchedAcceptedQty}) + Rejected ({watchedRejectedQty}) exceeds Total Received ({watchedReceivedQty})!</span>
            </div>
          )}

          {!isQuantitySumInvalid && watchedAcceptedQty > 0 && (
            <div className="flex items-center gap-2 text-xs text-status-success font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                <strong>+{watchedAcceptedQty} {unit}</strong> will be immediately credited to live available inventory.
              </span>
            </div>
          )}
        </div>

        {/* Rejection Reason (Required if rejectedQty > 0) */}
        {watchedRejectedQty > 0 && (
          <Textarea
            label="Rejection Reason *"
            placeholder="e.g. 15 bags damaged due to water leakage in transit / off-spec aggregate size"
            rows={2}
            {...register('rejectionReason', {
              required: watchedRejectedQty > 0 ? 'Rejection reason is required when items are rejected' : false,
            })}
            error={errors.rejectionReason?.message}
          />
        )}

        <Input
          label="Delivery Evidence URL / Challan Reference"
          placeholder="e.g. Delivery challan scan link or LR-99201"
          {...register('deliveryEvidenceUrl')}
        />
      </form>
    </Modal>
  );
}
