import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Save } from 'lucide-react';
import { Modal, Button, Input } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { materialsInventoryApi, MATERIAL_UNITS } from '../api/materialsInventoryApi';

const DEFAULT_CATEGORIES = [
  'CEMENT',
  'STEEL',
  'AGGREGATE',
  'BRICKS',
  'CONCRETE',
  'SAND',
  'TILES',
  'PLUMBING',
  'ELECTRICAL',
  'PAINT',
  'HARDWARE',
  'TIMBER',
  'GLASS',
  'OTHER',
];

export function MaterialFormModal({ open, onClose, material = null, onSuccess }) {
  const isEdit = Boolean(material?.id);
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

  useEffect(() => {
    if (material) {
      form.reset({
        materialCode: material.materialCode || material.code || '',
        name: material.name || '',
        category: (material.category || '').toUpperCase(),
        unit: material.unit || 'BAGS',
        standardRate: material.standardRate != null ? String(material.standardRate) : '',
        reorderLevel: material.reorderLevel != null ? String(material.reorderLevel) : '',
        description: material.description || '',
      });
    } else {
      form.reset({
        materialCode: '',
        name: '',
        category: '',
        unit: 'BAGS',
        standardRate: '',
        reorderLevel: '',
        description: '',
      });
    }
  }, [material, form, open]);

  const mutation = useMutation({
    mutationFn: async (values) => {
      if (isEdit) {
        return materialsInventoryApi.update(material.id, {
          name: values.name.trim(),
          category: values.category.trim().toUpperCase(),
          unit: values.unit,
          standardRate: Number(values.standardRate),
          reorderLevel: values.reorderLevel !== '' ? Number(values.reorderLevel) : null,
          description: values.description?.trim() || null,
        });
      } else {
        return materialsInventoryApi.create({
          materialCode: values.materialCode.trim().toUpperCase(),
          name: values.name.trim(),
          category: values.category.trim().toUpperCase(),
          unit: values.unit,
          standardRate: Number(values.standardRate),
          reorderLevel: values.reorderLevel !== '' ? Number(values.reorderLevel) : null,
          description: values.description?.trim() || null,
        });
      }
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['materials-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['materials-low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['materials-reorder-alerts'] });
      if (saved?.id) {
        queryClient.invalidateQueries({ queryKey: ['material-detail', saved.id] });
      }
      pushToast(
        isEdit ? `Material "${saved.name}" updated successfully.` : `Material "${saved.name}" added to catalog.`,
        'success'
      );
      form.reset();
      onSuccess?.(saved);
      onClose();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to save material. Please verify input data.', 'error');
    },
  });

  const onSubmit = (values) => {
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink-900">
              {isEdit ? 'Edit Material Catalog Item' : 'Add New Material to Catalog'}
            </h3>
            <p className="text-xs text-ink-500">
              {isEdit ? `SKU: ${material?.materialCode}` : 'Registers a new SKU with rate and reorder threshold'}
            </p>
          </div>
        </div>
      }
      size="md"
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            isLoading={mutation.isPending}
            className="flex items-center gap-1.5"
          >
            {isEdit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isEdit ? 'Save Changes' : 'Create Material'}
          </Button>
        </div>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 py-1">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Material SKU Code *"
            placeholder="e.g. MAT-CEM-53"
            disabled={isEdit}
            hint={isEdit ? 'SKU Code cannot be altered' : 'Unique identifier for inventory'}
            error={form.formState.errors.materialCode?.message}
            {...form.register('materialCode', {
              required: !isEdit ? 'Material code is required.' : false,
              pattern: !isEdit
                ? {
                    value: /^[A-Za-z0-9_-]+$/,
                    message: 'Code can only contain letters, numbers, hyphens, and underscores.',
                  }
                : undefined,
            })}
          />

          <Input
            label="Material Name *"
            placeholder="e.g. OPC 53 Grade Cement"
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
              <option value="">Select Category...</option>
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {form.formState.errors.category && (
              <p className="mt-1 text-xs text-status-danger">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Standard Unit *</label>
            <select
              {...form.register('unit', { required: 'Unit of measure is required.' })}
              className="w-full rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              {MATERIAL_UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label} ({u.value})
                </option>
              ))}
            </select>
            {form.formState.errors.unit && (
              <p className="mt-1 text-xs text-status-danger">{form.formState.errors.unit.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Standard Rate (₹) *"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 380.00"
            hint="Unit price in INR"
            error={form.formState.errors.standardRate?.message}
            {...form.register('standardRate', {
              required: 'Standard rate is required.',
              min: { value: 0.01, message: 'Rate must be positive.' },
            })}
          />

          <Input
            label="Reorder Threshold"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 100"
            hint="Low stock alert trigger quantity"
            error={form.formState.errors.reorderLevel?.message}
            {...form.register('reorderLevel')}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-700">
            Specification / Description
          </label>
          <textarea
            rows={3}
            placeholder="e.g. IS 8112 OPC 53 Grade - 50kg bags (UltraTech / Dalmia)"
            className="w-full rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none resize-none"
            {...form.register('description')}
          />
        </div>
      </form>
    </Modal>
  );
}
